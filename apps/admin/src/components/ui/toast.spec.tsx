import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./toast";

afterEach(() => {
  cleanup();
});

function Demo() {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        toast({
          description: "The product list has been refreshed.",
          title: "Saved successfully",
          variant: "success"
        })
      }
    >
      Trigger toast
    </button>
  );
}

describe("ToastProvider", () => {
  it("renders a toast when requested by a child component", () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /trigger toast/i }));

    expect(screen.getByText(/saved successfully/i)).toBeTruthy();
    expect(screen.getByText(/product list has been refreshed/i)).toBeTruthy();
  });
});
