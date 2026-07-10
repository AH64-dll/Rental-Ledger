function toArabicNumerals(num: number): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d)]);
}

export function formatDuration(years: number, months: number, days: number, lang: "ar" | "en" = "ar"): string {
  if (years === 0 && months === 0 && days === 0) {
    return lang === "ar" ? "٠ يوم" : "0 days";
  }

  const parts: string[] = [];

  if (lang === "ar") {
    if (years > 0) {
      if (years === 1) {
        parts.push("سنة");
      } else if (years === 2) {
        parts.push("سنتين");
      } else if (years >= 3 && years <= 10) {
        parts.push(`${toArabicNumerals(years)} سنوات`);
      } else {
        parts.push(`${toArabicNumerals(years)} سنة`);
      }
    }

    if (months > 0) {
      if (months === 1) {
        parts.push("شهر");
      } else if (months === 2) {
        parts.push("شهرين");
      } else if (months >= 3 && months <= 10) {
        parts.push(`${toArabicNumerals(months)} أشهر`);
      } else {
        parts.push(`${toArabicNumerals(months)} شهراً`);
      }
    }

    if (days > 0) {
      if (days === 1) {
        parts.push("يوم");
      } else if (days === 2) {
        parts.push("يومين");
      } else if (days >= 3 && days <= 10) {
        parts.push(`${toArabicNumerals(days)} أيام`);
      } else {
        parts.push(`${toArabicNumerals(days)} يوماً`);
      }
    }

    return parts.join(" و");
  } else {
    if (years > 0) {
      parts.push(years === 1 ? "1 year" : `${years} years`);
    }
    if (months > 0) {
      parts.push(months === 1 ? "1 month" : `${months} months`);
    }
    if (days > 0) {
      parts.push(days === 1 ? "1 day" : `${days} days`);
    }
    return parts.join(", ");
  }
}

export function getElapsedDuration(startDateStr: string, endDate: Date = new Date(), lang: "ar" | "en" = "ar"): string {
  if (!startDateStr) return "";
  
  const parts = startDateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);
  const normalizedStart = new Date(year, month, day);
  if (isNaN(normalizedStart.getTime())) return "";

  // Normalize start and end to local midnight to avoid time/DST discrepancy
  const startYear = year;
  const startMonth = month;
  const startDay = day;

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();
  const normalizedEnd = new Date(endYear, endMonth, endDay);

  if (normalizedStart > normalizedEnd) {
    return formatDuration(0, 0, 0, lang);
  }

  let years = endYear - startYear;
  let tempDate = new Date(startYear + years, startMonth, startDay);
  if (tempDate > normalizedEnd) {
    years--;
  }

  let months = 0;
  while (true) {
    const nextTempDate = new Date(startYear + years, startMonth + months + 1, startDay);
    if (nextTempDate <= normalizedEnd) {
      months++;
    } else {
      break;
    }
  }

  tempDate = new Date(startYear + years, startMonth + months, startDay);
  const diffTime = normalizedEnd.getTime() - tempDate.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return formatDuration(years, months, days, lang);
}

export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalOneYearLaterDateString(): string {
  const d = new Date();
  const year = d.getFullYear() + 1;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
