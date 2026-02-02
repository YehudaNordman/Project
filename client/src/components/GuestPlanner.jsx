import React, { useState } from 'react';
import waitingLogo from '../waiting/Gemini_Generated_Image_p8t408p8t408p8t4 (1).png';
import PlannerResults from './PlannerResults';

const GuestPlanner = ({ onBack }) => {
  const [formData, setFormData] = useState({
    destination: '',
    landingDate: '',
    landingTime: '',
    takeoffDate: '',
    takeoffTime: ''
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTime = (e) => {
    e.preventDefault();

    if (!formData.landingDate || !formData.landingTime || !formData.takeoffDate || !formData.takeoffTime) {
      alert('אנא מלא את כל פרטי הזמנים');
      return;
    }

    const landing = new Date(`${formData.landingDate}T${formData.landingTime}`);
    const takeoff = new Date(`${formData.takeoffDate}T${formData.takeoffTime}`);

    if (takeoff <= landing) {
      alert('שעת ההמראה חייבת להיות אחרי שעת הנחיתה');
      return;
    }

    const diffInMs = takeoff - landing;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // קיזוזים
    const landingOffset = 45;
    const travelOffset = 60;
    const securityOffset = 120;
    const totalOffsets = landingOffset + travelOffset + securityOffset;

    const netMinutes = diffInMinutes - totalOffsets;

    const formatDuration = (totalMins) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return h > 0 ? `${h} שעות ו-${m} דקות` : `${m} דקות`;
    };

    setIsLoading(true);
    setResult(null); // Clear previous results

    setTimeout(() => {
      setIsLoading(false);
      setResult({
        grossTime: formatDuration(diffInMinutes),
        offsets: {
          landing: landingOffset,
          travel: travelOffset,
          security: securityOffset,
          total: totalOffsets
        },
        netTime: formatDuration(netMinutes),
        netMinutes,
        isValid: netMinutes >= 120
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="loading-screen full-bg" style={{ backgroundImage: `url(${waitingLogo})` }} dir="rtl">
        <div className="loading-content white-text">
          <div className="airplane-loader-premium">
            <div className="orbit-ring outer"></div>
            <div className="orbit-ring inner"></div>
            <div className="plane-container-rotating">
              <div className="exhaust-trail">
                <span className="particle p1"></span>
                <span className="particle p2"></span>
                <span className="particle p3"></span>
              </div>
              <svg className="premium-jet" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="jetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#86BDBF', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M50 10 L55 35 L85 50 L55 55 L55 80 L65 90 L50 85 L35 90 L45 80 L45 55 L15 50 L45 35 Z"
                  fill="url(#jetGrad)"
                />
                <path d="M50 10 L52 30 L48 30 Z" fill="#ffffff" />
              </svg>
            </div>
          </div>
          <p className="pulse-text">מחשבים לכם את המסלול המושלם...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return <PlannerResults result={result} onBack={() => setResult(null)} />;
  }

  return (
    <div className="guest-planner-container animate-in">
      <button className="back-button" onClick={onBack}>
        <span>→</span> חזרה למסך הראשי
      </button>

      <div className="planner-card glass">
        <h1>פרטי ההמתנה שלך</h1>
        <p>הזן את פרטי הטיסות שלך כדי שנוכל לתכנן לך את ההפסקה המושלמת</p>

        <form className="planner-form" onSubmit={calculateTime}>
          <div className="form-group">
            <label>יעד עצירת הביניים</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="לדוגמה: לונדון, פריז..."
              className="planner-input"
            />
          </div>

          <div className="form-section-title">נחיתה ביעד</div>
          <div className="form-row">
            <div className="form-group">
              <label>תאריך נחיתה</label>
              <input
                type="date"
                name="landingDate"
                value={formData.landingDate}
                onChange={handleChange}
                className="planner-input"
              />
            </div>
            <div className="form-group">
              <label>שעת נחיתה</label>
              <input
                type="time"
                name="landingTime"
                value={formData.landingTime}
                onChange={handleChange}
                className="planner-input"
              />
            </div>
          </div>

          <div className="form-section-title">המראה לטיסת המשך</div>
          <div className="form-row">
            <div className="form-group">
              <label>תאריך המראה</label>
              <input
                type="date"
                name="takeoffDate"
                value={formData.takeoffDate}
                onChange={handleChange}
                className="planner-input"
              />
            </div>
            <div className="form-group">
              <label>שעת המראה</label>
              <input
                type="time"
                name="takeoffTime"
                value={formData.takeoffTime}
                onChange={handleChange}
                className="planner-input"
              />
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            חשב לי את הזמן
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestPlanner;
