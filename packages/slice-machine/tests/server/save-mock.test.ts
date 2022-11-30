import { ComponentMocks } from "@slicemachine/core/build/models";
import saveSliceMock from "../../server/src/api/slices/save-mock";
import path from "path";
import { vol } from "memfs";
import { Response } from "express";

jest.mock(`fs`, () => {
  return jest.requireActual("memfs").vol;
});

describe("save-mock", () => {
  afterEach(() => {
    vol.reset();
  });

  test("when given a valid mock it should save it to the file system", () => {
    const TMP = "tmp";
    const library = "slices";
    const sliceName = "MySlice";
    const content: ComponentMocks = [];
    vol.fromJSON({}, TMP);
    const fakeRes = {
      status: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    saveSliceMock(
      {
        env: { cwd: TMP },
        body: {
          libraryName: library,
          sliceName,
          mock: content,
        },
      },
      fakeRes
    );

    const result = vol.readFileSync(
      path.join(TMP, library, sliceName, "mocks.json"),
      "utf-8"
    ) as string;
    expect(result).toEqual(JSON.stringify(content));
    expect(fakeRes.status).not.toHaveBeenCalled();
    expect(fakeRes.json).toHaveBeenCalledWith(content);
  });

  test("when given an invalid mock it should return a 400 status code", () => {
    const TMP = "tmp";
    const library = "slices";
    const sliceName = "MySlice";
    const content = [{ foo: "barr" }] as unknown as ComponentMocks;
    vol.fromJSON({}, TMP);
    const fakeRes = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    saveSliceMock(
      {
        env: { cwd: TMP },
        body: {
          libraryName: library,
          sliceName,
          mock: content,
        },
      },
      fakeRes
    );

    const result = vol.existsSync(
      path.join(TMP, library, sliceName, "mocks.json")
    );
    expect(result).toBeFalsy();
    expect(fakeRes.status).toHaveBeenCalledWith(400);
    expect(fakeRes.end).toHaveBeenCalled();
    expect(fakeRes.json).not.toHaveBeenCalled();
  });
});
