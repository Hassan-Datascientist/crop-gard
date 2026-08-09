import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation, languages } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { Sun, Moon, Monitor, User, LogOut, Globe, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { t, lang, setLang } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const themeOptions = [
    { value: "light", label: t("settings.theme_light"), icon: Sun },
    { value: "dark", label: t("settings.theme_dark"), icon: Moon },
    { value: "system", label: t("settings.theme_system"), icon: Monitor },
  ];

  const handleLogout = () => {
    logout(false);
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">{t("settings.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Appearance */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("settings.appearance")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{t("settings.appearance_desc")}</p>

        <p className="text-sm font-medium text-foreground mb-2">{t("settings.theme")}</p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-colors",
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("settings.language")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{t("settings.language_desc")}</p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(
                  "py-3 rounded-xl border text-sm font-medium transition-colors",
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("settings.account")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("settings.account_desc")}</p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/profile">{t("settings.open_profile")}</Link>
        </Button>
      </section>

      {/* Logout */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-foreground">{t("menu.logout")}</h3>
            <p className="text-sm text-muted-foreground">{t("settings.logout_desc")}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("settings.logout")}
          </Button>
        </div>
      </section>
    </div>
  );
}