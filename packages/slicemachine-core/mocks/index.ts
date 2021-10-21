import { Files } from "../utils"
import { CustomPaths, GeneratedPaths } from "../filesystem/paths"

/** This only works with local libraries atm */
export const sliceMocks = (cwd: string, lib: string, sliceName: string) => {
  
  const pathToLocalMock = CustomPaths(cwd).library(lib).slice(sliceName).mocks()
  const pathToDataMocks = GeneratedPaths(cwd).library(lib).slice(sliceName).mocks()

  if (Files.exists(pathToLocalMock)) {
    return Files.safeReadJson(pathToLocalMock)
  }
  if (Files.exists(pathToDataMocks)) {
    return Files.safeReadJson(pathToDataMocks)
  }
  return null
}