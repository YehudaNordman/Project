import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import ItineraryStepCard from '../itinerary/ItineraryStepCard';
import '../../../assets/styles/components/community.css';

const CommunityView = () => {
    const { user, token, openAuthModal } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({}); // To track which posts are showing the full plan
    const [showQuickComment, setShowQuickComment] = useState({}); // To track which posts have the quick comment input open

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/all`);
            const data = await res.json();
            setPosts(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleLike = async (id) => {
        if (!token) {
            openAuthModal("התחבר כדי לתת לייק למסלולים של אחרים");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/community/like/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (id) => {
        if (!token) {
            openAuthModal("התחבר כדי להגיב למסלולים");
            return;
        }
        const text = commentTexts[id];
        if (!text) return;

        try {
            const res = await fetch(`${API_BASE_URL}/community/comment/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                setCommentTexts({ ...commentTexts, [id]: '' });
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="loading-community" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '20px'
        }}>
            <div className="spinner" style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #1a237e',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ color: '#1a237e' }}>טוען את הקהילה...</h2>
        </div>
    );

    return (
        <div className="community-container animate-in">
            <header className="community-header glass">
                <h1>קהילת <span className="logo-accent">BonusTrip</span></h1>
                <p>שתפו מסלולים, קבלו השראה וגלו איך אחרים מטיילים בעולם</p>
            </header>

            <div className="community-feed-compact">
                {posts.map((post) => (
                    <div key={post._id} className="community-post-item-wrapper glass">
                        {/* Main Summary Row */}
                        <div className="post-compact-row" onClick={() => setExpandedPosts({ ...expandedPosts, [post._id]: !expandedPosts[post._id] })}>
                            <div className="post-row-left">
                                <div className="user-avatar-small">
                                    {(post.userId?.fullName || post.userName || post.userEmail)[0].toUpperCase()}
                                </div>
                                <div className="user-info-stacked">
                                    <span className="user-email-text">
                                        {post.userId?.fullName || post.userName || post.userEmail}
                                    </span>
                                    <span className="post-date-text">{new Date(post.createdAt).toLocaleDateString('he-IL')}</span>
                                </div>
                            </div>

                            <div className="post-row-middle">
                                <div className="destination-info-row">
                                    <span className="dest-pin">📍</span>
                                    <span className="dest-name-text">{post.destination}</span>
                                    <span className="dest-dates-text">({post.flightDetails?.landingDate} - {post.flightDetails?.takeoffDate})</span>
                                </div>
                            </div>

                            <div className="post-row-right">
                                <div className="post-stats-row">
                                    <button
                                        className={`stat-pill like-pill ${post.likes.includes(user?._id) ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}
                                        title={post.likes.includes(user?._id) ? "בטל לייק" : "שלח לייק"}
                                    >
                                        <span className="heart-icon">❤️</span>
                                        <span className="count">{post.likes.length}</span>
                                    </button>
                                    <button
                                        className="stat-pill comment-pill"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowQuickComment({ ...showQuickComment, [post._id]: !showQuickComment[post._id] });
                                        }}
                                        title="הוסף תגובה"
                                    >
                                        <span className="comment-icon">💬</span>
                                        <span className="count">{post.comments.length}</span>
                                    </button>
                                </div>
                                <button className="expand-row-btn">
                                    {expandedPosts[post._id] ? '🔼 סגור' : '✨ צפה במסלול'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Comment Input (Outside) */}
                        {showQuickComment[post._id] && (
                            <div className="quick-comment-wrapper animate-in" onClick={(e) => e.stopPropagation()}>
                                <div className="add-comment-input-row">
                                    <input
                                        type="text"
                                        placeholder="הוסף תגובה מהירה..."
                                        value={commentTexts[post._id] || ''}
                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleComment(post._id);
                                        }}
                                    />
                                    <button onClick={() => handleComment(post._id)}>שלח</button>
                                </div>
                            </div>
                        )}

                        {/* Expandable Content Area */}
                        {expandedPosts[post._id] && (
                            <div className="post-expanded-content animate-in">
                                <div className="expanded-itinerary-section">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(post.aiPlan);
                                            const itinerary = parsed.itinerary || (Array.isArray(parsed) ? parsed : []);
                                            return (
                                                <div className="itinerary-steps-grid">
                                                    {itinerary.map((step, idx) => (
                                                        <ItineraryStepCard key={idx} data={step} />
                                                    ))}
                                                </div>
                                            );
                                        } catch (e) {
                                            return <p>תקלה בהצגת המסלול</p>;
                                        }
                                    })()}
                                </div>

                                <div className="expanded-interactions-section">
                                    <div className="interaction-actions">
                                        <button
                                            className={`like-btn-premium ${post.likes.includes(user?._id) ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}
                                        >
                                            {post.likes.includes(user?._id) ? '❤️ אהבתי' : '❤️ שלח לייק'}
                                        </button>
                                    </div>

                                    <div className="comments-list-expanded">
                                        {post.comments.map((comment, i) => (
                                            <div key={i} className="comment-item-glass">
                                                <span className="comment-user">
                                                    {comment.userId?.fullName || comment.userName || (comment.userEmail ? comment.userEmail.split('@')[0] : 'משתמש')}:
                                                </span>
                                                <span className="comment-text">{comment.text}</span>
                                            </div>
                                        ))}
                                        <div className="add-comment-input-row" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                placeholder="הוסף תגובה..."
                                                value={commentTexts[post._id] || ''}
                                                onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                            />
                                            <button onClick={() => handleComment(post._id)}>שלח</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityView;
