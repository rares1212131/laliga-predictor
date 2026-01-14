import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Settings, ShieldCheck, LayoutGrid, BarChart3, Trophy } from 'lucide-react';
import { EditProfileModal } from '../modals/EditProfileModal';
import './Header.css';

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isPerformance = location.hash === '#performance';
    const isLeaderboard = location.hash === '#leaderboard';
    const isFixtures = !isPerformance && !isLeaderboard;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="arena-navbar">
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/dashboard" className="nav-logo">
                        THE <span className="highlight">ARENA</span>
                    </Link>

                    <div className="nav-tabs">
                        <Link 
                            to="/dashboard" 
                            className={`nav-tab ${isFixtures ? 'active' : ''}`}
                        >
                            <LayoutGrid size={16} /> FIXTURES
                        </Link>
                        
                        <Link 
                            to="/dashboard#leaderboard" 
                            className={`nav-tab ${isLeaderboard ? 'active' : ''}`}
                        >
                            <Trophy size={16} /> LEADERBOARD
                        </Link>

                        <Link 
                            to="/dashboard#performance" 
                            className={`nav-tab ${isPerformance ? 'active' : ''}`}
                        >
                            <BarChart3 size={16} /> PERFORMANCE
                        </Link>
                    </div>
                </div>

                <div className="nav-right">
                    {isAdmin && (
                        <Link to="/admin" className="engine-room-link">
                            <ShieldCheck size={16} />
                            ENGINE ROOM
                        </Link>
                    )}

                    <div className="user-menu-container" ref={dropdownRef}>
                        <button className="avatar-circle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <User size={20} color="#fff" />
                        </button>

                        {isDropdownOpen && (
                            <div className="nav-dropdown">
                                <div className="dropdown-user-info">
                                    <p className="d-name">{user?.firstName} {user?.lastName}</p>
                                    <p className="d-email">{user?.email}</p>
                                </div>
                                <div className="dropdown-divider" />
                                
                                <button className="dropdown-btn" onClick={() => { setIsEditModalOpen(true); setIsDropdownOpen(false); }}>
                                    <Settings size={16} /> Edit Account
                                </button>
                                
                                <button className="dropdown-btn logout" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
            />
        </nav>
    );
}