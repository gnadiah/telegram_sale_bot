import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RootLayout from "./layout";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({
    className: "font-plus-jakarta",
    variable: "--font-sans"
  })
}));

describe("RootLayout", () => {
  it("renders children inside the required html and body tags", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>Admin app</div>
      </RootLayout>
    );

    expect(markup).toContain("<html");
    expect(markup).toContain("<body");
    expect(markup).toContain("Admin app");
  });

  it("suppresses hydration warnings for browser-injected body attributes", () => {
    const element = RootLayout({
      children: <div>Admin app</div>
    });

    expect(element.props.suppressHydrationWarning).toBe(true);
    expect(element.props.children.props.suppressHydrationWarning).toBe(true);
  });
});
