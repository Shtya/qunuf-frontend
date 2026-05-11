import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";
import LandlordDashboard from "@/components/dashboard/admin/LandlordDashboard";
import TenantDashboard from "@/components/dashboard/admin/TenantDashboard";
import { getUserRole } from "@/utils/auth";


const dashboards: Record<string, React.ReactNode> = {
    admin: <AdminDashboard />,
    tenant: <TenantDashboard />,
    landlord: <LandlordDashboard />,
};

export default async function DashboardPage() {
    const role = await getUserRole();
    return (
        <div>
            {dashboards[role]}
        </div>
    );
}