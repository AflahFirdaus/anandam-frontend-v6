import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">

      <div className="p-4 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <main className="h-full overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>

    </div>
  );
}