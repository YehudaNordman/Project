/**
 * רכיב Footer - שולי האתר התחתונים.
 * מציג זכויות יוצרים ושנה דינמית.
 */
const Footer = () => {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} BonusTrip. כל הזכויות שמורות.</p>
        </footer>
    );
};

export default Footer;

