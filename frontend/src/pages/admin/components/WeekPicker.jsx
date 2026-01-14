import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function WeekPicker({ currentWeek, onWeekChange }) {
    return (
        <div className="week-picker">
            <button 
                disabled={currentWeek <= 1} 
                onClick={() => onWeekChange(currentWeek - 1)}
                className="picker-btn"
            >
                <ChevronLeft size={20} />
            </button>
            
            <div className="picker-label">
                <span className="mw-text">MATCHWEEK</span>
                <span className="mw-number">{currentWeek}</span>
            </div>

            <button 
                disabled={currentWeek >= 38} 
                onClick={() => onWeekChange(currentWeek + 1)}
                className="picker-btn"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}