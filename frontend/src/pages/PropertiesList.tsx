import { useState } from "react";
import { useProperties, useCreateProperty, useDeleteProperty } from "../hooks/useProperties";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Plus, Building2, Trash2 } from "../components/ui/AppIcon";

export function PropertiesList() {
  const { data, isLoading, error } = useProperties();
  const createMutation = useCreateProperty();
  const deleteMutation = useDeleteProperty();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
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
          toast.success(t("property_created"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) => {
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_property"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(t("property_deleted")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  if (error) {
    return (
      <div>
        <PageHeader title={t("properties")} description={t("properties_desc")} />
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">{t("failed_load_properties")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("properties")}
        description={t("properties_desc")}
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            {t("add_property")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <Card key={p.id} hoverable>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{p.name}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(p.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    aria-label={t("delete")}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {p.address && <p className="text-sm text-slate-600">{p.address}</p>}
                {p.notes && <p className="text-xs text-slate-500 line-clamp-2">{p.notes}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 size={24} />}
          title={t("no_properties")}
          description={t("add_first_property")}
          action={
            <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
              {t("add_property")}
            </Button>
          }
        />
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("add_property")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              {createMutation.isPending ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t("property_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label={`${t("address")} ${t("optional")}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label={`${t("notes")} ${t("optional")}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
