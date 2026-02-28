import { Link } from "react-router-dom";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  backTo?: string;
}

export function TopBar({ title = "古文活用", subtitle, backTo }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-sumi-dark shadow-md">
      <div className="flex items-center gap-3 px-4 py-3 min-h-14">
        {backTo && (
          <Link
            to={backTo}
            className="text-washi/70 hover:text-washi text-sm shrink-0"
          >
            ← 戻る
          </Link>
        )}
        <div className="flex items-center gap-2">
          <span className="text-washi font-bold text-lg tracking-wider">
            {title}
          </span>
          {subtitle && (
            <>
              <span className="text-muted text-sm">|</span>
              <span className="text-muted text-xs tracking-wide">
                {subtitle}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
