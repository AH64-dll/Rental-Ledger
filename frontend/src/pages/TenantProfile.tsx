import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTenant, useTenantBalance, useUpdateTenant } from "../hooks/useTenants";
import { useAllCharges, useDeleteGeneralCharge } from "../hooks/useCharges";
import { useCreatePayment } from "../hooks/usePayments";
import { useLeases, useCreateLease } from "../hooks/useLeases";
import { useProperties } from "../hooks/useProperties";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Tabs } from "../components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import {
  Plus, Edit, Trash2, Wallet, Mail, Phone, FileText, AlertCircle, Receipt,
} from "../components/ui/AppIcon";
import { DebtForm } from "../components/debts/DebtForm";
import {
  getElapsedDuration,
  getLocalDateString,
  getLocalOneYearLaterDateString,
} from "../utils/dateUtils";

export function TenantProfile() {
  const { id } = useParams<{ id: string }>();
  const tenantId = id ? Number(id) : null;
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const { data: balance } = useTenantBalance(tenantId);
  const { data: allCharges } = useAllCharges({ tenant_id: tenantId || undefined });
  const { data: leases } = useLeases(tenantId || undefined);

  const updateMutation = useUpdateTenant();
  const deleteDebtMutation = useDeleteGeneralCharge();
  const createPaymentMutation = useCreatePayment();
  const createLeaseMutation = useCreateLease();

  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"leases" | "debts">("leases");
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [leaseFormOpen, setLeaseFormOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [leaseStartDate, setLeaseStartDate] = useState(getLocalDateString());
  const [leaseEndDate, setLeaseEndDate] = useState(getLocalOneYearLaterDateString());
  const [leaseMonthlyRentEgp, setLeaseMonthlyRentEgp] = useState("");
  const [leaseDueDay, setLeaseDueDay] = useState(1);
  const [leaseLateFeePercent, setLeaseLateFeePercent] = useState(0);
  const [leaseSecurityDepositEgp, setLeaseSecurityDepositEgp] = useState("");

  const { data: properties } = useProperties();

  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [paymentAmountEgp, setPaymentAmountEgp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const personalDebts = allCharges?.filter((c) => c.lease_id === null) || [];
  const tenantLeases = leases || [];

  const openEdit = () => {
    if (!tenant) return;
    setName(tenant.name);
    setEmail(tenant.email || "");
    setPhone(tenant.phone || "");
    setNotes(tenant.notes || "");
    setEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    updateMutation.mutate(
      {
        id: tenantId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success(t("tenant_updated"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    if (!paymentAmountEgp) return;
    const today = getLocalDateString();
    createPaymentMutation.mutate(
      {
        chargeId,
        amount_cents: Math.round(Number(paymentAmountEgp) * 100),
        payment_date: today,
        method: paymentMethod || undefined,
      },
      {
        onSuccess: () => {
          setPaymentChargeId(null);
          setPaymentAmountEgp("");
          setPaymentMethod("");
          toast.success(t("payment_logged"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleDeleteDebt = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_debt"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteDebtMutation.mutate(id, {
      onSuccess: () => toast.success(t("debt_deleted")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedPropertyId || !leaseStartDate || !leaseEndDate || !leaseMonthlyRentEgp) return;
    createLeaseMutation.mutate(
      {
        tenant_id: tenantId,
        property_id: selectedPropertyId,
        start_date: leaseStartDate,
        end_date: leaseEndDate,
        monthly_rent_cents: Math.round(Number(leaseMonthlyRentEgp) * 100),
        rent_due_day_of_month: leaseDueDay,
        late_fee_percent: leaseLateFeePercent || undefined,
        security_deposit_cents: leaseSecurityDepositEgp
          ? Math.round(Number(leaseSecurityDepositEgp) * 100)
          : undefined,
      },
      {
        onSuccess: () => {
          setLeaseFormOpen(false);
          setSelectedPropertyId(null);
          setLeaseStartDate(getLocalDateString());
          setLeaseEndDate(getLocalOneYearLaterDateString());
          setLeaseMonthlyRentEgp("");
          setLeaseDueDay(1);
          setLeaseLateFeePercent(0);
          setLeaseSecurityDepositEgp("");
          toast.success(t("lease_created"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("person_profile")} backTo="/tenants" />
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">{t("failed_load_tenant")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }
  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant.name}
        description={t("person_profile")}
        backTo="/tenants"
        actions={
          <Button leftIcon={<Edit size={16} />} variant="secondary" onClick={openEdit}>
            {t("edit")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-semibold shrink-0">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{tenant.name}</h2>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tenant.email || "—"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tenant.phone || "—"}</span>
                  </span>
                </div>
                {tenant.notes && (
                  <p className="mt-3 text-sm text-slate-500">{tenant.notes}</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {balance && (
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("net_balance")}
                  </span>
                  <Badge variant={balance.net_balance_cents > 0 ? "warning" : "success"}>
                    <Wallet size={12} />
                  </Badge>
                </div>
                <div className="text-2xl font-semibold text-slate-900 tracking-tight">
                  <Money cents={balance.net_balance_cents} />
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t("deposits_held")}
                </span>
                <div className="text-lg font-semibold text-slate-900">
                  <Money cents={balance.deposits_held_cents} />
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as "leases" | "debts")}
        items={[
          {
            id: "leases",
            label: t("rental_leases"),
            content: (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-slate-900">{t("rental_leases")}</h3>
                    <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setLeaseFormOpen(true)}>
                      {t("add_lease")}
                    </Button>
                  </CardHeader>
                  {tenantLeases.length > 0 ? (
                    <Table>
                      <THead>
                        <TR>
                          <TH>{t("property")}</TH>
                          <TH>{t("start_date")}</TH>
                          <TH>{t("end_date")}</TH>
                          <TH>{t("monthly_rent_egp")}</TH>
                          <TH>{t("status")}</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {tenantLeases.map((l) => (
                          <TR key={l.id}>
                            <TD className="font-medium text-slate-900">{l.property_name}</TD>
                            <TD>{new Date(l.start_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</TD>
                            <TD>{new Date(l.end_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</TD>
                            <TD><Money cents={l.monthly_rent_cents} /></TD>
                            <TD><StatusPill status={l.status as "active" | "ended" | "expired"} /></TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  ) : (
                    <EmptyState icon={<FileText size={24} />} title={t("no_leases")} />
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-slate-900">{t("charges_ledger")}</h3>
                  </CardHeader>
                  {balance?.charges && balance.charges.length > 0 ? (
                    <Table>
                      <THead>
                        <TR>
                          <TH>{t("description")}</TH>
                          <TH>{t("amount")}</TH>
                          <TH>{t("paid")}</TH>
                          <TH>{t("balance")}</TH>
                          <TH>{t("status")}</TH>
                          <TH>{t("due_date")}</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {balance.charges.map((c, i) => (
                          <TR key={i}>
                            <TD>{c.description}</TD>
                            <TD><Money cents={c.amount_cents} /></TD>
                            <TD><Money cents={c.paid_cents} /></TD>
                            <TD><Money cents={c.balance_cents} /></TD>
                            <TD><StatusPill status={c.status as "paid" | "partial" | "unpaid" | "overdue"} /></TD>
                            <TD className="text-slate-500">
                              {c.due_date ? new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "—"}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  ) : (
                    <EmptyState icon={<Receipt size={24} />} title={t("no_charges")} />
                  )}
                </Card>
              </div>
            ),
          },
          {
            id: "debts",
            label: t("personal_debts"),
            content: (
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-slate-900">{t("personal_debts")}</h3>
                  <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowDebtForm(!showDebtForm)}>
                    {t("add_debt")}
                  </Button>
                </CardHeader>
                {showDebtForm && (
                  <div className="px-6 pb-4">
                    <DebtForm
                      tenantId={tenantId!}
                      onSuccess={() => {
                        setShowDebtForm(false);
                        toast.success(t("debt_added"));
                      }}
                    />
                  </div>
                )}
                {personalDebts.length > 0 ? (
                  <Table>
                    <THead>
                      <TR>
                        <TH>{t("debt_date")}</TH>
                        <TH>{t("elapsed_duration")}</TH>
                        <TH>{t("amount")}</TH>
                        <TH>{t("paid")}</TH>
                        <TH>{t("remaining")}</TH>
                        <TH>{t("status")}</TH>
                        <TH className="w-32">{t("actions")}</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {personalDebts.map((c) => (
                        <TR key={c.id}>
                          <TD className="text-slate-500">
                            {c.charge_date ? new Date(c.charge_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "—"}
                          </TD>
                          <TD className="text-slate-500">{getElapsedDuration(c.charge_date, new Date(), language)}</TD>
                          <TD><Money cents={c.amount_cents} /></TD>
                          <TD><Money cents={c.paid_cents} /></TD>
                          <TD className="font-medium text-slate-900"><Money cents={c.balance_cents} /></TD>
                          <TD><StatusPill status={c.status} /></TD>
                          <TD>
                            {paymentChargeId === c.id ? (
                              <form onSubmit={(e) => handlePayment(e, c.id)} className="space-y-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={t("amount")}
                                  value={paymentAmountEgp}
                                  onChange={(e) => setPaymentAmountEgp(e.target.value)}
                                  required
                                />
                                <Input
                                  placeholder={t("method")}
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm" loading={createPaymentMutation.isPending}>
                                    {t("save")}
                                  </Button>
                                  <Button type="button" size="sm" variant="ghost" onClick={() => setPaymentChargeId(null)}>
                                    {t("cancel")}
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setPaymentChargeId(c.id)}>
                                  {t("pay")}
                                </Button>
                                <button
                                  onClick={() => handleDeleteDebt(c.id)}
                                  aria-label={t("delete")}
                                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                ) : (
                  <EmptyState icon={<AlertCircle size={24} />} title={t("no_debts_found")} />
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("edit_tenant")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleUpdate} loading={updateMutation.isPending}>
              {updateMutation.isPending ? t("saving") : t("save_changes")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} noValidate className="space-y-4">
          <Input label={t("name")} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <Input label={`${t("email")} ${t("optional")}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label={`${t("phone")} ${t("optional")}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label={`${t("notes")} ${t("optional")}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </form>
      </Modal>

      <Modal
        open={leaseFormOpen}
        onClose={() => setLeaseFormOpen(false)}
        title={t("add_lease")}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaseFormOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreateLease} loading={createLeaseMutation.isPending}>
              {createLeaseMutation.isPending ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateLease} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t("property")}
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value) || null)}
              required
            >
              <option value="">{t("select_property")}</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            <Input label={t("start_date")} type="date" value={leaseStartDate} onChange={(e) => setLeaseStartDate(e.target.value)} required />
            <Input label={t("end_date")} type="date" value={leaseEndDate} onChange={(e) => setLeaseEndDate(e.target.value)} required />
            <Input label={t("monthly_rent_egp")} type="number" step="0.01" value={leaseMonthlyRentEgp} onChange={(e) => setLeaseMonthlyRentEgp(e.target.value)} required />
            <Input label={t("due_day")} type="number" min={1} max={28} value={leaseDueDay} onChange={(e) => setLeaseDueDay(Number(e.target.value))} required />
            <Input label={t("late_fee_percent")} type="number" step="0.01" value={leaseLateFeePercent || ""} onChange={(e) => setLeaseLateFeePercent(Number(e.target.value))} />
            <Input label={t("security_deposit_egp")} type="number" step="0.01" value={leaseSecurityDepositEgp} onChange={(e) => setLeaseSecurityDepositEgp(e.target.value)} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
