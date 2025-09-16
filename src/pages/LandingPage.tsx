import React from 'react';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
    return (
        <div className="home-page">
            <div className="home-header">
                <h1 className="home-title">
                    Home
                </h1>
            </div>

            <div className="home-content">
                <p>Welcome to Loan Visualizer</p>
            </div>
        </div>
    );
};