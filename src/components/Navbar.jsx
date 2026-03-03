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
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid #eef2f6;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .nav-brand a {
                    font-size: 1.5rem;
                    font-weight: 800;
                    text-decoration: none;
                    color: #1e293b;
                    letter-spacing: -0.5px;
                }
                .nav-links {
                    display: flex;
                    gap: 30px;
                }
                .nav-item {
                    text-decoration: none;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }
                .nav-item:hover {
                    color: #6366f1;
                }
                .nav-user {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .user-badge {
                    background: #f1f5f9;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                }
                .btn-logout {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    padding: 8px 18px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-logout:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #fee2e2;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
