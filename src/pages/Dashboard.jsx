import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Welcome back, {user?.username} 👋</h2>
                <p>Manage your secure files and documents here.</p>
            </div>

            <FileUpload />
        </MainLayout>
    );
};

export default Dashboard;
