// layouts/AppLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/footer";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <Topbar />
        <main className="flex-1 bg-white">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}