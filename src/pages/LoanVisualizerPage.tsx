import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { LoanVisualizer } from '../components/loan';
import './LoanVisualizerPage.css';

export const LoanVisualizerPage: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const { loans } = useAppSelector((state) => state.loans);

    const loan = loans.find(l => l.id === loanId);

    const handleBack = () => {
        navigate('/loans');
    };

    if (!loan) {
        return (
            <div className="loan-visualizer">
                <div className="visualizer-header">
                    <button className="back-button" onClick={handleBack}>
                        ← Back to Loans
                    </button>
                    <h1 className="visualizer-title">Loan Not Found</h1>
                </div>
                <div className="visualizer-content">
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>The requested loan could not be found.</p>
                        <button className="add-loan-button" onClick={handleBack}>
                            Return to Loans
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <LoanVisualizer loan={loan} onBack={handleBack} />;
};
