import os
import joblib
import pandas as pd
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise ValueError(" FATAL: DB_URL environment variable is not set. Please create a .env file locally or set the variable on Render.")
engine = create_engine(DB_URL)

app = FastAPI(title="LaLiga AI Engine")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

models = {}
FEATURES = [
    'home_form', 'away_form', 'h2h_wins',
    'home_avg_gs', 'home_avg_gc',
    'away_avg_gs', 'away_avg_gc',
    'form_diff', 'gs_diff', 'gc_diff'
]

@app.on_event("startup")
def load_ai_models():
    print(" AI Engine: Loading models...")
    try:
        models['outcome'] = joblib.load(os.path.join(MODELS_DIR, 'outcome_model.pkl'))
        models['btts'] = joblib.load(os.path.join(MODELS_DIR, 'btts_model.pkl'))
        models['over_under'] = joblib.load(os.path.join(MODELS_DIR, 'over_under_model.pkl'))
        print("✅ Models loaded successfully!")
    except Exception as e:
        print(f" CRITICAL ERROR: Could not load models. {e}")

def calculate_features(history_df, target_df, last_n=5):

    teams = pd.concat([history_df['HomeTeam'] if not history_df.empty else pd.Series(dtype='object'), 
                       history_df['AwayTeam'] if not history_df.empty else pd.Series(dtype='object')]).unique()
    
    team_history = {team: [] for team in teams}
    team_gs = {team: [] for team in teams}
    team_gc = {team: [] for team in teams}
    h2h_history = {}

    for _, row in history_df.iterrows():
        h, a = row['HomeTeam'], row['AwayTeam']

        h_pts = 3 if row['FTR'] == 'H' else (1 if row['FTR'] == 'D' else 0)
        a_pts = 3 if row['FTR'] == 'A' else (1 if row['FTR'] == 'D' else 0)

        if h in team_history: 
            team_history[h].append(h_pts)
            team_gs[h].append(row['FTHG'])
            team_gc[h].append(row['FTAG'])
        
        if a in team_history:
            team_history[a].append(a_pts)
            team_gs[a].append(row['FTAG'])
            team_gc[a].append(row['FTHG'])

        pair = tuple(sorted((h, a)))
        if pair not in h2h_history: h2h_history[pair] = []
        h2h_history[pair].append(h if row['FTR'] == 'H' else (a if row['FTR'] == 'A' else None))

    features_list = []

    for _, row in target_df.iterrows():
        h, a = row['HomeTeam'], row['AwayTeam']

        h_f = sum(team_history[h][-last_n:]) if h in team_history else 0
        a_f = sum(team_history[a][-last_n:]) if a in team_history else 0
        
        h_gs_avg = sum(team_gs[h][-last_n:])/last_n if (h in team_gs and len(team_gs[h]) >= last_n) else 1.0
        a_gs_avg = sum(team_gs[a][-last_n:])/last_n if (a in team_gs and len(team_gs[a]) >= last_n) else 1.0
        
        h_gc_avg = sum(team_gc[h][-last_n:])/last_n if (h in team_gc and len(team_gc[h]) >= last_n) else 1.0
        a_gc_avg = sum(team_gc[a][-last_n:])/last_n if (a in team_gc and len(team_gc[a]) >= last_n) else 1.0

        pair = tuple(sorted((h, a)))
        h2h_wins = h2h_history[pair][-last_n:].count(h) if pair in h2h_history else 0

        form_diff = h_f - a_f
        gs_diff = h_gs_avg - a_gs_avg
        gc_diff = h_gc_avg - a_gc_avg

        features_list.append([
            h_f, a_f, h2h_wins, 
            h_gs_avg, h_gc_avg, 
            a_gs_avg, a_gc_avg,
            form_diff, gs_diff, gc_diff
        ])
        
    return features_list


class PredictRequest(BaseModel):
    target_week: int

@app.get("/")
def home():
    return {"status": "running", "models": list(models.keys())}

