import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavigation from "../MobileNavigation/MobileNavigation";

export default function AppLayout() {
  return (
    <div className="flex h-dvh w-full bg-slate-50/50 overflow-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-8 md:pb-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}