import { vol } from "memfs";
import { resolveAliases } from "../../../lib/env/resolveAliases";
import moduleAlias from "module-alias";

const CwdTmp = "./tmp";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

jest.mock("module-alias", () => {
  return {
    addAlias: jest.fn(),
  };
});

describe("ResolveAliases", () => {
  afterEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  const addAliasMock = moduleAlias.addAlias as jest.Mock;

  it("Should call the module aliases library", () => {
    // create the package.json with the alias, and the file to be found later on.
    vol.fromJSON(
      {
        "package.json": JSON.stringify({
          _moduleAliases: {
            "@ex": "extra",
            "@tmp": "tmp",
          },
        }),
      },
      CwdTmp
    );

    resolveAliases(CwdTmp);
    expect(addAliasMock).toHaveBeenCalledTimes(2);
    expect(addAliasMock.mock.calls[0][0]).toEqual("@ex");
    expect(addAliasMock.mock.calls[1][0]).toEqual("@tmp");
  });
});
