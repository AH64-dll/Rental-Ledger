import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it.each(["paid", "partial", "unpaid", "overdue"] as const)(
    "renders status %s",
    (status) => {
      render(<StatusPill status={status} />);
      expect(screen.getByText(status)).toBeTruthy();
    }
  );
});
