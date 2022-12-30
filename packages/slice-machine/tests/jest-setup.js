import fetch from "node-fetch";
import "formdata-polyfill";

if (typeof window === "object") {
  window.fetch = async (input, init) => {
    let url;

    try {
      url = new URL(input);
    } catch {
      url = new URL(input, "http://localhost/");
    }

    return await fetch(url, init);
  };
  window.ResizeObserver = jest.fn().mockReturnValue({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  });
}
