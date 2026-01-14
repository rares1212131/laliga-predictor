import React, { useState, useCallback, useEffect } from 'react';
import adminService from '../../services/adminService';
import { Header } from '../../components/layout/Header';
import { MatchManager } from './components/MatchManager';
import UserManager from './components/UserManager';
import { PerformanceView } from './components/PerformanceView';
import './AdminDashboard.css';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('matches');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [lastWeek, setLastWeek] = useState(15);
    const [aiLoading, setAiLoading] = useState(false);

    const refreshData = useCallback(async () => {
        try {
            if (activeTab === 'users') {
                const res = await adminService.getUsers();
                setUsers(res.data);
            } else if (activeTab === 'performance') {
                const res = await adminService.getPerformance();
                setStats(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [activeTab]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleRunAI = async () => {
        const targetWeek = parseInt(lastWeek) + 1;
        setAiLoading(true);

        try {
            const checkRes = await adminService.checkPredictions(targetWeek);
            
            if (checkRes.data.exists) {
                const proceed = window.confirm(
                    `⚠️ Predictions for Matchweek ${targetWeek} already exist in the database.\n\n` +
                    `Running the engine now will overwrite them with new calculations based on Week ${lastWeek} results.\n\n` +
                    `Do you want to continue?`
                );
                
                if (!proceed) {
                    setAiLoading(false);
                    return;
                }
            }

            const res = await adminService.triggerAI(lastWeek);
            alert("Success: " + res.data.message);
            
        } catch (err) {
            console.error("AI Error:", err);
            alert(err.response?.data?.error || "AI Script Execution Failed.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="admin-page-wrapper">
            <Header />
            <div className="admin-page">
                <div className="admin-sidebar">
                    <div className="admin-logo">ENGINE<span>ROOM</span></div>
                    <nav className="admin-nav">
                        <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>Fixtures</button>
                        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
                        <button className={activeTab === 'performance' ? 'active' : ''} onClick={() => setActiveTab('performance')}>AI Accuracy</button>
                    </nav>

                    <div className="ai-trigger-box">
                        <label>Predict week based on results up to:</label>
                        <div className="trigger-input-group">
                            <span>MW</span>
                            <input type="number" value={lastWeek} onChange={e => setLastWeek(e.target.value)} />
                        </div>
                        <button onClick={handleRunAI} disabled={aiLoading} className="run-ai-btn">
                            {aiLoading ? "ENGINE RUNNING..." : "RUN AI ENGINE"}
                        </button>
                    </div>
                </div>

                <div className="admin-content">
                    {activeTab === 'matches' && <MatchManager />}
                    {activeTab === 'users' && <UserManager users={users} onUpdate={refreshData} />}
                    {activeTab === 'performance' && <PerformanceView stats={stats} />}
                </div>
            </div>
        </div>
    );
}