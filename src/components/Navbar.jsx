import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { user, signOut } = useAuth();

    return (
        <nav className="navbar-container">
            <div className="nav-brand">
                <Link to="/dashboard">🛡️ SecureVault</Link>
            </div>

            <div className="nav-links">
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/activity" className="nav-item">Activity Log</Link>
            </div>

            <div className="nav-user">
                <span className="user-badge">{user?.attributes?.email?.split('@')[0]}</span>
                <button onClick={signOut} className="btn-logout">
                    Logout
                </button>
            </div>
            <style>{`
                .navbar-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 40px;
                    background: #000000;
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid #333333;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .nav-brand a {
                    font-size: 1.5rem;
                    font-weight: 800;
                    text-decoration: none;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                }
                .nav-links {
                    display: flex;
                    gap: 30px;
                }
                .nav-item {
                    text-decoration: none;
                    color: #a3a3a3;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }
                .nav-item:hover {
                    color: #ffffff;
                }
                .nav-user {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .user-badge {
                    background: #333333;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #ffffff;
                }
                .btn-logout {
                    background: #000000;
                    border: 1px solid #333333;
                    padding: 8px 18px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-logout:hover {
                    background: #ffffff;
                    color: #000000;
                    border-color: #ffffff;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
