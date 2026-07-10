import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "en";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation / Sidebar
    "nav_dashboard": "لوحة التحكم",
    "nav_properties": "العقارات",
    "nav_tenants": "الأشخاص",
    "nav_leases": "عقود الإيجار",
    "nav_charges": "الرسوم",
    "nav_settings": "الإعدادات",
    "logout": "تسجيل الخروج",
    "logged_in_as": "تم تسجيل الدخول بصفتك",

    // Login page
    "login_title": "سجل الإيجارات",
    "username": "اسم المستخدم",
    "new_username": "اسم المستخدم الجديد",
    "change_username": "تغيير اسم المستخدم",
    "credentials_updated_success": "تم تحديث البيانات بنجاح!",
    "password": "كلمة المرور",
    "sign_in": "تسجيل الدخول",
    "signing_in": "جاري تسجيل الدخول...",
    "invalid_credentials": "اسم المستخدم أو كلمة المرور غير صحيحة",
    "username_required": "اسم المستخدم مطلوب",
    "password_required": "كلمة المرور مطلوبة",

    // Dashboard
    "dashboard": "لوحة التحكم",
    "active_leases": "عقود الإيجار النشطة",
    "overdue_charges": "الرسوم المتأخرة",
    "total_owed_to_you": "إجمالي المستحقات لك",
    "deposits_held": "الودائع المحتفظ بها",
    "expiring_soon": "تنتهي صلاحيتها قريباً",
    "lease_count_singular": "عقد",
    "lease_count_plural": "عقود",
    "loading_dashboard": "جاري تحميل لوحة التحكم...",
    "failed_load_dashboard": "فشل تحميل لوحة التحكم.",

    // Properties list & detail
    "properties": "العقارات",
    "add_property": "إضافة عقار",
    "property_name": "اسم العقار",
    "address_optional": "العنوان (اختياري)",
    "notes_optional": "ملاحظات (اختياري)",
    "saving": "جاري الحفظ...",
    "save": "حفظ",
    "cancel": "إلغاء",
    "name": "الاسم",
    "address": "العنوان",
    "created": "تاريخ الإنشاء",
    "actions": "الإجراءات",
    "no_properties": "لا توجد عقارات بعد.",
    "delete": "حذف",
    "confirm_delete_property": "هل أنت متأكد من حذف هذا العقار؟",
    "failed_load_properties": "فشل تحميل العقارات.",
    "failed_load_charges": "فشل تحميل الرسوم.",
    "loading": "جاري التحميل...",
    "no_address": "لا يوجد عنوان",
    "failed_load_property": "فشل تحميل العقار.",

    // Units
    "units": "الوحدات",
    "add_unit": "إضافة وحدة",
    "unit_name": "اسم الوحدة",
    "no_units": "لا توجد وحدات بعد.",
    "confirm_delete_unit": "هل أنت متأكد من حذف هذه الوحدة؟",

    // Tenants (People)
    "tenants": "الأشخاص",
    "add_tenant": "إضافة شخص",
    "tenant_name": "الاسم",
    "email_optional": "البريد الإلكتروني (اختياري)",
    "phone_optional": "رقم الهاتف (اختياري)",
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "notes": "ملاحظات",
    "no_tenants": "لا يوجد أشخاص بعد.",
    "confirm_delete_tenant": "هل أنت متأكد من حذف هذا الشخص؟",
    "failed_load_tenants": "فشل تحميل الأشخاص.",
    "failed_load_tenant": "فشل تحميل بيانات الشخص.",
    "person_profile": "ملف الشخص",
    "rental_leases": "عقود الإيجار",
    "menu": "القائمة",
    "close_menu": "إغلاق القائمة",
    "edit": "تعديل",
    "save_changes": "حفظ التغييرات",
    "net_balance": "صافي الرصيد",
    "charges_ledger": "سجل الرسوم والمطالبات",
    "description": "الوصف",
    "amount": "المبلغ",
    "paid": "المدفوع",
    "balance": "الرصيد",
    "status": "الحالة",
    "due_date": "تاريخ الاستحقاق",
    "no_charges": "لا توجد رسوم بعد.",
    "no_charges_yet": "لا توجد رسوم بعد.",
    "hide": "إخفاء",
    "back": "رجوع",
    "operation_failed": "فشلت العملية. حاول مرة أخرى.",

    // Leases
    "leases": "عقود الإيجار",
    "add_lease": "إضافة عقد إيجار",
    "property": "العقار",
    "unit": "الوحدة",
    "tenant": "الشخص",
    "start_date": "تاريخ البدء",
    "end_date": "تاريخ الانتهاء",
    "monthly_rent_egp": "الإيجار الشهري (ج.م)",
    "due_day": "يوم الاستحقاق",
    "late_fee_percent": "نسبة رسوم التأخير %",
    "security_deposit_egp": "مبلغ التأمين (ج.م)",
    "period": "الفترة",
    "rent": "الإيجار",
    "end": "إنهاء",
    "confirm_end_lease": "هل أنت متأكد من إنهاء عقد الإيجار هذا؟",
    "confirm_delete_lease": "هل أنت متأكد من حذف عقد الإيجار هذا؟",
    "select_property": "اختر العقار",
    "select_unit": "اختر الوحدة",
    "select_tenant": "اختر الشخص",
    "no_leases": "لا توجد عقود إيجار بعد.",
    "failed_load_leases": "فشل تحميل عقود الإيجار.",
    "failed_load_lease": "فشل تحميل عقد الإيجار.",
    "month_short": "شهر",
    "charges_payments": "الرسوم والمدفوعات",
    "deposits": "الودائع والتأمينات",
    "due_day_label": "يوم الدفع",
    "deposit_label": "التأمين",
    "late_fee_label": "رسوم التأخير",

    // Charges & Payments
    "charges": "الرسوم",
    "add_charge": "إضافة رسم مالي",
    "amount_cents": "المبلغ (ج.م)",
    "category": "الفئة",
    "charge_date": "تاريخ الرسم المالي",
    "rent_category": "إيجار",
    "late_fee_category": "رسوم تأخير",
    "other_category": "أخرى",
    "charged": "مفروض",
    "payments": "المدفوعات",
    "log_payment": "تسجيل دفعة",
    "method": "طريقة الدفع",
    "no_payments": "لا توجد مدفوعات بعد.",
    "confirm_delete_payment": "هل أنت متأكد من حذف هذه الدفعة؟",
    "confirm_delete_charge": "هل أنت متأكد من حذف هذا الرسم المالي؟",
    "nav_debts": "الديون",
    "debts": "الديون",
    "personal_debts": "الديون الشخصية",
    "add_debt": "إضافة دين",
    "amount_egp": "المبلغ (ج.م)",
    "debt_date": "تاريخ الدين",
    "elapsed_duration": "المدة المنقضية",
    "confirm_delete_debt": "هل أنت متأكد من حذف هذا الدين؟",
    "no_debts_found": "لم يتم العثور على ديون.",
    "remaining": "المتبقي",
    "on": "في",

    // Deposits
    "add_deposit": "إضافة تأمين/وديعة",
    "no_deposits": "لا توجد تأمينات بعد.",
    "collected": "تم تحصيلها",

    // Statuses
    "status_paid": "مدفوع",
    "status_partial": "جزئي",
    "status_unpaid": "غير مدفوع",
    "status_overdue": "متأخر",
    "status_active": "نشط",
    "status_ended": "منتهي",
    "status_expired": "منتهي الصلاحية",

    // Settings
    "settings": "الإعدادات",
    "account": "الحساب",
    "change_password": "تغيير كلمة المرور",
    "current_password": "كلمة المرور الحالية",
    "new_password": "كلمة المرور الجديدة",
    "confirm_new_password": "تأكيد كلمة المرور الجديدة",
    "passwords_dont_match": "كلمات المرور غير متطابقة.",
    "password_change_unavailable": "تغيير كلمة المرور غير متاح حالياً.",

    // Filters
    "all_tenants": "جميع الأشخاص",
    "all_statuses": "جميع الحالات",
    "overdue_only": "المتأخرات فقط",
    "pay": "دفع",
    "del": "حذف",
    "no_charges_found": "لم يتم العثور على رسوم.",

    // Validation schemas
    "name_required": "الاسم مطلوب",
    "unit_required": "الوحدة مطلوبة",
    "tenant_required": "الشخص مطلوب",
    "start_date_required": "تاريخ البدء مطلوب",
    "end_date_required": "تاريخ الانتهاء مطلوب",
    "rent_amount_required": "مبلغ الإيجار مطلوب",
    "must_be_positive": "يجب أن تكون القيمة موجبة",
    "due_day_required": "يوم الاستحقاق مطلوب",
    "description_required": "الوصف مطلوب",
    "amount_required": "المبلغ مطلوب",
    "date_required": "التاريخ مطلوب",
    
    // Language names
    "english": "English",
    "arabic": "العربية",

    // New (redesign)
    "no_data": "لا توجد بيانات",
    "welcome_back": "مرحباً بعودتك",
    "todays_date": "تاريخ اليوم",
    "confirm_title": "هل أنت متأكد؟",
    "delete_confirm_title": "تأكيد الحذف",
    "language_toggle": "تبديل اللغة",
    "optional": "(اختياري)",
    "not_set": "غير محدد",
    "add_first_property": "ابدأ بإضافة عقار",
    "add_first_tenant": "ابدأ بإضافة شخص",
    "add_first_lease": "ابدأ بإضافة عقد إيجار",
    "properties_desc": "إدارة عقاراتك ووحداتها",
    "tenants_desc": "إدارة الأشخاص والمستأجرين",
    "leases_desc": "عقود الإيجار النشطة والمنتهية",
    "charges_desc": "جميع الرسوم والمدفوعات",
    "debts_desc": "الديون الشخصية والمستحقات",
    "edit_property": "تعديل العقار",
    "edit_tenant": "تعديل بيانات الشخص",
    "confirm": "تأكيد",
    "nothing_to_update": "لا يوجد شيء للتحديث",
    "property_created": "تم إنشاء العقار",
    "property_deleted": "تم حذف العقار",
    "tenant_created": "تم إضافة الشخص",
    "tenant_deleted": "تم حذف الشخص",
    "tenant_updated": "تم تحديث بيانات الشخص",
    "payment_logged": "تم تسجيل الدفعة",
    "debt_deleted": "تم حذف الدين",
    "debt_added": "تم إضافة الدين",
    "lease_created": "تم إنشاء عقد الإيجار",
    "lease_ended": "تم إنهاء عقد الإيجار",
    "lease_deleted": "تم حذف عقد الإيجار",
    "charge_added": "تم إضافة الرسم المالي",
    "charge_deleted": "تم حذف الرسم المالي",
    "back_to_list": "العودة إلى القائمة"
  },
  en: {
    // Navigation / Sidebar
    "nav_dashboard": "Dashboard",
    "nav_properties": "Properties",
    "nav_tenants": "People",
    "nav_leases": "Leases",
    "nav_charges": "Charges",
    "nav_settings": "Settings",
    "logout": "Logout",
    "logged_in_as": "Logged in as",

    // Login page
    "login_title": "Rental Ledger",
    "username": "Username",
    "new_username": "New Username",
    "change_username": "Change Username",
    "credentials_updated_success": "Credentials updated successfully!",
    "password": "Password",
    "sign_in": "Sign In",
    "signing_in": "Signing in...",
    "invalid_credentials": "Invalid username or password",
    "username_required": "Username is required",
    "password_required": "Password is required",

    // Dashboard
    "dashboard": "Dashboard",
    "active_leases": "Active Leases",
    "overdue_charges": "Overdue Charges",
    "total_owed_to_you": "Total Owed to You",
    "deposits_held": "Deposits Held",
    "expiring_soon": "Expiring Soon",
    "lease_count_singular": "lease",
    "lease_count_plural": "leases",
    "loading_dashboard": "Loading dashboard...",
    "failed_load_dashboard": "Failed to load dashboard.",

    // Properties list & detail
    "properties": "Properties",
    "add_property": "Add Property",
    "property_name": "Property name",
    "address_optional": "Address (optional)",
    "notes_optional": "Notes (optional)",
    "saving": "Saving...",
    "save": "Save",
    "cancel": "Cancel",
    "name": "Name",
    "address": "Address",
    "created": "Created",
    "actions": "Actions",
    "no_properties": "No properties yet.",
    "delete": "Delete",
    "confirm_delete_property": "Delete this property?",
    "failed_load_properties": "Failed to load properties.",
    "failed_load_charges": "Failed to load charges.",
    "loading": "Loading...",
    "no_address": "No address",
    "failed_load_property": "Failed to load property.",

    // Units
    "units": "Units",
    "add_unit": "Add Unit",
    "unit_name": "Unit name",
    "no_units": "No units yet.",
    "confirm_delete_unit": "Delete this unit?",

    // Tenants (People)
    "tenants": "People",
    "add_tenant": "Add Person",
    "tenant_name": "Name",
    "email_optional": "Email (optional)",
    "phone_optional": "Phone (optional)",
    "email": "Email",
    "phone": "Phone",
    "notes": "Notes",
    "no_tenants": "No people found.",
    "confirm_delete_tenant": "Delete this person?",
    "failed_load_tenants": "Failed to load people.",
    "failed_load_tenant": "Failed to load person.",
    "person_profile": "Person Profile",
    "rental_leases": "Rental Leases",
    "menu": "Menu",
    "close_menu": "Close Menu",
    "edit": "Edit",
    "save_changes": "Save Changes",
    "net_balance": "Net Balance",
    "charges_ledger": "Charges Ledger",
    "description": "Description",
    "amount": "Amount",
    "paid": "Paid",
    "balance": "Balance",
    "status": "Status",
    "due_date": "Due Date",
    "no_charges": "No charges.",
    "no_charges_yet": "No charges yet.",
    "hide": "Hide",
    "back": "Back",
    "operation_failed": "Operation failed. Please try again.",

    // Leases
    "leases": "Leases",
    "add_lease": "Add Lease",
    "property": "Property",
    "unit": "Unit",
    "tenant": "Person",
    "start_date": "Start Date",
    "end_date": "End Date",
    "monthly_rent_egp": "Monthly Rent (EGP)",
    "due_day": "Due Day",
    "late_fee_percent": "Late Fee %",
    "security_deposit_egp": "Security Deposit (EGP)",
    "period": "Period",
    "rent": "Rent",
    "end": "End",
    "confirm_end_lease": "End this lease?",
    "confirm_delete_lease": "Delete this lease?",
    "select_property": "Select property",
    "select_unit": "Select unit",
    "select_tenant": "Select person",
    "no_leases": "No leases yet.",
    "failed_load_leases": "Failed to load leases.",
    "failed_load_lease": "Failed to load lease.",
    "month_short": "month",
    "charges_payments": "Charges & Payments",
    "deposits": "Deposits",
    "due_day_label": "Due day",
    "deposit_label": "Deposit",
    "late_fee_label": "Late fee",

    // Charges & Payments
    "charges": "Charges",
    "add_charge": "Add Charge",
    "amount_cents": "Amount (EGP)",
    "category": "Category",
    "charge_date": "Charge Date",
    "rent_category": "Rent",
    "late_fee_category": "Late Fee",
    "other_category": "Other",
    "charged": "charged",
    "payments": "Payments",
    "log_payment": "Log Payment",
    "method": "Method",
    "no_payments": "No payments yet.",
    "confirm_delete_payment": "Delete this payment?",
    "confirm_delete_charge": "Delete this charge?",
    "nav_debts": "Debts",
    "debts": "Debts",
    "personal_debts": "Personal Debts",
    "add_debt": "Add Debt",
    "amount_egp": "Amount (EGP)",
    "debt_date": "Debt Date",
    "elapsed_duration": "Elapsed Duration",
    "confirm_delete_debt": "Delete this debt?",
    "no_debts_found": "No debts found.",
    "remaining": "Remaining",
    "on": "on",

    // Deposits
    "add_deposit": "Add Deposit",
    "no_deposits": "No deposits yet.",
    "collected": "Collected",

    // Statuses
    "status_paid": "Paid",
    "status_partial": "Partial",
    "status_unpaid": "Unpaid",
    "status_overdue": "Overdue",
    "status_active": "Active",
    "status_ended": "Ended",
    "status_expired": "Expired",

    // Settings
    "settings": "Settings",
    "account": "Account",
    "change_password": "Change Password",
    "current_password": "Current Password",
    "new_password": "New Password",
    "confirm_new_password": "Confirm New Password",
    "passwords_dont_match": "Passwords do not match.",
    "password_change_unavailable": "Password change is not yet available.",

    // Filters
    "all_tenants": "All people",
    "all_statuses": "All statuses",
    "overdue_only": "Overdue only",
    "pay": "Pay",
    "del": "Del",
    "no_charges_found": "No charges found.",

    // Validation schemas
    "name_required": "Name is required",
    "unit_required": "Unit is required",
    "tenant_required": "Person is required",
    "start_date_required": "Start date is required",
    "end_date_required": "End date is required",
    "rent_amount_required": "Rent amount is required",
    "must_be_positive": "Must be positive",
    "due_day_required": "Due day is required",
    "description_required": "Description is required",
    "amount_required": "Amount is required",
    "date_required": "Date is required",
    
    // Language names
    "english": "English",
    "arabic": "العربية",

    // New (redesign)
    "no_data": "No data yet",
    "welcome_back": "Welcome back",
    "todays_date": "Today's date",
    "confirm_title": "Are you sure?",
    "delete_confirm_title": "Confirm deletion",
    "language_toggle": "Toggle language",
    "optional": "(optional)",
    "not_set": "Not set",
    "add_first_property": "Add your first property",
    "add_first_tenant": "Add your first person",
    "add_first_lease": "Add your first lease",
    "properties_desc": "Manage your properties",
    "tenants_desc": "Manage your people",
    "leases_desc": "Active and past leases",
    "charges_desc": "All charges and payments",
    "debts_desc": "Personal debts and dues",
    "edit_property": "Edit property",
    "edit_tenant": "Edit person",
    "confirm": "Confirm",
    "nothing_to_update": "Nothing to update",
    "property_created": "Property created",
    "property_deleted": "Property deleted",
    "tenant_created": "Person added",
    "tenant_deleted": "Person deleted",
    "tenant_updated": "Person updated",
    "payment_logged": "Payment logged",
    "debt_deleted": "Debt deleted",
    "debt_added": "Debt added",
    "lease_created": "Lease created",
    "lease_ended": "Lease ended",
    "lease_deleted": "Lease deleted",
    "charge_added": "Charge added",
    "charge_deleted": "Charge deleted",
    "back_to_list": "Back to list"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; defaultLanguage?: Language }> = ({ children, defaultLanguage }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (defaultLanguage) return defaultLanguage;
    const saved = localStorage.getItem("lang");
    return (saved === "en" || saved === "ar") ? saved : "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations["en"][key] || key;
    if (variables) {
      Object.entries(variables).forEach(([name, val]) => {
        text = text.replace(`{${name}}`, String(val));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
