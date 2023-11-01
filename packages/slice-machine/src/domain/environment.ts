export type Environment = {
  name: string;
  domain: string;
  kind: "prod" | "stage" | "dev";
};

/**
 * Returns an environment selected by name from a list of environments.
 *
 * @param domain - The domain of the environment to select.
 * @param environments - The list of environments from which to select.
 *
 * @throws Will throw if an environment with the given domain is not found.
 * @returns The selected environment.
 */
export function getEnvironment(
  environments: Environment[],
  domain: string,
): Environment {
  const environment = environments.find(
    (environment) => environment.domain === domain,
  );

  if (!environment) {
    throw new Error(`Did not find an environment with domain \`${domain}\`.`);
  }

  return environment;
}

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
export function sortEnvironments(environments: Environment[]): Environment[] {
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

          case "dev": {
            return -1;
          }
        }
      }

      case "dev": {
        return 1;
      }
    }
  });
}
