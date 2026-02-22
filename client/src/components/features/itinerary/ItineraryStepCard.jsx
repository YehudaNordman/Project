import React from 'react';

/**
 * ItineraryStepCard Component
 * renders a single itinerary step in a premium bento-box glassmorphism style.
 * 
 * @param {Object} data - The itinerary step JSON object
 * @param {string} data.title - Attraction Name & Location
 * @param {string} data.hours - Activity Hours
 * @param {string} data.description - Why it's worth visiting
 * @param {string} data.transport - Travel time info
 * @param {string} data.food - Nearby restaurant recommendation
 */
const ItineraryStepCard = ({ data }) => {
    if (!data) return null;

    const { title, hours, description, transport, food } = data;

    return (
        <div className="itinerary-step-card animate-in">
            {/* Background Blur Effect */}
            <div className="glass-overlay"></div>

            <div className="card-header-bento">
                <div className="title-section">
                    <span className="step-tag">ACTIVITY</span>
                    <h3 className="step-title">{title}</h3>
                </div>
                <div className="hours-badge-premium">
                    <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{hours}</span>
                </div>
            </div>

            <div className="card-description-bento">
                <p>{description}</p>
            </div>

            <div className="card-footer-bento-grid">
                <div className="footer-item transport-cell">
                    <div className="item-icon-wrapper blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"></path>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    </div>
                    <div className="item-details">
                        <span className="item-label">Transport</span>
                        <span className="item-value">{transport}</span>
                    </div>
                </div>

                <div className="footer-item food-cell">
                    <div className="item-icon-wrapper teal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"></path>
                            <path d="M10 19v-3l4-1 5 1a3 3 0 0 1 2 4v2"></path>
                            <line x1="9" y1="7" x2="11" y2="7"></line>
                            <line x1="9" y1="11" x2="11" y2="11"></line>
                        </svg>
                    </div>
                    <div className="item-details">
                        <span className="item-label">Dining</span>
                        <span className="item-value">{food}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItineraryStepCard;
