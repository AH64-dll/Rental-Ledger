import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "./StatusPill";
import { LanguageProvider } from "../context/LanguageContext";

const ENGLISH_TRANSLATIONS = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  overdue: "Overdue",
};

const ARABIC_TRANSLATIONS = {
  paid: "مدفوع",
  partial: "جزئي",
  unpaid: "غير مدفوع",
  overdue: "متأخر",
};

describe("StatusPill", () => {
  it.each(["paid", "partial", "unpaid", "overdue"] as const)(
    "renders status %s in English",
    (status) => {
      render(
        <LanguageProvider defaultLanguage="en">
          <StatusPill status={status} />
        </LanguageProvider>
      );
      expect(screen.getByText(ENGLISH_TRANSLATIONS[status])).toBeTruthy();
    }
  );

  it.each(["paid", "partial", "unpaid", "overdue"] as const)(
    "renders status %s in Arabic",
    (status) => {
      render(
        <LanguageProvider defaultLanguage="ar">
          <StatusPill status={status} />
        </LanguageProvider>
      );
      expect(screen.getByText(ARABIC_TRANSLATIONS[status])).toBeTruthy();
    }
  );
});

