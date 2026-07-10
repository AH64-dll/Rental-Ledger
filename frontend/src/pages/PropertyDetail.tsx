import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProperty } from "../hooks/useProperties";
import { useUnits, useCreateUnit, useDeleteUnit } from "../hooks/useUnits";
import { useLanguage } from "../context/LanguageContext";
import { ErrorBanner } from "../components/ErrorBanner";

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? Number(id) : null;
  const { data: property, isLoading, error } = useProperty(propertyId);
  const { data: units } = useUnits(propertyId);
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;
    setMutationError(null);
    createUnit.mutate(
      { propertyId, name, notes: notes || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setName("");
          setNotes("");
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  const handleDelete = (unitId: number) => {
    if (!propertyId) return;
    if (window.confirm(t("confirm_delete_unit"))) {
      setMutationError(null);
      deleteUnit.mutate(
        { propertyId, unitId },
        {
          onError: (err: any) => {
            setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
          },
        }
      );
    }
  };

  if (isLoading) return <p className="text-gray-500">{t("loading")}</p>;
  if (error) return <p className="text-red-600">{t("failed_load_property")}</p>;
  if (!property) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to=".." className="text-blue-600 hover:underline text-sm">← {t("back")}</Link>
      </div>

      <ErrorBanner error={mutationError} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{property.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {property.address || t("no_address")} {property.notes && `— ${property.notes}`}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("units")}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_unit")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder={t("unit_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder={t("notes_optional")}
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
              {createUnit.isPending ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start">
            <tr>
              <th className="px-4 py-3 font-medium text-start">{t("name")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("notes")}</th>
              <th className="px-4 py-3 font-medium text-start w-24">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {units?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  {t("no_units")}
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
                    {t("delete")}
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

