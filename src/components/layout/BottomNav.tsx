import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "ホーム" },
  { to: "/progress", label: "進捗" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-washi border-t border-border z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 text-center py-2.5 text-sm tracking-wider transition-colors ${
                isActive
                  ? "text-shu font-bold"
                  : "text-text-secondary hover:text-sumi-dark"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
