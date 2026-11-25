import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Settings from "@/pages/Settings";
import { emailProblem } from "@/lib/proAccess";

const renderSettings = () =>
  render(
    <MemoryRouter initialEntries={["/settings"]}>
      <AuthProvider>
        <Settings />
      </AuthProvider>
    </MemoryRouter>
  );

const unlockButton = () => screen.findByRole("button", { name: /Unlock Pro/ });

describe("Unlock Pro on /settings", () => {
  const assign = vi.fn();
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    assign.mockReset();
  });

  it("explains a missing email instead of doing nothing", async () => {
    renderSettings();
    fireEvent.click(await unlockButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(/Enter your email to continue/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Your email/)).toHaveFocus();
  });

  it("posts the email to /api/checkout and opens the Stripe page", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/pay/cs_test_abc" }), { status: 200 })
    );
    renderSettings();
    const button = await unlockButton();
    fireEvent.change(screen.getByLabelText(/Your email/), { target: { value: " Buyer@Example.com " } });
    fireEvent.click(button);
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_test_abc"));
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/checkout");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "Buyer@Example.com" });
  });

  it("shows the server's error when checkout cannot start", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Something went wrong on our side. Please try again." }), { status: 500 })
    );
    renderSettings();
    const button = await unlockButton();
    fireEvent.change(screen.getByLabelText(/Your email/), { target: { value: "buyer@example.com" } });
    fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong on our side");
    expect(assign).not.toHaveBeenCalled();
    expect(await unlockButton()).toBeEnabled();
  });

  it("shows an error when the network is down", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    renderSettings();
    const button = await unlockButton();
    fireEvent.change(screen.getByLabelText(/Your email/), { target: { value: "buyer@example.com" } });
    fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent(/offline/);
  });
});

describe("emailProblem", () => {
  it("matches the Worker's email rule", () => {
    expect(emailProblem("", "empty")).toBe("empty");
    expect(emailProblem("   ", "empty")).toBe("empty");
    expect(emailProblem("a@b", "empty")).toMatch(/does not look right/);
    expect(emailProblem("a@b.c", "empty")).toMatch(/does not look right/);
    expect(emailProblem(" Buyer@Example.com ", "empty")).toBeNull();
  });
});
