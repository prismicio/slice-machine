import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";
import Files from "./files";
export const PackageJson = t.exact(
  t.type({
    name: t.string,
    dependencies: t.record(t.string, t.string),
  })
);

export type PackageJson = t.TypeOf<typeof PackageJson>;

export const PackageJsonHelper = {
  fromPath(pkgPath: string): Error | PackageJson {
    return Files.readEntity<PackageJson>(pkgPath, (payload: unknown) => {
      return getOrElseW(() => new Error(`Unable to decode package.json`))(
        PackageJson.decode(payload)
      );
    });
  },
};
