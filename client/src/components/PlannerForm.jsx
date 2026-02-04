import React from 'react';

/**
 * רכיב PlannerForm - טופס הזנת פרטי הטיסות.
 * מנהל את הקלט של המשתמש עבור יעד וזמני נחיתה/המראה.
 */
const PlannerForm = ({ formData, handleChange, onSubmit }) => {
    return (
        <div className="planner-card glass">
            <h1>פרטי ההמתנה שלך</h1>
            <p>הזן את פרטי הטיסות שלך כדי שנוכל לתכננו לך את ההפסקה המושלמת</p>

            <form className="planner-form" onSubmit={onSubmit}>
                {/* שדה יעד עצירת הביניים */}
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

                {/* שורות זמנים - GRID */}
                <div className="form-row-grid">
                    {/* קבוצת נחיתה */}
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

                    {/* קבוצת המראה */}
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

                {/* כפתור הגשה */}
                <button type="submit" className="calculate-btn">
                    חשב לי את הזמן
                </button>
            </form>
        </div>
    );
};

export default PlannerForm;
