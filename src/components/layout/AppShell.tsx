import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav.tsx";

export function AppShell() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-washi relative">
      <div className="pb-16">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
