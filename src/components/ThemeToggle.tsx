import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEME_KEY = "eustace-theme";

export type Theme = "light" | "dark" | "neutral";
const ORDER: Theme[] = ["light", "dark", "neutral"];
const ICONS: Record<Theme, string> = { light: "☀", dark: "☾", neutral: "◆" };
const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  neutral: "Neutral",
};

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("neutral", theme === "neutral");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme = stored && ORDER.includes(stored) ? stored : "light";
    setTheme(initial);
    apply(initial);
  }, []);

  const toggle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] as Theme;
    setTheme(next);
    apply(next);
    localStorage.setItem(THEME_KEY, next);
  };

  return { theme, toggle };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Theme: ${LABELS[theme]} — click to switch`}
      title={`${LABELS[theme]} mode`}
      className="glass relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 hover:scale-110"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="text-lg"
        >
          {ICONS[theme]}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
