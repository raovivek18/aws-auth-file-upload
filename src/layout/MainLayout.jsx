import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <div style={{ padding: "40px" }}>{children}</div>
        </>
    );
};

export default MainLayout;
