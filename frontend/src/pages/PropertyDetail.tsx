import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProperty } from "../hooks/useProperties";
import { useUnits, useCreateUnit, useDeleteUnit } from "../hooks/useUnits";

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? Number(id) : null;
  const { data: property, isLoading, error } = useProperty(propertyId);
  const { data: units } = useUnits(propertyId);
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;
    createUnit.mutate(
      { propertyId, name, notes: notes || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setName("");
          setNotes("");
        },
      }
    );
  };

  const handleDelete = (unitId: number) => {
    if (!propertyId) return;
    if (window.confirm("Delete this unit?")) {
      deleteUnit.mutate({ propertyId, unitId });
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load property.</p>;
  if (!property) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{property.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {property.address || "No address"} {property.notes && `— ${property.notes}`}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Units</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Unit
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Unit name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
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
              disabled={createUnit.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createUnit.isPending ? "Saving..." : "Save"}
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
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No units yet.
                </td>
              </tr>
            )}
            {units?.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.notes || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(u.id)}
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
