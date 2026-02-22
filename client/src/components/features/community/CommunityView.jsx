import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import ItineraryStepCard from '../itinerary/ItineraryStepCard';

const CommunityView = () => {
    const { user, token, openAuthModal } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({}); // To track which posts are showing the full plan

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

    if (loading) return <div className="loading-community">טוען קהילה...</div>;

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
                                <div className="user-avatar-small">{post.userEmail[0].toUpperCase()}</div>
                                <div className="user-info-stacked">
                                    <span className="user-email-text">{post.userEmail}</span>
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
                                    <span className="stat-pill">❤️ {post.likes.length}</span>
                                    <span className="stat-pill">💬 {post.comments.length}</span>
                                </div>
                                <button className="expand-row-btn">
                                    {expandedPosts[post._id] ? '🔼 סגור' : '✨ צפה במסלול'}
                                </button>
                            </div>
                        </div>

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
                                            {post.likes.includes(user?._id) ? '❤️ אהבתי' : '🤍 שלח לייק'}
                                        </button>
                                    </div>

                                    <div className="comments-list-expanded">
                                        {post.comments.map((comment, i) => (
                                            <div key={i} className="comment-item-glass">
                                                <span className="comment-user">{comment.userEmail.split('@')[0]}:</span>
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
