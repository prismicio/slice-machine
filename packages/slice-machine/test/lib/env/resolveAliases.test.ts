import { describe, expect, it, vi } from "vitest";
import { resolveAliases } from "../../../lib/env/resolveAliases";
import moduleAlias from "module-alias";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

vi.mock("module-alias", () => {
  return {
    default: {
      addAlias: vi.fn(),
    },
  };
});

describe("ResolveAliases", () => {
  it("Should call the module aliases library", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    // create the package.json with the alias, and the file to be found later on.
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        _moduleAliases: {
          "@ex": "extra",
          "@tmp": "tmp",
        },
      })
    );

    resolveAliases(cwd);
    expect(moduleAlias.addAlias).toHaveBeenCalledWith(
      "@ex",
      expect.any(Function)
    );
    expect(moduleAlias.addAlias).toHaveBeenCalledWith(
      "@tmp",
      expect.any(Function)
    );
  });
});
