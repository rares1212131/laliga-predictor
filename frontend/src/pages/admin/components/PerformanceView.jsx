import React from 'react';
import { Target, Zap, Flame, TrendingUp } from 'lucide-react';

export function PerformanceView({ stats }) {
    if (!stats) {
        return <div className="admin-loading">Calculating engine metrics...</div>;
    }

    const cards = [
        {
            label: "OUTCOME ACCURACY",
            value: stats.overallAccuracy,
            icon: <Target size={20} />,
            color: "#10b981",
            desc: "Correct H/D/A Predictions"
        },
        {
            label: "BTTS HIT RATE",
            value: stats.bttsAccuracy,
            icon: <Zap size={20} />,
            color: "#3b82f6",
            desc: "Both Teams To Score"
        },
        {
            label: "OVER 2.5 GOALS",
            value: stats.over25Accuracy,
            icon: <TrendingUp size={20} />,
            color: "#8b5cf6",
            desc: "3+ Total Match Goals"
        },
        {
            label: "UPSET SUCCESS",
            value: stats.upsetSuccessRate,
            icon: <Flame size={20} />,
            color: "#f59e0b",
            desc: "Underdog Victory Alerts"
        }
    ];

    return (
        <div className="performance-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>
                    AI MODEL <span style={{ color: '#10b981' }}>TRACK RECORD</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                    Real-time accuracy based on {stats.totalPredicted} analyzed matches this season.
                </p>
            </div>
            
            
            <div className="stats-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {cards.map((card, i) => (
                    <div key={i} className="stat-card" style={{ borderTop: `4px solid ${card.color}`, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '15px', right: '15px', color: card.color, opacity: 0.5 }}>
                            {card.icon}
                        </div>
                        <label className="mw-text" style={{ fontSize: '10px' }}>{card.label}</label>
                        <div className="value" style={{ color: card.color }}>
                            {card.value.toFixed(1)}%
                        </div>
                        <p className="stat-sub" style={{ fontSize: '11px', marginTop: '5px' }}>{card.desc}</p>
                    </div>
                ))}
            </div>

                        <div style={{ marginTop: '60px' }}>
                <h3 className="tab-title" style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                    RECENT BACKTESTING LOGS
                </h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>MATCH EVENT</th>
                            <th className="text-center">AI PREDICTION</th>
                            <th className="text-center">ACTUAL RESULT</th>
                            <th className="text-center">VERDICT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentResults.length > 0 ? (
                            stats.recentResults.map((r, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700 }}>{r.matchName}</td>
                                    <td className="text-center">
                                        <span className="ai-tag">{r.aiPrediction}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="actual-tag">{r.actualResult}</span>
                                    </td>
                                    <td className="text-center">
                                        {r.correct ? (
                                            <span className="status-badge FINISHED" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '5px 12px', borderRadius: '6px' }}>
                                                ✅ HIT
                                            </span>
                                        ) : (
                                            <span className="status-badge SCHEDULED" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '5px 12px', borderRadius: '6px' }}>
                                                ❌ MISS
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
                                    No historical data available for the current model version.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}