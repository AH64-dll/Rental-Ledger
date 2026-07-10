import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Money } from "./Money";

describe("Money", () => {
  it("formats integer cents as EGP currency", () => {
    render(<Money cents={123456} />);
    expect(screen.getByText(/EGP 1,234\.56/)).toBeTruthy();
  });
});
