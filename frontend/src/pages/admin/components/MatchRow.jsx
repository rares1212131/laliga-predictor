import React, { useState } from 'react';

export function MatchRow({ m, onSave }) {
    const [h, setH] = useState(m.homeGoals ?? "");
    const [a, setA] = useState(m.awayGoals ?? "");

    const isFinished = m.status === 'FINISHED';

    return (
        <tr className={isFinished ? 'row-finished' : 'row-scheduled'}>
            <td className="time-cell">
                {new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </td>

            <td className="text-right team-name">
                {m.homeTeamName}
            </td>

            <td className="score-cell">
                <input 
                    type="number" 
                    value={h} 
                    onChange={e => setH(e.target.value)} 
                    placeholder="-"
                    className="admin-score-input"
                />
                <span className="separator">:</span>
                <input 
                    type="number" 
                    value={a} 
                    onChange={e => setA(e.target.value)} 
                    placeholder="-"
                    className="admin-score-input"
                />
            </td>

            <td className="text-left team-name">
                {m.awayTeamName}
            </td>

            <td>
                <span className={`status-badge ${m.status}`}>
                    {m.status}
                </span>
            </td>

            <td>
                <button 
                    className="update-btn"
                    onClick={() => onSave(m.id, h, a)}
                >
                    Update
                </button>
            </td>
        </tr>
    );
}