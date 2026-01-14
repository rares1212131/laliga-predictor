import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import './LeaderboardView.css';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, 
    ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

export function LeaderboardView() {
    const [data, setData] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [lbRes, histRes] = await Promise.all([
                    api.get('/simulation/leaderboard'),
                    api.get('/simulation/history')
                ]);
                setData(lbRes.data);
                setHistory(histRes.data);
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="arena-loader">
                <div className="spinner"></div>
                <p>CALCULATING LIVE STANDINGS & AI PROJECTIONS...</p>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-grid">
                <div className="standings-block">
                    <div className="leaderboard-header-info">
                        <h2>SEASON <span className="highlight">GOVERNANCE</span></h2>
                        <p>Real-world points aggregated with AI Monte Carlo simulations.</p>
                    </div>

                    <table className="arena-table leaderboard-table">
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>TEAM</th>
                                <th className="text-center">PTS</th>
                                <th className="text-right">CHAMPION ODDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((team, index) => {
                                const trend = team.winProbability - team.prevProbability;
                                return (
                                    <tr key={team.teamName} className={index < 4 ? 'ucl-zone' : ''}>
                                        <td className="rank-cell">#{index + 1}</td>
                                        <td className="team-cell">
                                            <div className="team-info-wrap">
                                                <img 
                                                    src={`/logos/${team.teamName}.svg`} 
                                                    alt="" 
                                                    onError={(e) => e.target.src='/logos/default.svg'} 
                                                />
                                                <span>{team.teamName}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="current-pts-val">{team.currentPoints}</span>
                                        </td>
                                        <td className="text-right">
                                            <div className="odds-wrap">
                                                <span className="prob-pct">{team.winProbability.toFixed(1)}%</span>
                                                {trend !== 0 && (
                                                    <span className={`trend-tag ${trend > 0 ? 'up' : 'down'}`}>
                                                        {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="chart-block">
                    <div className="chart-card">
                        <h3>CHAMPIONSHIP ODDS PROGRESSION</h3>
                        <p className="chart-subtitle">Probability shifts tracked by matchweek snapshots</p>
                        
                        <div className="chart-wrapper" style={{ width: '100%', height: 400, marginTop: '30px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                        dataKey="matchweek" 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        label={{ value: 'MATCHWEEK', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        domain={[0, 100]}
                                    />
                                    <Tooltip 
                                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Real Madrid" stroke="#00ff88" strokeWidth={3} dot={{ r: 4, fill: '#00ff88' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Barcelona" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                    <Line type="monotone" dataKey="Atletico Madrid" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                                    <Line type="monotone" dataKey="Villarreal" stroke="#eab308" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Sevilla" stroke="#a855f7" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}