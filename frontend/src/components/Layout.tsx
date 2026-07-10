import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMe } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/properties", label: "Properties" },
  { to: "/tenants", label: "Tenants" },
  { to: "/leases", label: "Leases" },
  { to: "/charges", label: "Charges" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const { data: user } = useMe();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r p-4 flex flex-col">
        <h1 className="text-lg font-bold mb-6">Rental Ledger</h1>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 rounded hover:bg-gray-100 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs text-gray-500 border-t pt-3">
          {user?.username}
          <button
            onClick={logout}
            className="ml-2 text-blue-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
