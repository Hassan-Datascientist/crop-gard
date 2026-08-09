import React, { useState } from "react";
import { Link, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { Leaf, ScanLine, User, LogOut, ChevronDown, ChevronLeft, History as HistoryIcon, Menu } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import MoreMenu from "@/components/MoreMenu";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const initial = (user?.full_name || user?.email || "U").charAt(0).toUpperCase();
  const navigate = useNavigate();
  const outlet = useOutlet();

  const rootPaths = ["/", "/history", "/profile"];
  const isRoot = rootPaths.includes(location.pathname);
  const childTitles = {
    "/settings": "settings.title",
    "/about": "about.title",
    "/help": "help.title",
    "/contact": "contact.title",
    "/privacy": "privacy.title",
  };
  const pageTitle = location.pathname.startsWith("/result")
    ? t("result.title")
    : t(childTitles[location.pathname] || "");

  const handleLogout = () => {
    logout(false);
    window.location.href = "/login";
  };

  const tabs = [
    { to: "/", label: t("nav.detect"), icon: ScanLine },
    { to: "/history", label: t("nav.history"), icon: HistoryIcon },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20">
      {/* Top header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          {isRoot ? (
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-bold text-foreground">LeafGuard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t("app.tagline")}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors text-foreground"
                aria-label={t("common.back")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-foreground truncate max-w-[180px] sm:max-w-xs">{pageTitle}</h1>
            </div>
          )}

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 ml-1 pl-1.5 pr-2 py-1.5 rounded-full border border-border hover:bg-muted transition-colors">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground leading-none">{user?.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t("menu.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <HistoryIcon className="mr-2 h-4 w-4" />
                    {t("menu.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("menu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 pb-28 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-background/90 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto grid grid-cols-4 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors",
                  active ? "text-emerald-600" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium text-muted-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
            {t("nav.more")}
          </button>
        </div>
      </nav>

      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
    </div>
  );
}