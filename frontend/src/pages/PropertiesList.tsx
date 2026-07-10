import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useProperties,
  useCreateProperty,
  useDeleteProperty,
} from "../hooks/useProperties";

export function PropertiesList() {
  const { data, isLoading, error } = useProperties();
  const createMutation = useCreateProperty();
  const deleteMutation = useDeleteProperty();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name, address: address || undefined, notes: notes || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setName("");
          setAddress("");
          setNotes("");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this property?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load properties.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Properties</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Property
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Property name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No properties yet.
                </td>
              </tr>
            )}
            {data?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    to={`/properties/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.address || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(p.id)}
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
