import pandas as pd
import joblib
from sqlalchemy import create_engine, text
import os
import sys

# 1. Database Configuration
DB_URL = "postgresql://postgres:Raresblanabomba1234567890+@localhost:5432/predictor"
engine = create_engine(DB_URL)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")

FEATURES = [
    'home_form', 'away_form', 'h2h_wins',
    'home_avg_gs', 'home_avg_gc',
    'away_avg_gs', 'away_avg_gc',
    'form_diff', 'gs_diff', 'gc_diff'
]

def fetch_history_at_timestamp(target_week):
    # To prevent "cheating", we only fetch matches that happened BEFORE the target week
    query = text("""
        SELECT m.id, m.utc_date as "Date", t1.name as "HomeTeam", t2.name as "AwayTeam", 
               m.home_goals as "FTHG", m.away_goals as "FTAG", m.final_result as "FTR"
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        WHERE m.status = 'FINISHED' AND m.matchweek < :week
        ORDER BY m.utc_date ASC
    """)
    return pd.read_sql(query, engine, params={"week": target_week})

def fetch_matches_to_predict(target_week):
    # Fetch ALL matches for the week, finished or not, so we can backfill
    query = text("""
        SELECT m.id, t1.name as "HomeTeam", t2.name as "AwayTeam"
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        WHERE m.matchweek = :week
    """)
    return pd.read_sql(query, engine, params={"week": target_week})

def calculate_features(history_df, target_df, last_n=5):
    teams = pd.concat([history_df['HomeTeam'] if not history_df.empty else pd.Series([]), 
                       history_df['AwayTeam'] if not history_df.empty else pd.Series([])]).unique()
    team_history = {team: [] for team in teams}
    team_gs = {team: [] for team in teams}
    team_gc = {team: [] for team in teams}

    for _, row in history_df.iterrows():
        h, a = row['HomeTeam'], row['AwayTeam']
        h_pts = 3 if row['FTR'] == 'H' else (1 if row['FTR'] == 'D' else 0)
        a_pts = 3 if row['FTR'] == 'A' else (1 if row['FTR'] == 'D' else 0)
        team_history[h].append(h_pts); team_history[a].append(a_pts)
        team_gs[h].append(row['FTHG']); team_gc[h].append(row['FTAG'])
        team_gs[a].append(row['FTAG']); team_gc[a].append(row['FTHG'])

    features_list = []
    for _, row in target_df.iterrows():
        h, a = row['HomeTeam'], row['AwayTeam']
        h_f = sum(team_history[h][-last_n:]) if h in team_history else 0
        a_f = sum(team_history[a][-last_n:]) if a in team_history else 0
        h_gs_avg = sum(team_gs[h][-last_n:])/last_n if (h in team_gs and len(team_gs[h])>0) else 1.0
        a_gs_avg = sum(team_gs[a][-last_n:])/last_n if (a in team_gs and len(team_gs[a])>0) else 1.0
        h_gc_avg = sum(team_gc[h][-last_n:])/last_n if (h in team_gc and len(team_gc[h])>0) else 1.0
        a_gc_avg = sum(team_gc[a][-last_n:])/last_n if (a in team_gc and len(team_gc[a])>0) else 1.0

        features_list.append([
            h_f, a_f, 0, h_gs_avg, h_gc_avg, a_gs_avg, a_gc_avg,
            h_f - a_f, h_gs_avg - a_gs_avg, h_gc_avg - a_gc_avg
        ])
    return features_list

def run(target_week):
    print(f"AI Engine: Processing Matchweek {target_week}...")
    outcome_model = joblib.load(os.path.join(MODELS_DIR, 'outcome_model.pkl'))
    btts_model = joblib.load(os.path.join(MODELS_DIR, 'btts_model.pkl'))
    over_under_model = joblib.load(os.path.join(MODELS_DIR, 'over_under_model.pkl'))

    history = fetch_history_at_timestamp(target_week)
    target_matches = fetch_matches_to_predict(target_week)

    if target_matches.empty:
        print(f"No matches found for week {target_week}.")
        return

    X_list = calculate_features(history, target_matches)

    upsert_query = text("""
        INSERT INTO predictions (match_id, home_win_prob, draw_prob, away_win_prob, btts_prob, over25prob, confidence, upset_alert, rationale, generated_at)
        VALUES (:match_id, :home_win_prob, :draw_prob, :away_win_prob, :btts_prob, :over25prob, :confidence, :upset_alert, :rationale, NOW())
        ON CONFLICT (match_id) DO UPDATE SET
            home_win_prob=EXCLUDED.home_win_prob, draw_prob=EXCLUDED.draw_prob, away_win_prob=EXCLUDED.away_win_prob, 
            btts_prob=EXCLUDED.btts_prob, over25prob=EXCLUDED.over25prob, confidence=EXCLUDED.confidence, 
            upset_alert=EXCLUDED.upset_alert, rationale=EXCLUDED.rationale, generated_at=NOW();
    """)

    for i, match_id in enumerate(target_matches['id']):
        X_df = pd.DataFrame([X_list[i]], columns=FEATURES)
        probs = outcome_model.predict_proba(X_df)[0]
        btts_p = btts_model.predict_proba(X_df)[0][1]
        over_p = over_under_model.predict_proba(X_df)[0][1]
        conf = (max(probs) - (1/3)) / (1 - (1/3))
        upset = bool(probs[2] > probs[0])
        rat = f"Based on historical data up to MW{target_week-1}, {target_matches.iloc[i]['HomeTeam']} form is {X_list[i][0]} pts."

        with engine.begin() as conn:
            conn.execute(upsert_query, {
                "match_id": int(match_id), "home_win_prob": float(probs[0]), "draw_prob": float(probs[1]),
                "away_win_prob": float(probs[2]), "btts_prob": float(btts_p), "over25prob": float(over_p),
                "confidence": float(conf), "upset_alert": upset, "rationale": rat
            })
    print(f"AI Engine: Successfully backfilled MW {target_week}.")

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run(int(sys.argv[1]))