import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <MainLayout>
            <h2>Dashboard</h2>
            <p>Welcome back, {user?.username}</p>
            <p>This is your secure file sharing dashboard.</p>
        </MainLayout>
    );
};

export default Dashboard;
