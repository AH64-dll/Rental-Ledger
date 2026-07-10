import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useTenants,
  useCreateTenant,
  useDeleteTenant,
} from "../hooks/useTenants";
import { useLanguage } from "../context/LanguageContext";
import { ErrorBanner } from "../components/ErrorBanner";

export function TenantsList() {
  const { data, isLoading, error } = useTenants();
  const createMutation = useCreateTenant();
  const deleteMutation = useDeleteTenant();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError(null);
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
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("confirm_delete_tenant"))) {
      setMutationError(null);
      deleteMutation.mutate(id, {
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      });
    }
  };

  if (isLoading) return <p className="text-gray-500">{t("loading")}</p>;
  if (error) return <p className="text-red-600">{t("failed_load_tenants")}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("tenants")}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_tenant")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder={t("tenant_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder={t("email_optional")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder={t("phone_optional")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
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
              disabled={createMutation.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createMutation.isPending ? t("saving") : t("save")}
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
              <th className="px-4 py-3 font-medium text-start">{t("email")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("phone")}</th>
              <th className="px-4 py-3 font-medium text-start w-24">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  {t("no_tenants")}
                </td>
              </tr>
            )}
            {data?.map((tRef) => (
              <tr key={tRef.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    to={`/tenants/${tRef.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {tRef.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{tRef.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{tRef.phone || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(tRef.id)}
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

