import React from 'react';
import './DeveloperCard.css';
import devImage from '../assets/developer.jpg';

const DeveloperCard = () => {
    return (
        <div className="developer-card-container">
            <div className="dev-card-content">
                <div className="dev-card-image">
                    <img src={devImage} alt="Karthik Krishnan GS" />
                </div>
                <div className="dev-card-info">
                    <h2>Karthik Krishnan GS</h2>
                    <div className="dev-divider"></div>
                    <p>Design & Development</p>
                </div>
            </div>
            <a href="https://www.karthikkrishnan.dev/" target="_blank" rel="noopener noreferrer" className="dev-portfolio-btn">
                Visit Portfolio
            </a>
        </div>
    );
};

export default DeveloperCard;