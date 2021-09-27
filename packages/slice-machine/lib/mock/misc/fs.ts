import Files from "../../utils/files";
import { MocksConfig } from "../../models/paths";

export const getConfig = (cwd: string) => {
  const pathToMockConfig = MocksConfig(cwd);
  if (Files.exists(pathToMockConfig)) {
    return Files.readJson(pathToMockConfig);
  }
  return {};
};

export const writeConfig = (cwd: string, config: any) => {
  Files.write(MocksConfig(cwd), config);
};

export const insert = (
  cwd: string,
  {
    key,
    prefix = null,
    value,
  }: { key: string; prefix: string | null; value: any }
) => {
  const config = getConfig(cwd);
  const withInsert = {
    ...config,
    ...(prefix
      ? {
          [prefix]: {
            ...config[prefix],
            [key]: value,
          },
        }
      : {
          [key]: value,
        }),
  };

  writeConfig(cwd, withInsert);
  return withInsert;
};
