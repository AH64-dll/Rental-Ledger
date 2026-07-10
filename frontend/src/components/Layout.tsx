import { useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import {
  Home,
  Building2,
  Users,
  FileText,
  Receipt,
  AlertCircle,
  Settings,
  Menu,
  X,
  LogOut,
} from "./ui/AppIcon";

const NAV_ITEMS: { to: string; key: string; icon: ReactNode }[] = [
  { to: "/dashboard", key: "nav_dashboard", icon: <Home size={20} /> },
  { to: "/properties", key: "nav_properties", icon: <Building2 size={20} /> },
  { to: "/tenants", key: "nav_tenants", icon: <Users size={20} /> },
  { to: "/leases", key: "nav_leases", icon: <FileText size={20} /> },
  { to: "/charges", key: "nav_charges", icon: <Receipt size={20} /> },
  { to: "/debts", key: "nav_debts", icon: <AlertCircle size={20} /> },
  { to: "/settings", key: "nav_settings", icon: <Settings size={20} /> },
];

export function Layout() {
  const { data: user } = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeSidebar = () => setIsOpen(false);
  const otherLang = language === "ar" ? "en" : "ar";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 w-full shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={t("menu")}
        >
          <Menu size={22} />
        </button>
        <span className="font-semibold text-slate-900 text-sm">{t("login_title")}</span>
        <div className="w-9" />
      </header>

      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-fade-in"
        />
      )}

      <aside
        className={[
          "fixed top-0 bottom-0 w-64 bg-white border-s border-slate-200 p-4 flex flex-col z-50",
          "transition-transform duration-300 ease-in-out md:static md:translate-x-0 shrink-0 h-full",
          language === "ar" ? "right-0" : "left-0",
          isOpen
            ? "translate-x-0"
            : language === "ar"
            ? "translate-x-full"
            : "-translate-x-full",
          "md:shadow-none shadow-xl",
        ].join(" ")}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <h1 className="text-base font-semibold text-slate-900">{t("login_title")}</h1>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded text-slate-500 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={t("close_menu")}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold border-s-2 border-indigo-500"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pt-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 font-medium">
              {language === "ar" ? "العربية" : "English"}
            </span>
            <button
              onClick={() => {
                setLanguage(otherLang);
                closeSidebar();
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={language === "ar" ? "تغيير اللغة إلى الإنجليزية" : "Switch language to Arabic"}
            >
              {otherLang === "ar" ? "العربية" : "English"}
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {user?.username?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-sm text-slate-700 truncate">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={t("logout")}
              title={t("logout")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto w-full h-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
