if (typeof window === "object") {
  window.ResizeObserver = jest.fn().mockReturnValue({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  });
}
