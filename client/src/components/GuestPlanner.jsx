const GuestPlanner = ({ onBack }) => {
  return (
    <div className="guest-planner-container animate-in">
      <button className="back-button" onClick={onBack}>
        <span>→</span> חזרה למסך הראשי
      </button>

      <div className="planner-card glass">
        <h1>פרטי ההמתנה שלך</h1>
        <p>הזן את פרטי הטיסות שלך כדי שנוכל לתכנן לך את ההפסקה המושלמת</p>

        <form className="planner-form">
          <div className="form-group">
            <label>יעד עצירת הביניים</label>
            <input type="text" placeholder="לדוגמה: לונדון, פריז..." className="planner-input" />
          </div>

          <div className="form-section-title">נחיתה ביעד</div>
          <div className="form-row">
            <div className="form-group">
              <label>תאריך נחיתה</label>
              <input type="date" className="planner-input" />
            </div>
            <div className="form-group">
              <label>שעת נחיתה</label>
              <input type="time" className="planner-input" />
            </div>
          </div>

          <div className="form-section-title">המראה לטיסת המשך</div>
          <div className="form-row">
            <div className="form-group">
              <label>תאריך המראה</label>
              <input type="date" className="planner-input" />
            </div>
            <div className="form-group">
              <label>שעת המראה</label>
              <input type="time" className="planner-input" />
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
