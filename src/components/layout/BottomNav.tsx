import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "ホーム", icon: "🏠" },
  { to: "/progress", label: "進捗", icon: "📊" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-washi border-t border-border z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? "text-shu font-bold"
                  : "text-text-secondary hover:text-sumi-dark"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
