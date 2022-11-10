import Files from "../../utils/files";
import { MocksConfig } from "../../models/paths";
import { GlobalMockConfig } from "@lib/models/common/MockConfig";

export const getConfig = (cwd: string) => {
  const pathToMockConfig = MocksConfig(cwd);
  if (Files.exists(pathToMockConfig)) {
    return Files.readJson<GlobalMockConfig>(pathToMockConfig);
  }
  return {};
};

export const writeConfig = (cwd: string, config: GlobalMockConfig) => {
  Files.write(MocksConfig(cwd), config);
};

export const insert = (
  cwd: string,
  {
    key,
    prefix = null,
    value,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { key: string; prefix: string | null; value: any }
) => {
  const config = getConfig(cwd);
  const withInsert = {
    ...config,
    ...(prefix
      ? {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          [prefix]: {
            ...config[prefix],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
            [key]: value,
          },
        }
      : {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          [key]: value,
        }),
  };

  writeConfig(cwd, withInsert);
  return withInsert;
};

export const remove = (
  cwd: string,
  { key, prefix }: { key: string; prefix: string }
) => {
  const config = getConfig(cwd);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete config[prefix][key];

  writeConfig(cwd, config);
  return config;
};
