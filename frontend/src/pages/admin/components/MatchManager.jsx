import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { WeekPicker } from './WeekPicker';
import { MatchRow } from './MatchRow';

export function MatchManager() {
    const [week, setWeek] = useState(16); 
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const res = await adminService.getMatchesByWeek(week);
                const data = res.data.content || res.data;
                setMatches(data);
            } catch (err) {
                console.error("Error loading matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [week]); 

    const handleSave = async (id, h, a) => {
        try {
            await adminService.updateMatchResult(id, h, a);
            const res = await adminService.getMatchesByWeek(week);
            setMatches(res.data.content || res.data);
        } catch (err) {
            alert("Error saving result: " + (err.response?.data?.error || "Server error"));
        }
    };

    return (
        <div className="manager-container">
            <WeekPicker currentWeek={week} onWeekChange={setWeek} />
            
            <div className="table-wrapper">
                {loading ? (
                    <div className="admin-loading">Synchronizing Matchweek {week}...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th className="text-right">Home Team</th>
                                <th className="text-center">Score</th>
                                <th className="text-left">Away Team</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length > 0 ? (
                                matches.map(m => (
                                    <MatchRow key={m.id} m={m} onSave={handleSave} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                                        No fixtures found for Matchweek {week}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}