import { vol } from "memfs";
import { migrate } from "../../../scripts/migration/migrate";
import { run } from "../../../scripts/migration/run";

const CwdTmp = "./tmp";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

jest.mock("../../../scripts/migration/run", () => ({
  run: jest.fn(),
}));

describe("Changelog.migrate", () => {
  afterEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  const runMock = run as jest.Mock;

  it("Should execute migration if there is not _latest in sm.json", async () => {
    vol.fromJSON(
      {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://fake.prismic.io/api/v2",
        }),
      },
      CwdTmp
    );

    await migrate({ cwd: CwdTmp, ignorePromptForTest: true });

    expect(runMock).toHaveBeenCalled();
    const migrationToExecute = runMock.mock.calls[0][0];

    expect(Array.isArray(migrationToExecute)).toBe(true);
    // at least one migration must execute
    expect(migrationToExecute.length).toBeGreaterThan(0);
  });

  it("Should execute migration if older version", async () => {
    vol.fromJSON(
      {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://fake.prismic.io/api/v2",
          _latest: "0.0.45",
        }),
      },
      CwdTmp
    );

    await migrate({ cwd: CwdTmp, ignorePromptForTest: true });

    expect(runMock).toHaveBeenCalled();

    expect(runMock).toHaveBeenCalled();
    const migrationToExecute = runMock.mock.calls[0][0];

    expect(Array.isArray(migrationToExecute)).toBe(true);
    // at least one migration must execute
    expect(migrationToExecute.length).toBeGreaterThan(0);
  });

  it("Should not execute migration if up to date", async () => {
    vol.fromJSON(
      {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://fake.prismic.io/api/v2",
          _latest: "100.0.0",
        }),
      },
      CwdTmp
    );

    await migrate({ cwd: CwdTmp, ignorePromptForTest: true });

    // should not execute any migrations
    expect(runMock).not.toHaveBeenCalled();
  });
});
