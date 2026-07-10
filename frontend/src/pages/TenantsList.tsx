import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useTenants,
  useCreateTenant,
  useDeleteTenant,
} from "../hooks/useTenants";

export function TenantsList() {
  const { data, isLoading, error } = useTenants();
  const createMutation = useCreateTenant();
  const deleteMutation = useDeleteTenant();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setName("");
          setEmail("");
          setPhone("");
          setNotes("");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this tenant?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load tenants.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Tenants</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Tenant
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Tenant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No tenants yet.
                </td>
              </tr>
            )}
            {data?.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    to={`/tenants/${t.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.phone || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
