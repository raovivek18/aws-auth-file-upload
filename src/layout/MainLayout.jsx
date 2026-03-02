import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <div className="dashboard-container">{children}</div>
        </>
    );
};

export default MainLayout;
