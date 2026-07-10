const CURRENCY = "EGP";

export function Money({ cents }: { cents: number }) {
  const value = (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return <span>{CURRENCY} {value}</span>;
}
