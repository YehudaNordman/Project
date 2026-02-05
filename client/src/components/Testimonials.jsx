import React from 'react';

/**
 * רכיב Testimonials - מציג רשת (Grid) של המלצות וביקורות ממטיילים.
 * מציג 6 ביקורות נבחרות עם דירוג כוכבים, שם ותפקיד המטייל.
 */
const Testimonials = () => {
    // מערך אובייקטים המכיל את נתוני הביקורות
    const featuredReviews = [
        {
            name: "דניאל כהן",
            role: "נוסע עסקי",
            text: "בזכות BonusTrip הפכתי עצירה משעממת של 6 שעות בפריז לסיור קולינרי מדהים. ממליץ בחום!",
            rating: 5
        },
        {
            name: "מיכל לוי",
            role: "מטיילת סולו",
            text: "החישוב של זמן הנטו פשוט הציל אותי. ידעתי בדיוק כמה זמן יש לי בלי הלחץ של לפספס את הטיסה.",
            rating: 5
        },
        {
            name: "יוסי אברהם",
            role: "משפחה מטיילת",
            text: "ממשק נוח ופשוט. מצאנו מסעדה מעולה ליד השדה בתוך דקות. שירות חובה לכל מי שיש לו קונקשן.",
            rating: 4
        }
    ];

    return (
        <section className="testimonials-section static-view animate-in">
            {/* כותרת הסקשן */}
            <h2 className="section-title-premium">מה המטיילים שלנו אומרים</h2>

            {/* רשת הכרטיסים */}
            <div className="testimonials-grid-static">
                {featuredReviews.map((review, index) => (
                    <div key={index} className="testimonial-card-static">
                        {/* אייקון מרכאות לעיצוב */}
                        <div className="quote-icon">"</div>
                        <p className="testimonial-text">{review.text}</p>

                        <div className="testimonial-footer">
                            {/* תצוגת דירוג כוכבים על בסיס מספר הקלט */}
                            <div className="stars">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                            </div>
                            {/* פרטי הממליץ */}
                            <h4 className="testimonial-name">{review.name}</h4>
                            <span className="testimonial-role">{review.role}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;

