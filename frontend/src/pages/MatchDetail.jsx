import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matchService from '../services/matchService';
import { Header } from '../components/layout/Header';
import './MatchDetail.css';

export function MatchDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);

    const loadMatchData = useCallback(() => {
        matchService.getMatchDetails(id)
            .then(res => {
                setData(res.data);
                setVoted(res.data.userHasVoted); 
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading match details:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        loadMatchData();
    }, [loadMatchData]);

    const handleVote = (choice) => {
        setVoted(true);
        
        matchService.vote(id, choice).then(() => {
            loadMatchData();
        }).catch(err => {
            console.error("Vote failed", err);
            alert("Failed to save vote. Please try again.");
            setVoted(false);
        });
    };

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
    if (!data) return <div className="error-screen"><h2>Match data not found.</h2></div>;

    const { 
        homeForm, awayForm, prediction, firstLeg, 
        homeTeamName, awayTeamName, status, 
        homeGoals, awayGoals, finalResult 
    } = data;
    
    const isFinished = status?.toUpperCase() === 'FINISHED';

    const getAiOutcomePick = () => {
        if (!prediction) return null;
        const probs = { "H": prediction.homeWinProb, "D": prediction.drawProb, "A": prediction.awayWinProb };
        return Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    };
    const aiPick = getAiOutcomePick();

    const hVotes = data.homeVotes || 0;
    const dVotes = data.drawVotes || 0;
    const aVotes = data.awayVotes || 0;
    const totalVotes = hVotes + dVotes + aVotes;
    
    const hPct = totalVotes > 0 ? Math.round((hVotes / totalVotes) * 100) : 0;
    const dPct = totalVotes > 0 ? Math.round((dVotes / totalVotes) * 100) : 0;
    const aPct = totalVotes > 0 ? Math.round((aVotes / totalVotes) * 100) : 0;

    const audit = isFinished && prediction ? {
        outcome: {
            isHit: aiPick === finalResult,
            label: aiPick === 'H' ? 'Home Win' : aiPick === 'A' ? 'Away Win' : 'Draw'
        },
        btts: {
            predicted: prediction.bttsProb > 0.5,
            actual: homeGoals > 0 && awayGoals > 0,
            isHit: (prediction.bttsProb > 0.5) === (homeGoals > 0 && awayGoals > 0)
        },
        over25: {
            predicted: prediction.over25Prob > 0.5,
            actual: (homeGoals + awayGoals) >= 3,
            isHit: (prediction.over25Prob > 0.5) === ((homeGoals + awayGoals) >= 3)
        }
    } : null;

    const getFormStatus = (m, teamName) => {
        if (m.finalResult === 'D') return 'draw';
        const wasHome = m.homeTeamName === teamName;
        return ((wasHome && m.finalResult === 'H') || (!wasHome && m.finalResult === 'A')) ? 'win' : 'loss';
    };

    return (
        <>
            <Header />
            <div className="detail-page">
                <button className="back-btn" onClick={() => navigate(-1)}>← BACK TO ARENA</button>

                <div className="match-header-hero">
                    <div className="hero-team">
                        <img src={`/logos/${homeTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                        <h2 className="team-title">{homeTeamName}</h2>
                        {aiPick === 'H' && !isFinished && <span className="fav-tag">AI FAVORITE</span>}
                    </div>

                    <div className="hero-center">
                        {isFinished ? (
                            <div className="final-score-container">
                                <div className="score-big">{homeGoals}</div>
                                <div className="score-sep">-</div>
                                <div className="score-big">{awayGoals}</div>
                            </div>
                        ) : (
                            <div className="vs-box">
                                <div className="vs-text">VS</div>
                                {prediction && (
                                    <div className="prob-mini-row">
                                        <span className="h">{(prediction.homeWinProb * 100).toFixed(0)}%</span>
                                        <span className="d">{(prediction.drawProb * 100).toFixed(0)}%</span>
                                        <span className="a">{(prediction.awayWinProb * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hero-team">
                        <img src={`/logos/${awayTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                        <h2 className="team-title">{awayTeamName}</h2>
                        {aiPick === 'A' && !isFinished && <span className="fav-tag">AI FAVORITE</span>}
                    </div>
                </div>

                {isFinished ? (
                    <div className="post-match-audit">
                        <div className="audit-header-title">POST-MATCH AI PERFORMANCE AUDIT</div>
                        {prediction ? (
                            <div className="audit-grid">
                                <div className={`audit-item ${audit.outcome.isHit ? 'hit' : 'miss'}`}>
                                    <label>OUTCOME</label>
                                    <div className="val">AI Predicted: <strong>{audit.outcome.label}</strong></div>
                                    <div className="verdict-label">{audit.outcome.isHit ? '✅ HIT' : '❌ MISS'}</div>
                                </div>
                                <div className={`audit-item ${audit.btts.isHit ? 'hit' : 'miss'}`}>
                                    <label>BTTS</label>
                                    <div className="val">AI Predicted: <strong>{audit.btts.predicted ? 'YES' : 'NO'}</strong></div>
                                    <div className="verdict-label">{audit.btts.isHit ? '✅ HIT' : '❌ MISS'}</div>
                                </div>
                                <div className={`audit-item ${audit.over25.isHit ? 'hit' : 'miss'}`}>
                                    <label>OVER 2.5</label>
                                    <div className="val">AI Predicted: <strong>{audit.over25.predicted ? 'YES' : 'NO'}</strong></div>
                                    <div className="verdict-label">{audit.over25.isHit ? '✅ HIT' : '❌ MISS'}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="pending-box">No AI prediction data recorded for this match.</div>
                        )}
                    </div>
                ) : (
                    <div className="insight-container">
                        {!prediction ? (
                            <div className="pending-box">
                                <h3>AI ENGINE STANDBY</h3>
                                <p>Insights will generate once the previous matchweek is completed.</p>
                            </div>
                        ) : (
                            <>
                                <div className="insight-header">
                                    <span className="ai-badge-small">AI ANALYST INSIGHT</span>
                                    <div className="confidence-pill">{(prediction.confidence * 100).toFixed(0)}% CONFIDENCE</div>
                                </div>
                                <p className="rationale-text">"{prediction.rationale}"</p>
                                
                                <div className="market-badges">
                                    <div className={`market-tag ${prediction.bttsProb > 0.5 ? 'yes' : 'no'}`}>
                                        BTTS: {prediction.bttsProb > 0.5 ? 'YES' : 'NO'} ({(prediction.bttsProb * 100).toFixed(0)}%)
                                    </div>
                                    <div className={`market-tag ${prediction.over25Prob > 0.5 ? 'yes' : 'no'}`}>
                                        OVER 2.5: {prediction.over25Prob > 0.5 ? 'YES' : 'NO'} ({(prediction.over25Prob * 100).toFixed(0)}%)
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="form-comparison-grid">
                    <div className="form-card">
                        <h3>{homeTeamName} ROLLING FORM <small>(Last 5)</small></h3>
                        <div className="dots-row">
                            {homeForm.map(m => (
                                <div key={m.id} className={`form-dot ${getFormStatus(m, homeTeamName)}`}>
                                    {getFormStatus(m, homeTeamName).charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="form-card">
                        <h3>{awayTeamName} ROLLING FORM <small>(Last 5)</small></h3>
                        <div className="dots-row">
                            {awayForm.map(m => (
                                <div key={m.id} className={`form-dot ${getFormStatus(m, awayTeamName)}`}>
                                    {getFormStatus(m, awayTeamName).charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {firstLeg && (
                    <div className="first-leg-banner">
                        <div className="banner-label">PREVIOUS MEETING THIS SEASON (Matchweek {firstLeg.matchweek})</div>
                        <div className="banner-content">
                            <span>{firstLeg.homeTeamName}</span>
                            <div className="leg-score">{firstLeg.homeGoals} - {firstLeg.awayGoals}</div>
                            <span>{firstLeg.awayTeamName}</span>
                        </div>
                    </div>
                )}

                {!isFinished && prediction && (
                    <div className="vote-container" style={{ marginTop: '60px' }}>
                        <h3>COMMUNITY PREDICTION POLL</h3>
                        {!voted ? (
                            <div className="vote-options">
                                <button className="v-btn" onClick={() => handleVote('H')}>HOME WIN</button>
                                <button className="v-btn" onClick={() => handleVote('D')}>DRAW</button>
                                <button className="v-btn" onClick={() => handleVote('A')}>AWAY WIN</button>
                            </div>
                        ) : (
                            <div className="voted-results-view" style={{ maxWidth: '600px', margin: '40px auto' }}>
                                <div className="prob-text" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginBottom: '10px' }}>
                                    <span>HOME {hPct}%</span>
                                    <span>DRAW {dPct}%</span>
                                    <span>AWAY {aPct}%</span>
                                </div>
                                <div className="multi-bar" style={{ height: '12px', background: '#111', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                                    <div className="bar-seg home" style={{ width: `${hPct}%`, background: '#00ff88' }}></div>
                                    <div className="bar-seg draw" style={{ width: `${dPct}%`, background: '#64748b' }}></div>
                                    <div className="bar-seg away" style={{ width: `${aPct}%`, background: '#ff4d4d' }}></div>
                                </div>
                                <p style={{ color: '#00ff88', fontWeight: 800, marginTop: '20px', fontSize: '12px' }}>
                                    ✓ VOTE RECORDED. DATA SYNCHRONIZED WITH {totalVotes} FANS.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}