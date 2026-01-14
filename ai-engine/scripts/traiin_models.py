import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os


def train():
    data_path = os.path.join('..', 'data', 'laliga_processed_data.csv')
    if not os.path.exists(data_path): return
    df = pd.read_csv(data_path)

    # UPDATED FEATURE LIST
    features = [
        'home_form', 'away_form', 'h2h_wins',
        'home_avg_gs', 'home_avg_gc',
        'away_avg_gs', 'away_avg_gc',
        'form_diff', 'gs_diff', 'gc_diff'
    ]
    X = df[features]

    tasks = {'outcome_model': df['result'], 'btts_model': df['btts'], 'over_under_model': df['over_2_5']}

    if not os.path.exists('../models'): os.makedirs('../models')

    print("--- Training Final Professional Models ---")
    for model_name, y in tasks.items():
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Increased trees to 200 and added min_samples_leaf to prevent "over-learning" noise
        model = RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=42)
        model.fit(X_train, y_train)

        print(f"✅ {model_name} Accuracy: {model.score(X_test, y_test):.2%}")
        joblib.dump(model, f'../models/{model_name}.pkl')

    print("--- Training Complete! ---")


if __name__ == "__main__":
    train()