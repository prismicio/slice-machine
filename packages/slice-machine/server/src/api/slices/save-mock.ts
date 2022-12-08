import { ComponentMocks } from "@slicemachine/core/build/models";
import { sliceMockPath } from "@slicemachine/core/build/node-utils";
import { Files } from "@slicemachine/core/build/node-utils";
import * as t from "io-ts";
import { Response } from "express";
import { fold } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

function saveSliceMockToFileSystem(
  cwd: string,
  libraryName: string,
  sliceName: string,
  mock: ComponentMocks
) {
  const path = sliceMockPath(cwd, libraryName, sliceName);
  return Files.writeJson(path, mock);
}

export const SaveMockBody = t.strict({
  sliceName: t.string,
  libraryName: t.string,
  mock: ComponentMocks,
});

export type SaveMockBody = t.TypeOf<typeof SaveMockBody>;

const SaveMockRequest = t.strict({
  env: t.strict({ cwd: t.string }),
  body: SaveMockBody,
});

export type SaveMockRequest = t.TypeOf<typeof SaveMockRequest>;

export default function handler(req: SaveMockRequest, res: Response) {
  fold<unknown, SaveMockRequest, void>(
    () => {
      res.status(400).end();
    },
    ({ body, env }) => {
      saveSliceMockToFileSystem(
        env.cwd,
        body.libraryName,
        body.sliceName,
        body.mock
      );
      res.json(body);
    }
  )(SaveMockRequest.decode(req));
}
