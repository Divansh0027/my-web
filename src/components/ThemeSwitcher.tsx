import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/50 p-1 rounded-full">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-surface-container-high text-gold-accent shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
        aria-label="Light Mode"
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all ${theme === "system" ? "bg-surface-container-high text-gold-accent shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
        aria-label="System Mode"
        title="System Mode"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-surface-container-high text-gold-accent shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
        aria-label="Dark Mode"
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
