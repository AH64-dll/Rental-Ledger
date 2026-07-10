import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";

const NAV_ITEMS = [
  { to: "/dashboard", key: "nav_dashboard" },
  { to: "/properties", key: "nav_properties" },
  { to: "/tenants", key: "nav_tenants" },
  { to: "/leases", key: "nav_leases" },
  { to: "/charges", key: "nav_charges" },
  { to: "/debts", key: "nav_debts" },
  { to: "/settings", key: "nav_settings" },
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

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30 w-full shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded hover:bg-gray-100 focus:outline-none"
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-bold text-sm">{t("login_title")}</span>
        <div className="w-8" />
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Responsive Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 w-56 bg-white border-e p-4 flex flex-col justify-between z-50 transition-transform duration-300 shadow-lg md:shadow-none md:static md:translate-x-0 shrink-0 h-full
          ${language === "ar" ? "right-0" : "left-0"}
          ${isOpen ? "translate-x-0" : (language === "ar" ? "translate-x-full" : "-translate-x-full")}
        `}
      >
        <div>
          <div className="flex items-center justify-between mb-6 md:block">
            <h1 className="text-lg font-bold">{t("login_title")}</h1>
            <button
              onClick={closeSidebar}
              className="md:hidden p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={`px-3 py-2 rounded text-sm block ${
                    isActive
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Language Switcher Toggle */}
          <div className="my-4 border-t pt-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">
                {language === "ar" ? "العربية (Arabic)" : "English"}
              </span>
              <button
                onClick={() => { setLanguage(language === "ar" ? "en" : "ar"); closeSidebar(); }}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  language === "ar" ? "bg-blue-600 justify-end" : "bg-gray-300 justify-start"
                }`}
                title={language === "ar" ? "تغيير اللغة إلى الإنجليزية" : "Switch language to Arabic"}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-3 flex justify-between items-center">
            <span>{user?.username}</span>
            <button
              onClick={logout}
              className="ms-2 text-blue-600 hover:underline"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-6 w-full h-full">
        <Outlet />
      </main>
    </div>
  );
}

