import React from 'react';

export function UserMatchCard({ match, actualCurrentWeek, onClick }) {
    const p = match.prediction;
    const isFinished = match.status === 'FINISHED';
    const isFutureWeek = match.matchweek > actualCurrentWeek;

    const getVerdict = () => {
        if (!p || !match.finalResult) return null;
        const probs = { "H": p.homeWinProb, "D": p.drawProb, "A": p.awayWinProb };
        const aiChoice = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
        return aiChoice === match.finalResult ? "HIT" : "MISS";
    };

    const verdict = getVerdict();
    const hProb = (p?.homeWinProb * 100) || 33;
    const dProb = (p?.drawProb * 100) || 34;
    const aProb = (p?.awayWinProb * 100) || 33;

    const totalVotes = (match.homeVotes || 0) + (match.drawVotes || 0) + (match.awayVotes || 0);
    const fanH = totalVotes > 0 ? (match.homeVotes / totalVotes) * 100 : 33;
    const fanD = totalVotes > 0 ? (match.drawVotes / totalVotes) * 100 : 34;
    const fanA = totalVotes > 0 ? (match.awayVotes / totalVotes) * 100 : 33;

    if (isFinished) {
        return (
            <div className="arena-card finished" onClick={onClick}>
                <div className="card-top">
                    <span className="match-time">FINAL RESULT</span>
                    <span className={`verdict-tag ${verdict?.toLowerCase()}`}>
                        {verdict === "HIT" ? "✅ AI HIT" : "❌ AI MISS"}
                    </span>
                </div>

                <div className="teams-container result-view">
                    <div className="team-box">
                        <img src={`/logos/${match.homeTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                        <span className="name">{match.homeTeamName}</span>
                    </div>
                    
                    <div className="score-display">
                        <span className="score-num">{match.homeGoals}</span>
                        <span className="score-divider">-</span>
                        <span className="score-num">{match.awayGoals}</span>
                    </div>

                    <div className="team-box">
                        <img src={`/logos/${match.awayTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                        <span className="name">{match.awayTeamName}</span>
                    </div>
                </div>

                <div className="ai-review-zone">
                    <div className="review-row">
                        <span className="label">AI Predicted:</span>
                        <span className="val">
                            {p?.homeWinProb > p?.awayWinProb && p?.homeWinProb > p?.drawProb ? "Home Win" : 
                             p?.awayWinProb > p?.homeWinProb && p?.awayWinProb > p?.drawProb ? "Away Win" : "Draw"}
                        </span>
                    </div>
                </div>
                <div className="card-overlay"><span>VIEW PERFORMANCE AUDIT</span></div>
            </div>
        );
    }

    return (
        <div className="arena-card" onClick={onClick}>
            <div className="card-top">
                <span className="match-time">
                    {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {p?.upsetAlert && !isFutureWeek && <span className="upset-tag">🔥 UPSET ALERT</span>}
            </div>

            <div className="teams-container">
                <div className="team-box">
                    <img src={`/logos/${match.homeTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                    <span className="name">{match.homeTeamName}</span>
                </div>
                <div className="vs-badge">VS</div>
                <div className="team-box">
                    <img src={`/logos/${match.awayTeamName}.svg`} alt="" onError={(e) => e.target.src='/logos/default.svg'} />
                    <span className="name">{match.awayTeamName}</span>
                </div>
            </div>

            <div className="ai-visual">
                <div className="prob-text">
                    <span className="mini-label">AI MODEL</span>
                    <span>{!isFutureWeek ? `${hProb.toFixed(0)}% - ${dProb.toFixed(0)}% - ${aProb.toFixed(0)}%` : '---'}</span>
                </div>
                <div className="multi-bar">
                    <div className="bar-seg home" style={{ width: `${!isFutureWeek ? hProb : 33.3}%` }}></div>
                    <div className="bar-seg draw" style={{ width: `${!isFutureWeek ? dProb : 33.4}%` }}></div>
                    <div className="bar-seg away" style={{ width: `${!isFutureWeek ? aProb : 33.3}%` }}></div>
                </div>
            </div>

            <div className="fan-visual" style={{ marginTop: '15px' }}>
                <div className="prob-text" style={{ opacity: 0.6 }}>
                    <span className="mini-label">FANS {!isFutureWeek && `(${totalVotes})`}</span>
                    <span>{!isFutureWeek ? `${fanH.toFixed(0)}% / ${fanD.toFixed(0)}% / ${fanA.toFixed(0)}%` : 'POLL OPENING SOON'}</span>
                </div>
                <div className="multi-bar" style={{ height: '4px', background: '#111' }}>
                    {!isFutureWeek ? (
                        <>
                            <div className="bar-seg home" style={{ width: `${fanH}%`, opacity: 0.5 }}></div>
                            <div className="bar-seg draw" style={{ width: `${fanD}%`, opacity: 0.5 }}></div>
                            <div className="bar-seg away" style={{ width: `${fanA}%`, opacity: 0.5 }}></div>
                        </>
                    ) : (
                        <div className="bar-seg" style={{ width: '100%', background: '#222' }}></div>
                    )}
                </div>
            </div>

            <div className="card-bottom">
                <div className="info-group">
                    <span className="meta-label">CONFIDENCE</span>
                    <span className="meta-value accent">
                        {!isFutureWeek && p ? `${(p.confidence * 100).toFixed(0)}%` : '---'}
                    </span>
                </div>
                <div className="info-group text-right">
                    <span className="meta-label">STATUS</span>
                    <span className="meta-value">{isFutureWeek ? 'UPCOMING' : 'SCHEDULED'}</span>
                </div>
            </div>
            <div className="card-overlay"><span>{isFutureWeek ? 'VIEW PREVIEW' : 'VOTE & VIEW ANALYSIS'}</span></div>
        </div>
    );
}