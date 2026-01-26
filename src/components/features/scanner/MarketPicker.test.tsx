import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketPicker } from "./MarketPicker";
import type { Market } from "@/types";

// Mock hooks
const mockUseMarkets = vi.fn();
const mockAddMarket = vi.fn();
const mockQueueCreate = vi.fn();

vi.mock("@/hooks", () => ({
  useMarkets: (...args: unknown[]) => mockUseMarkets(...args),
  addMarket: (...args: unknown[]) => mockAddMarket(...args),
  queueCreate: (...args: unknown[]) => mockQueueCreate(...args),
}));

describe("MarketPicker", () => {
  const mockUserId = "test-user-123";
  const mockOnSelect = vi.fn();
  const mockOnOpenChange = vi.fn();

  const mockMarkets: (Market & { id: number })[] = [
    {
      id: 1,
      name: "Marché Aligre",
      userId: mockUserId,
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Marché Bastille",
      userId: mockUserId,
      createdAt: "2026-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMarkets.mockReturnValue({ markets: mockMarkets, isLoading: false });
    mockAddMarket.mockResolvedValue(3);
    mockQueueCreate.mockResolvedValue(1);
  });

  it("renders the sheet with market list when open", () => {
    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    expect(screen.getByText("Sélectionner un marché")).toBeInTheDocument();
    expect(screen.getByText("Aucun marché")).toBeInTheDocument();
    expect(screen.getByText("Marché Aligre")).toBeInTheDocument();
    expect(screen.getByText("Marché Bastille")).toBeInTheDocument();
  });

  it("lists markets sorted alphabetically by name", () => {
    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    const marketButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Marché"));

    // Aligre should come before Bastille
    expect(marketButtons[0]).toHaveTextContent("Marché Aligre");
    expect(marketButtons[1]).toHaveTextContent("Marché Bastille");
  });

  it("calls onSelect with marketId when a market is selected", async () => {
    const user = userEvent.setup();

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    await user.click(screen.getByText("Marché Bastille"));

    expect(mockOnSelect).toHaveBeenCalledWith(2);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onSelect with undefined when "Aucun marché" is selected', async () => {
    const user = userEvent.setup();

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={1}
        userId={mockUserId}
      />,
    );

    await user.click(screen.getByText("Aucun marché"));

    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows checkmark indicator on selected market", () => {
    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={2}
        userId={mockUserId}
      />,
    );

    // Find the Bastille button and check it has the checkmark
    const bastilleButton = screen
      .getByText("Marché Bastille")
      .closest("button");
    expect(bastilleButton).toHaveAttribute("data-selected", "true");
  });

  it("shows loading state when markets are loading", () => {
    mockUseMarkets.mockReturnValue({ markets: undefined, isLoading: true });

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    expect(screen.getByTestId("market-picker-loading")).toBeInTheDocument();
  });

  it("shows empty state when no markets exist", () => {
    mockUseMarkets.mockReturnValue({ markets: [], isLoading: false });

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    expect(screen.getByText("Aucun marché créé")).toBeInTheDocument();
  });

  it('renders "+ Ajouter un marché" button that reveals the quick-add form', async () => {
    const user = userEvent.setup();

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    // Form should be hidden initially
    expect(
      screen.queryByPlaceholderText("Nom du marché"),
    ).not.toBeInTheDocument();

    // "+ Ajouter un marché" button should be visible
    const addButton = screen.getByText("Ajouter un marché");
    expect(addButton).toBeInTheDocument();

    // Click to reveal form
    await user.click(addButton);

    // Form should now be visible
    expect(screen.getByPlaceholderText("Nom du marché")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
  });

  it("creates a new market and auto-selects it when quick-add form is submitted", async () => {
    const user = userEvent.setup();

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    // First click "+ Ajouter un marché" to reveal form
    await user.click(screen.getByText("Ajouter un marché"));

    // Type market name
    const input = screen.getByPlaceholderText("Nom du marché");
    await user.type(input, "Nouveau Marché");

    // Click Ajouter button
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    // Wait for async operations
    await waitFor(() => {
      expect(mockAddMarket).toHaveBeenCalledWith({
        name: "Nouveau Marché",
        userId: mockUserId,
        createdAt: expect.any(String),
      });
    });

    expect(mockQueueCreate).toHaveBeenCalledWith("market", 3, {
      name: "Nouveau Marché",
      userId: mockUserId,
      createdAt: expect.any(String),
    });

    // Should auto-select the new market (id: 3)
    expect(mockOnSelect).toHaveBeenCalledWith(3);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows loading state during market creation", async () => {
    const user = userEvent.setup();

    // Make addMarket slow
    mockAddMarket.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(3), 100)),
    );

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    // First click "+ Ajouter un marché" to reveal form
    await user.click(screen.getByText("Ajouter un marché"));

    const input = screen.getByPlaceholderText("Nom du marché");
    await user.type(input, "Test");

    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    // Input should be disabled during creation
    expect(input).toBeDisabled();
  });

  it("validates that market name is not empty", async () => {
    const user = userEvent.setup();

    render(
      <MarketPicker
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        selectedMarketId={undefined}
        userId={mockUserId}
      />,
    );

    // First click "+ Ajouter un marché" to reveal form
    await user.click(screen.getByText("Ajouter un marché"));

    // Try to add empty market - button should be disabled
    const addButton = screen.getByRole("button", { name: "Ajouter" });
    expect(addButton).toBeDisabled();

    // Type spaces only
    const input = screen.getByPlaceholderText("Nom du marché");
    await user.type(input, "   ");

    // Button should still be disabled with only whitespace
    expect(addButton).toBeDisabled();
  });
});
