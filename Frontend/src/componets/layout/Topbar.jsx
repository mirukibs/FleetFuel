import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Link } from "react-router-dom";

export function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 lg:px-8">
      <button className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted" onClick={onMenu}>
        <Menu className="size-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search vehicles, suppliers, requests…"
          className="w-full h-10 pl-10 pr-16 rounded-lg bg-muted/60 border border-transparent focus:bg-card focus:border-ring outline-none text-sm transition"
        />
        <kbd className="hidden md:inline absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={toggle}
          className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <Link
          to="/app/notifications"
          className="relative p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Link>

        <div className="ml-2 flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold leading-tight">Amelia Cole</div>
            <div className="text-[11px] text-muted-foreground">Fleet Operations · Admin</div>
          </div>
          <div className="size-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-semibold text-sm">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
