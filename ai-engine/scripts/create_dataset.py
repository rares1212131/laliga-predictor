import pandas as pd
import glob
import os


def calculate_rolling_features(df, last_n=5):
    teams = pd.concat([df['HomeTeam'], df['AwayTeam']]).unique()
    team_history = {team: [] for team in teams}
    team_goals_scored = {team: [] for team in teams}
    team_goals_conceded = {team: [] for team in teams}
    h2h_history = {}

    home_form, away_form = [], []
    home_avg_gs, home_avg_gc = [], []
    away_avg_gs, away_avg_gc = [], []
    h2h_wins = []

    print("Processing matches to engineer features...")

    for i, row in df.iterrows():
        h_team, a_team = row['HomeTeam'], row['AwayTeam']

        # 1. Calculate features (Form & Goals)
        home_form.append(sum(team_history[h_team][-last_n:]))
        away_form.append(sum(team_history[a_team][-last_n:]))

        h_gs = sum(team_goals_scored[h_team][-last_n:]) / last_n if len(team_goals_scored[h_team]) >= last_n else 1.0
        h_gc = sum(team_goals_conceded[h_team][-last_n:]) / last_n if len(
            team_goals_conceded[h_team]) >= last_n else 1.0
        a_gs = sum(team_goals_scored[a_team][-last_n:]) / last_n if len(team_goals_scored[a_team]) >= last_n else 1.0
        a_gc = sum(team_goals_conceded[a_team][-last_n:]) / last_n if len(
            team_goals_conceded[a_team]) >= last_n else 1.0

        home_avg_gs.append(h_gs)
        home_avg_gc.append(h_gc)
        away_avg_gs.append(a_gs)
        away_avg_gc.append(a_gc)

        pair = tuple(sorted((h_team, a_team)))
        if pair not in h2h_history: h2h_history[pair] = []
        h2h_wins.append(h2h_history[pair][-last_n:].count(h_team))

        # 2. Update history for next match
        h_pts = 3 if row['FTR'] == 'H' else (1 if row['FTR'] == 'D' else 0)
        a_pts = 3 if row['FTR'] == 'A' else (1 if row['FTR'] == 'D' else 0)
        team_history[h_team].append(h_pts)
        team_history[a_team].append(a_pts)
        team_goals_scored[h_team].append(row['FTHG'])
        team_goals_conceded[h_team].append(row['FTAG'])
        team_goals_scored[a_team].append(row['FTAG'])
        team_goals_conceded[a_team].append(row['FTHG'])
        h2h_history[pair].append(h_team if row['FTR'] == 'H' else (a_team if row['FTR'] == 'A' else None))

    # Add the base features
    df['home_form'], df['away_form'] = home_form, away_form
    df['h2h_wins'] = h2h_wins
    df['home_avg_gs'], df['home_avg_gc'] = home_avg_gs, home_avg_gc
    df['away_avg_gs'], df['away_avg_gc'] = away_avg_gs, away_avg_gc

    # --- ADDING DIFFERENCE FEATURES (The Booster) ---
    df['form_diff'] = df['home_form'] - df['away_form']
    df['gs_diff'] = df['home_avg_gs'] - df['away_avg_gs']
    df['gc_diff'] = df['home_avg_gc'] - df['away_avg_gc']

    return df


def run_pipeline():
    data_path = os.path.join('..', 'data', '*.csv')
    files = [f for f in glob.glob(data_path) if 'laliga_processed_data' not in f]
    all_data = []
    for f in files:
        temp_df = pd.read_csv(f)
        temp_df = temp_df[['Date', 'HomeTeam', 'AwayTeam', 'FTHG', 'FTAG', 'FTR']]
        all_data.append(temp_df)

    df = pd.concat(all_data)
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
    df = df.sort_values('Date')
    df['btts'] = ((df['FTHG'] > 0) & (df['FTAG'] > 0)).astype(int)
    df['over_2_5'] = ((df['FTHG'] + df['FTAG']) >= 3).astype(int)
    df['result'] = df['FTR'].map({'H': 0, 'D': 1, 'A': 2})

    df = calculate_rolling_features(df)
    output_path = os.path.join('..', 'data', 'laliga_processed_data.csv')
    df.dropna(subset=['result'], inplace=True)
    df.to_csv(output_path, index=False)
    print(f"✅ Master file created with Booster Features.")


if __name__ == "__main__":
    run_pipeline()