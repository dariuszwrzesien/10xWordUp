import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import React from "react";

/**
 * Example unit test for a simple component
 * This demonstrates basic Vitest testing patterns with React Testing Library
 */

// Example component to test
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

describe("Counter Component", () => {
  it("should render with initial count of 0", () => {
    render(<Counter />);
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  it("should increment count when increment button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const incrementButton = screen.getByRole("button", { name: /increment/i });
    await user.click(incrementButton);

    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });

  it("should reset count when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const incrementButton = screen.getByRole("button", { name: /increment/i });
    const resetButton = screen.getByRole("button", { name: /reset/i });

    // Increment a few times
    await user.click(incrementButton);
    await user.click(incrementButton);
    expect(screen.getByText("Count: 2")).toBeInTheDocument();

    // Then reset
    await user.click(resetButton);
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });
});

/**
 * Example of testing with mocks
 */
describe("Function Mocking Examples", () => {
  it("should use vi.fn() for function mocks", () => {
    const mockCallback = vi.fn();

    // Call the mock
    mockCallback("test");

    // Verify it was called
    expect(mockCallback).toHaveBeenCalledWith("test");
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should use vi.spyOn() to monitor existing functions", () => {
    const obj = {
      method: (x: number) => x * 2,
    };

    const spy = vi.spyOn(obj, "method");

    const result = obj.method(5);

    expect(spy).toHaveBeenCalledWith(5);
    expect(result).toBe(10);

    spy.mockRestore();
  });
});
