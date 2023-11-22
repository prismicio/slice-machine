import { Environment } from "./types";

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
