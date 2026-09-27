import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

beforeEach(() => {
  localStorage.clear();
  setNewLifeAiDialogueConsent("declined");
});

describe("NEW LIFE free input to visible world-state consequence", () => {
  it("lets an explicit Day 9 free action change the rendered cafe boundary", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();
    for (let day = 1; day < 9; day += 1) await user.click(screen.getByRole("button", { name: /\u6b21\u306e\u65e5\u3078/ }));
    await user.selectOptions(screen.getByRole("combobox"), "miyoko");
    expect(screen.getByRole("combobox")).toHaveValue("miyoko");
    expect(screen.getByText(/\u55ab\u8336\u306e\u5e2d.*\u307e\u3060\u66d6\u6627/)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/\u81ea\u7531/), "\u5e2d\u306e\u4f7f\u3048\u308b\u7bc4\u56f2\u3092\u78ba\u8a8d\u3057\u3088\u3046");
    await user.click(screen.getByRole("button", { name: /\u8a71\u3059/ }));
    await waitFor(() => expect(screen.getByText(/\u55ab\u8336\u306e\u5e2d.*\u4f7f\u3048\u308b\u7bc4\u56f2\u3092\u78ba\u8a8d\u3057\u305f/)).toBeInTheDocument());
  });
});
