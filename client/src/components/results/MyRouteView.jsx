import React from 'react';
import { useRoute } from '../../context/RouteContext';
import { translateCategory } from '../../utils/translationUtils';

const MyRouteView = ({ onBack }) => {
    const { myRoute, removeFromRoute, clearRoute } = useRoute();

    return (
        <div className="explorer-page animate-in">
            <div className="explorer-header glass">
                <button className="back-btn-simple" onClick={onBack}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 19 19 12 12 5"></polyline>
                    </svg>
                    חזור
                </button>
                <div className="header-text-group">
                    <h2>המסלול שלי 🛣️</h2>
                    <p>המקומות ששמרת לטיול שלך</p>
                </div>
                {myRoute.length > 0 && (
                    <button className="clear-route-btn" onClick={clearRoute}>
                        נקה הכל
                    </button>
                )}
            </div>

            <div className="explorer-content">
                {myRoute.length > 0 ? (
                    <div className="items-grid">
                        {myRoute.map((item, index) => (
                            <div key={index} className="item-card-premium glass">
                                {item.photoUrl && (
                                    <div className="item-card-image">
                                        <img src={item.photoUrl} alt={item.name} loading="lazy" />
                                        <div className="image-overlay-gradient"></div>
                                    </div>
                                )}
                                <div className="item-card-header">
                                    <div className="item-icon-circle-premium">
                                        {item.categories?.includes('Restaurant') ? '🍽️' : '🎡'}
                                    </div>
                                    <div className="item-rating-badge">
                                        ⭐ {item.rating || 'N/A'}
                                    </div>
                                </div>

                                <div className="item-info">
                                    <div className="item-title-row">
                                        <h4>{item.name || 'מקום ללא שם'}</h4>
                                    </div>
                                    <p className="item-address">
                                        <span className="icon-tiny">📍</span>
                                        {item.address_line2 || 'כתובת לא ידועה'}
                                    </p>
                                </div>

                                <div className="item-footer">
                                    <button
                                        className="remove-from-route-btn"
                                        onClick={() => removeFromRoute(item.place_id || item.name)}
                                    >
                                        הסר מהמסלול
                                    </button>
                                    <div className="button-group-dual">
                                        <a
                                            href={item.googleMapsUri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="item-action-btn maps-link-dual"
                                            style={{ width: '100%', gridColumn: 'span 2' }}
                                        >
                                            <span className="icon-btn">🗺️</span>
                                            ניווט בגוגל מפות
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results-msg glass">
                        <span className="no-results-icon">🗺️</span>
                        <p>המסלול שלך ריק. התחל להוסיף מקומות מההמלצות!</p>
                        <button className="retry-btn" onClick={onBack}>חזור להמלצות</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRouteView;
