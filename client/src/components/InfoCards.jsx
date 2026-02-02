
const InfoCards = () => {
    const cardDetails = {
        time: {
            title: "חישוב זמן חכם",
            description: "ניתוח עומסים בזמן אמת בשדה, זמני נסיעה ולוחות זמנים של תחבורה."
        },
        attractions: {
            title: "אטרקציות מותאמות",
            description: "המלצות המבוססות על משך ההפסקה והעדפות אישיות למקסימום הנאה."
        },
        schedule: {
            title: "לוח זמנים אישי",
            description: "מסלול מפורט דקה אחר דקה המבטיח הגעה לשער בזמן וברוגע."
        }
    };

    return (
        <div className="info-section">
            <div className="info-card-3d">
                <span className="info-icon">⏰</span>
                <div>
                    <h3>חישוב זמן חכם</h3>
                    <p>זמני נסיעה ובידוק אוטומטיים</p>
                </div>
                <div className="tooltip-content">
                    <h4>{cardDetails.time.title}</h4>
                    <p>{cardDetails.time.description}</p>
                </div>
            </div>

            <div className="info-card-3d">
                <span className="info-icon">🎯</span>
                <div>
                    <h3>אטרקציות מותאמות</h3>
                    <p>נקודות עניין קרובות לשדה</p>
                </div>
                <div className="tooltip-content">
                    <h4>{cardDetails.attractions.title}</h4>
                    <p>{cardDetails.attractions.description}</p>
                </div>
            </div>

            <div className="info-card-3d">
                <span className="info-icon">📅</span>
                <div>
                    <h3>לוח זמנים אישי</h3>
                    <p>מסלול מותאם לחזרה בזמן</p>
                </div>
                <div className="tooltip-content">
                    <h4>{cardDetails.schedule.title}</h4>
                    <p>{cardDetails.schedule.description}</p>
                </div>
            </div>
        </div>
    );
};

export default InfoCards;
