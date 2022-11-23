import Files from "../../utils/files";
import { MocksConfig } from "../../models/paths";

export const getConfig = (cwd: string): Record<string, unknown> => {
  const pathToMockConfig = MocksConfig(cwd);
  if (Files.exists(pathToMockConfig)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Files.readJson(pathToMockConfig);
  }
  return {};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeConfig = (cwd: string, config: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const config = getConfig(cwd);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const withInsert = {
    ...config,
    ...(prefix
      ? {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          [prefix]: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return withInsert;
};
