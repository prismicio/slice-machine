import { describe, expect, it, vi } from "vitest";
import { validateManifest } from "../../../scripts/start/validateManifest";
import { ManifestState } from "../../../lib/env/manifest";

describe("Scripts.start.validateManifest", () => {
  it("Should return true if the manifest is valid", () => {
    vi.spyOn(global.console, "log").mockImplementation(() => null);

    const { isManifestValid } = validateManifest({
      state: ManifestState.Valid,
      message: "",
      content: null,
    });

    expect(isManifestValid).toBe(true);
  });

  it("Should return false if the manifest is missing", () => {
    vi.spyOn(global.console, "log").mockImplementation(() => null);

    const { isManifestValid } = validateManifest({
      state: ManifestState.NotFound,
      message: "",
      content: null,
    });

    expect(isManifestValid).toBe(false);
  });

  it("Should return false if apiEndpoint is missing", () => {
    vi.spyOn(global.console, "log").mockImplementation(() => null);

    const { isManifestValid } = validateManifest({
      state: ManifestState.InvalidJson,
      message: "",
      content: null,
    });

    expect(isManifestValid).toBe(false);
  });

  it("Should return false if apiEndpoint is invalid", () => {
    vi.spyOn(global.console, "log").mockImplementation(() => null);

    const { isManifestValid } = validateManifest({
      state: ManifestState.InvalidJson,
      message: "",
      content: null,
    });

    expect(isManifestValid).toBe(false);
  });

  it("Should return false if the manifest's format is invalid", () => {
    vi.spyOn(global.console, "log").mockImplementation(() => null);

    const { isManifestValid } = validateManifest({
      state: ManifestState.InvalidJson,
      message: "",
      content: null,
    });

    expect(isManifestValid).toBe(false);
  });
});
