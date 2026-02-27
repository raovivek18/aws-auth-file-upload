import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, signOut } = useAuth();

    return (
        <nav style={{ padding: "20px", borderBottom: "1px solid #ddd" }}>
            <span><strong>SecureShare</strong></span>

            <span style={{ float: "right" }}>
                {user?.attributes?.email} |
                <button onClick={signOut} style={{ marginLeft: "10px" }}>
                    Logout
                </button>
            </span>
        </nav>
    );
};

export default Navbar;
