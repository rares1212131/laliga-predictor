import pandas as pd
import joblib
import random
from sqlalchemy import create_engine, text
import os
import sys
import io

# Fix for Windows Console Encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_URL = "postgresql://postgres:Raresblanabomba1234567890+@localhost:5432/predictor"
engine = create_engine(DB_URL)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "outcome_model.pkl")

def run_simulation(iterations=5000):
    print("Starting Season Simulation Engine...")
    if not os.path.exists(MODEL_PATH):
        print("Error: Model file missing.")
        return
    
    model = joblib.load(MODEL_PATH)

    # 1. Get Current Standings
    query = text("""
        SELECT t.id, COALESCE(SUM(CASE 
            WHEN m.final_result = 'H' AND m.home_team_id = t.id THEN 3
            WHEN m.final_result = 'A' AND m.away_team_id = t.id THEN 3
            WHEN m.final_result = 'D' THEN 1 ELSE 0 END), 0) as points
        FROM teams t
        LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.status = 'FINISHED'
        GROUP BY t.id
    """)
    current_standings = pd.read_sql(query, engine).set_index('id')['points'].to_dict()

    # 2. Get Remaining Matches
    rem_matches = pd.read_sql("SELECT id, home_team_id, away_team_id, matchweek FROM matches WHERE status = 'SCHEDULED'", engine)
    if rem_matches.empty: return
    
    # Label history with the upcoming week
    target_mw = int(rem_matches['matchweek'].min())

    # 3. Predict once for speed
    match_probs = []
    feats = ['home_form', 'away_form', 'h2h_wins', 'home_avg_gs', 'home_avg_gc', 'away_avg_gs', 'away_avg_gc', 'form_diff', 'gs_diff', 'gc_diff']
    for _, row in rem_matches.iterrows():
        dummy_x = pd.DataFrame([[5, 5, 0, 1.4, 1.2, 1.4, 1.2, 0, 0, 0]], columns=feats)
        match_probs.append({'h': int(row['home_team_id']), 'a': int(row['away_team_id']), 'p': model.predict_proba(dummy_x)[0]})

    # 4. Monte Carlo
    win_counts = {t_id: 0 for t_id in current_standings.keys()}
    for _ in range(iterations):
        table = current_standings.copy()
        for m in match_probs:
            res = random.choices(['H', 'D', 'A'], weights=m['p'])[0]
            if res == 'H': table[m['h']] += 3
            elif res == 'A': table[m['a']] += 3
            else: table[m['h']] += 1; table[m['a']] += 1
        win_counts[max(table, key=table.get)] += 1

    # 5. Save Results
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
    print("Simulation Complete.")

if __name__ == "__main__":
    run_simulation()