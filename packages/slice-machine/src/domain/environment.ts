import { Environment } from "@slicemachine/manager/client";

/**
 * A partial `Environment` representing the an environment without using data
 * from the Slice Machine API.
 *
 * This type should only be used when an environment cannot be fetched from the
 * Slice Machine API.
 */
type EnvironmentFallback =
  | Environment
  | (Pick<Environment, "domain" | "name"> & {
      [P in keyof Omit<Environment, "domain" | "name">]:
        | Environment[P]
        | undefined;
    });

/**
 * Sorts a list of environments using the following criteria:
 *
 * - The production environment is always first.
 * - Staging environments are always after production, before development
 *   environments, and sorted alphabetically by name.
 * - The development environment is always last.
 *
 * It assumes the list of environments contains one production environment and
 * at most one dev environment.
 *
 * @param environments - The environments to sort.
 *
 * @returns The sorted environments.
 */
export function sortEnvironments<
  TEnvironment extends Pick<EnvironmentFallback, "kind" | "name">,
>(environments: TEnvironment[]): TEnvironment[] {
  return [...environments].sort((a, b) => {
    switch (a.kind) {
      case "prod": {
        return -1;
      }

      case "stage": {
        switch (b.kind) {
          case "prod": {
            return 1;
          }

          case "stage": {
            return a.name.localeCompare(b.name);
          }

          case "dev":
          default: {
            return -1;
          }
        }
      }

      case "dev": {
        return 1;
      }

      default: {
        if (b.kind === undefined) {
          return a.name.localeCompare(b.name);
        }

        return 1;
      }
    }
  });
}

/**
 * Builds an `Environment` object representing the production environment
 * without using data from the Slice Machine API.
 *
 * This builder should only be used when a list of environments cannot be
 * fetched from the Slice Machine API.
 */
export function buildProductionEnvironmentFallback(
  domain: string,
): Environment {
  return {
    name: "Production",
    domain,
    kind: "prod",
    users: [],
  };
}

type BuildActiveEnvironmentFallbackArgs = {
  activeEnvironmentDomain: string | undefined;
  productionEnvironmentDomain: string;
};

/**
 * Builds a partial `Environment` object representing the active environment
 * without using data from the Slice Machine API.
 *
 * This builder should only be used when a list of environments cannot be
 * fetched from the Slice Machine API.
 */
export function buildActiveEnvironmentFallback(
  args: BuildActiveEnvironmentFallbackArgs,
): EnvironmentFallback {
  if (args.activeEnvironmentDomain !== undefined) {
    return {
      name: args.activeEnvironmentDomain,
      domain: args.activeEnvironmentDomain,
      kind: undefined,
      users: undefined,
    };
  }

  return {
    name: "Production",
    domain: args.productionEnvironmentDomain,
    kind: "prod",
    users: undefined,
  };
}
