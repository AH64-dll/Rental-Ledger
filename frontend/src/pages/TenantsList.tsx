import { useState } from "react";
import { Link } from "react-router-dom";
import { useTenants, useCreateTenant, useDeleteTenant } from "../hooks/useTenants";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Plus, Users, Trash2, ChevronLeft, ChevronRight } from "../components/ui/AppIcon";

export function TenantsList() {
  const { data, isLoading, error } = useTenants();
  const createMutation = useCreateTenant();
  const deleteMutation = useDeleteTenant();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const Chevron = language === "ar" ? ChevronLeft : ChevronRight;

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
          toast.success(t("tenant_created"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_tenant"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(t("tenant_deleted")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  if (error) {
    return (
      <div>
        <PageHeader title={t("tenants")} description={t("tenants_desc")} />
        <Card>
          <div className="p-6 text-sm text-rose-600">{t("failed_load_tenants")}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("tenants")}
        description={t("tenants_desc")}
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            {t("add_tenant")}
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>{t("name")}</TH>
                <TH>{t("email")}</TH>
                <TH>{t("phone")}</TH>
                <TH className="w-24">{t("actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {data.map((tn) => (
                <TR key={tn.id}>
                  <TD>
                    <Link
                      to={`/tenants/${tn.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                    >
                      {tn.name}
                      <Chevron size={14} className="text-slate-400" />
                    </Link>
                  </TD>
                  <TD className="text-slate-500">{tn.email || "—"}</TD>
                  <TD className="text-slate-500">{tn.phone || "—"}</TD>
                  <TD>
                    <button
                      onClick={() => handleDelete(tn.id)}
                      aria-label={t("delete")}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            icon={<Users size={24} />}
            title={t("no_tenants")}
            description={t("add_first_tenant")}
            action={
              <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
                {t("add_tenant")}
              </Button>
            }
          />
        )}
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("add_tenant")}
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
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <Input
            label={t("tenant_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label={`${t("email")} ${t("optional")}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={`${t("phone")} ${t("optional")}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
