import React, { useState, useEffect } from 'react';
import api from '../api/api';
import matchService from '../services/matchService'; 
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { WeekPicker } from './admin/components/WeekPicker'; 
import { UserMatchCard } from '../components/UserMatchCard';
import { PerformanceView } from './admin/components/PerformanceView';
import { LeaderboardView } from './leaderboard/LeaderboardView';
import './Arena.css';

export function Arena() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { hash } = useLocation();
    const navigate = useNavigate();

    const urlWeek = searchParams.get('week');
    
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actualCurrentWeek, setActualCurrentWeek] = useState(null);

    const isPerformanceView = hash === '#performance';
    const isLeaderboardView = hash === '#leaderboard';
    const isFixturesView = !isPerformanceView && !isLeaderboardView;

    useEffect(() => {
        let isMounted = true;
        const initializeWeek = async () => {
            try {
                const res = await matchService.getCurrentWeek();
                if (isMounted) {
                    setActualCurrentWeek(res.data);
                    if (!urlWeek && isFixturesView) {
                        setSearchParams({ week: res.data.toString() }, { replace: true });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch current week:", err);
                if (isMounted) {
                    setActualCurrentWeek(1);
                    if (isFixturesView) setSearchParams({ week: '1' }, { replace: true });
                }
            }
        };
        initializeWeek();
        return () => { isMounted = false; };
    }, [urlWeek, isFixturesView, setSearchParams]);
    useEffect(() => {
        
        if (isFixturesView && !urlWeek) return;

        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (isPerformanceView) {
                    const res = await api.get('/performance');
                    if (isMounted) setStats(res.data);
                } else if (isFixturesView) {
                    const matchRes = await api.get(`/matches?week=${urlWeek}`);
                    if (isMounted) setMatches(matchRes.data);
                }
            } catch (err) {
                console.error("Arena Data Fetch Error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [urlWeek, isPerformanceView, isFixturesView]);

    const handleWeekChange = (newWeek) => {
        setSearchParams({ week: newWeek });
    };

    return (
        <div className="arena-page">
            <Header />
            <div className="arena-content-body" style={{ marginTop: '40px' }}>
                
                {isFixturesView && urlWeek && (
                    <div className="arena-header-minimal" style={{ marginBottom: '30px' }}>
                        <div className="picker-container">
                            <WeekPicker 
                                currentWeek={parseInt(urlWeek)} 
                                onWeekChange={handleWeekChange} 
                            />
                        </div>
                    </div>
                )}

                {loading && !isLeaderboardView ? (
                    <div className="arena-loader">
                        <div className="spinner"></div>
                        <p>SYNCHRONIZING AI DATA...</p>
                    </div>
                ) : (
                    <div className="arena-content">
                        {isLeaderboardView ? (
                            <LeaderboardView />
                        ) : isPerformanceView ? (
                            <PerformanceView stats={stats} />
                        ) : (
                            <div className="arena-grid">
                                {matches.length > 0 ? (
                                    matches.map(m => (
                                        <UserMatchCard 
                                            key={m.id} 
                                            match={m} 
                                            actualCurrentWeek={actualCurrentWeek}
                                            onClick={() => navigate(`/match/${m.id}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        No fixtures found for Matchweek {urlWeek}.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}