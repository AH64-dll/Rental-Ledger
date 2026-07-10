import { useLanguage } from "../context/LanguageContext";

export function Money({ cents }: { cents: number }) {
  const { language } = useLanguage();
  const value = (cents / 100).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (language === "ar") {
    return <span>{value} ج.م</span>;
  }
  return <span>EGP {value}</span>;
}

