import { isRight } from "fp-ts/Either";

import { Files } from "../utils"
import { CustomPaths, GeneratedPaths } from "../filesystem/paths"
import { SliceMock } from "../models/SliceMock";

/** This only works with local libraries atm */
export function sliceMocks(cwd: string, lib: string, sliceName: string): SliceMock | undefined {

  const pathToLocalMock = CustomPaths(cwd).library(lib).slice(sliceName).mocks()
  const pathToDataMocks = GeneratedPaths(cwd).library(lib).slice(sliceName).mocks()

  return Files.readFirstOf<SliceMock | undefined>([pathToLocalMock, pathToDataMocks])((mocks: string) => {
    console.log(mocks)
    const decoded = SliceMock.decode(JSON.parse(mocks))
    console.log(decoded)
    if(isRight(decoded)) return decoded.right
    else return
  })?.value
}