@app.post("/predict-week")
def predict_week(req: PredictRequest):

    week = req.target_week
    print(f"🔮 Received request to predict Matchweek {week}")


    history_query = text("""
        SELECT m.id, m.utc_date as "Date", t1.name as "HomeTeam", t2.name as "AwayTeam", 
               m.home_goals as "FTHG", m.away_goals as "FTAG", m.final_result as "FTR"
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        WHERE m.status = 'FINISHED' AND m.matchweek < :week
        ORDER BY m.utc_date ASC
    """)
    
    target_query = text("""
        SELECT m.id, t1.name as "HomeTeam", t2.name as "AwayTeam"
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        WHERE m.matchweek = :week
    """)

    with engine.connect() as conn:
        history_df = pd.read_sql(history_query, conn, params={"week": week})
        target_df = pd.read_sql(target_query, conn, params={"week": week})

    if target_df.empty:
        return {"message": f"No matches found for week {week}"}

    X_list = calculate_features(history_df, target_df)

    upsert_query = text("""
        INSERT INTO predictions (match_id, home_win_prob, draw_prob, away_win_prob, btts_prob, over25prob, confidence, upset_alert, rationale, generated_at)
        VALUES (:match_id, :home_win_prob, :draw_prob, :away_win_prob, :btts_prob, :over25prob, :confidence, :upset_alert, :rationale, NOW())
        ON CONFLICT (match_id) DO UPDATE SET
            home_win_prob=EXCLUDED.home_win_prob, draw_prob=EXCLUDED.draw_prob, away_win_prob=EXCLUDED.away_win_prob, 
            btts_prob=EXCLUDED.btts_prob, over25prob=EXCLUDED.over25prob, confidence=EXCLUDED.confidence, 
            upset_alert=EXCLUDED.upset_alert, rationale=EXCLUDED.rationale, generated_at=NOW();
    """)

    with engine.begin() as conn:
        for i, match_id in enumerate(target_df['id']):
            X_row = pd.DataFrame([X_list[i]], columns=FEATURES)

            probs = models['outcome'].predict_proba(X_row)[0]
            btts_p = models['btts'].predict_proba(X_row)[0][1]
            over_p = models['over_under'].predict_proba(X_row)[0][1]

            conf = (max(probs) - (1/3)) / (1 - (1/3))
            upset = bool(probs[2] > probs[0])

            rat = f"Home Form: {X_list[i][0]} pts vs Away Form: {X_list[i][1]} pts."

            conn.execute(upsert_query, {
                "match_id": int(match_id), "home_win_prob": float(probs[0]), "draw_prob": float(probs[1]),
                "away_win_prob": float(probs[2]), "btts_prob": float(btts_p), "over25prob": float(over_p),
                "confidence": float(conf), "upset_alert": upset, "rationale": rat
            })

    return {"status": "success", "predicted_count": len(target_df)}

@app.post("/simulate-season")
def simulate_season():

    print("🎲 Starting Season Simulation...")


    query = text("""
        SELECT t.id, COALESCE(SUM(CASE 
            WHEN m.final_result = 'H' AND m.home_team_id = t.id THEN 3
            WHEN m.final_result = 'A' AND m.away_team_id = t.id THEN 3
            WHEN m.final_result = 'D' THEN 1 ELSE 0 END), 0) as points
        FROM teams t
        LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.status = 'FINISHED'
        GROUP BY t.id
    """)
    
    with engine.connect() as conn:
        standings_df = pd.read_sql(query, conn)
        rem_matches = pd.read_sql("SELECT id, home_team_id, away_team_id, matchweek FROM matches WHERE status = 'SCHEDULED'", conn)

    if rem_matches.empty:
        return {"message": "No remaining matches to simulate."}

    current_standings = standings_df.set_index('id')['points'].to_dict()
    target_mw = int(rem_matches['matchweek'].min())


    match_probs = []
    dummy_x = pd.DataFrame([[5, 5, 0, 1.4, 1.2, 1.4, 1.2, 0, 0, 0]], columns=FEATURES)
    
    for _, row in rem_matches.iterrows():

        p = models['outcome'].predict_proba(dummy_x)[0]
        match_probs.append({'h': int(row['home_team_id']), 'a': int(row['away_team_id']), 'p': p})

    iterations = 2000
    win_counts = {t_id: 0 for t_id in current_standings.keys()}

    for _ in range(iterations):
        table = current_standings.copy()
        for m in match_probs:
            res = random.choices(['H', 'D', 'A'], weights=m['p'])[0]
            if res == 'H': table[m['h']] += 3
            elif res == 'A': table[m['a']] += 3
            else: 
                table[m['h']] += 1
                table[m['a']] += 1
        
        winner = max(table, key=table.get)
        win_counts[winner] += 1

    with engine.begin() as conn:
        for t_id, wins in win_counts.items():
            prob = (wins / iterations) * 100

            conn.execute(text("""
                INSERT INTO championship_odds (team_id, probability, previous_probability, updated_at)
                VALUES (:tid, :p, :p, NOW())
                ON CONFLICT (team_id) DO UPDATE SET 
                    previous_probability = championship_odds.probability,
                    probability = EXCLUDED.probability, updated_at = NOW()
            """), {"tid": t_id, "p": float(prob)})

            conn.execute(text("""
                INSERT INTO championship_odds_history (team_id, probability, matchweek, created_at)
                VALUES (:tid, :p, :mw, NOW())
            """), {"tid": t_id, "p": float(prob), "mw": target_mw})

    return {"status": "success", "message": "Simulation updated."}