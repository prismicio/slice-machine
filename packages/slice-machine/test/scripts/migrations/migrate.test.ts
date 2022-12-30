import { describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { migrate } from "../../../scripts/migration/migrate";
import { run } from "../../../scripts/migration/run";

vi.mock("../../../scripts/migration/run", () => ({
  run: vi.fn(),
}));

describe("Changelog.migrate", () => {
  const runMock = vi.mocked(run);

  it("Should execute migration if there is not _latest in sm.json", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    const manifest = {
      apiEndpoint: "https://fake.prismic.io/api/v2",
    };

    await fs.writeFile(path.join(cwd, "sm.json"), JSON.stringify(manifest));

    await migrate({ cwd, ignorePromptForTest: true, manifest });

    expect(runMock).toHaveBeenCalled();
    const migrationToExecute = runMock.mock.calls[0][0];

    expect(Array.isArray(migrationToExecute)).toBe(true);
    // at least one migration must execute
    expect(migrationToExecute.length).toBeGreaterThan(0);
  });

  it("Should execute migration if older version", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    const manifest = {
      apiEndpoint: "https://fake.prismic.io/api/v2",
      _latest: "0.0.45",
    };

    await fs.writeFile(path.join(cwd, "sm.json"), JSON.stringify(manifest));

    await migrate({ cwd, ignorePromptForTest: true, manifest });

    expect(runMock).toHaveBeenCalled();

    expect(runMock).toHaveBeenCalled();
    const migrationToExecute = runMock.mock.calls[0][0];

    expect(Array.isArray(migrationToExecute)).toBe(true);
    // at least one migration must execute
    expect(migrationToExecute.length).toBeGreaterThan(0);
  });

  it("Should not execute migration if up to date", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    const manifest = {
      apiEndpoint: "https://fake.prismic.io/api/v2",
      _latest: "100.0.0",
    };

    await fs.writeFile(path.join(cwd, "sm.json"), JSON.stringify(manifest));

    await migrate({ cwd, ignorePromptForTest: true, manifest });

    // should not execute any migrations
    expect(runMock).not.toHaveBeenCalled();
  });
});
