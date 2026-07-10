import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Money } from "./Money";
import { LanguageProvider } from "../context/LanguageContext";

describe("Money", () => {
  it("formats integer cents as EGP currency in English", () => {
    render(
      <LanguageProvider defaultLanguage="en">
        <Money cents={123400} />
      </LanguageProvider>
    );
    expect(screen.getByText((content: string) => content.includes("EGP") && content.includes("1,234"))).toBeTruthy();
  });

  it("formats integer cents as ج.م currency in Arabic", () => {
    render(
      <LanguageProvider defaultLanguage="ar">
        <Money cents={123400} />
      </LanguageProvider>
    );
    expect(screen.getByText((content: string) => content.includes("1,234") || content.includes("١٬٢٣٤"))).toBeTruthy();
  });
});
