import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/leadership", label: "Leadership" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 px-3 w-[min(100%,64rem)]">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass-strong flex items-center justify-between rounded-full px-3 py-2"
      >
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tracking-tight"
        >
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primary-foreground">
            EM
          </span>
          <span className="hidden sm:inline">Eustace .T. Madawu</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.slice(1).map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="relative rounded-full px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-foreground/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* Mobile nav row */}
      <div className="md:hidden mt-2 glass rounded-full px-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {links.slice(1).map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                active ? "bg-foreground/10 text-foreground" : "text-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
