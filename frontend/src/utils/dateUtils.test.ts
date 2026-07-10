import { describe, it, expect } from "vitest";
import {
  getElapsedDuration,
  formatDuration,
  getLocalDateString,
  getLocalOneYearLaterDateString,
} from "./dateUtils";

describe("dateUtils - formatDuration", () => {
  it("formats zero duration correctly", () => {
    expect(formatDuration(0, 0, 0, "en")).toBe("0 days");
    expect(formatDuration(0, 0, 0, "ar")).toBe("٠ يوم");
  });

  it("handles English pluralization correctly", () => {
    // 1 year, 3 months, 5 days
    expect(formatDuration(1, 3, 5, "en")).toBe("1 year, 3 months, 5 days");
    // plurals and singulars
    expect(formatDuration(2, 1, 2, "en")).toBe("2 years, 1 month, 2 days");
    expect(formatDuration(0, 0, 1, "en")).toBe("1 day");
    expect(formatDuration(0, 2, 0, "en")).toBe("2 months");
  });

  it("handles Arabic pluralization correctly", () => {
    // 1 year, 3 months, 5 days
    // "سنة" (1) + "و" + "٣ أشهر" (3-10) + "و" + "٥ أيام" (3-10)
    // Joined: "سنة و٣ أشهر و٥ أيام"
    expect(formatDuration(1, 3, 5, "ar")).toBe("سنة و٣ أشهر و٥ أيام");

    // Dual forms
    // 2 years, 2 months, 2 days
    // "سنتين" + "و" + "شهرين" + "و" + "يومين"
    // Joined: "سنتين وشهرين ويومين"
    expect(formatDuration(2, 2, 2, "ar")).toBe("سنتين وشهرين ويومين");

    // 1 year, 1 month, 1 day
    // "سنة وشهر ويوم"
    expect(formatDuration(1, 1, 1, "ar")).toBe("سنة وشهر ويوم");

    // Plural/singular checks for 3-10 vs 11-99
    // 11 years, 11 months, 11 days
    // "١١ سنة" (11-99) + "و" + "١١ شهراً" (11-99) + "و" + "١١ يوماً" (11-99)
    expect(formatDuration(11, 11, 11, "ar")).toBe("١١ سنة و١١ شهراً و١١ يوماً");

    // 3 years, 4 months, 10 days
    // "٣ سنوات" (3-10) + "و" + "٤ أشهر" (3-10) + "و" + "١٠ أيام" (3-10)
    expect(formatDuration(3, 4, 10, "ar")).toBe("٣ سنوات و٤ أشهر و١٠ أيام");
  });
});

describe("dateUtils - getElapsedDuration", () => {
  it("calculates accurate elapsed duration between dates", () => {
    const start = "2023-05-15";
    const end = new Date(2026, 6, 10); // July 10, 2026 (month is 0-indexed, so 6 is July)
    
    // English: 3 years, 1 month, 25 days
    expect(getElapsedDuration(start, end, "en")).toBe("3 years, 1 month, 25 days");

    // Arabic: ٣ سنوات وشهر و٢٥ يوماً
    // 3 years -> "٣ سنوات"
    // 1 month -> "شهر"
    // 25 days -> "٢٥ يوماً" (25 is >=11)
    // Joined: "٣ سنوات وشهر و٢٥ يوماً"
    expect(getElapsedDuration(start, end, "ar")).toBe("٣ سنوات وشهر و٢٥ يوماً");
  });
});

describe("dateUtils - getLocalDateString", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const dateStr = getLocalDateString();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    expect(year).toBeGreaterThanOrEqual(2026);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

describe("dateUtils - getLocalOneYearLaterDateString", () => {
  it("returns a string one year from now in YYYY-MM-DD format", () => {
    const dateStr = getLocalOneYearLaterDateString();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(dateStr.split("-")[0], 10);
    expect(targetYear).toBe(currentYear + 1);
  });
});
