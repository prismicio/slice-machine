import { SpyInstance, vi } from "vitest";

import { PrismicRepository } from "@slicemachine/manager";

import { SliceMachineInitProcess } from "../../src/SliceMachineInitProcess";

export const mockPrismicRepositoryManager = (
	initProcess: SliceMachineInitProcess,
	repositoryState?: {
		repositories?: PrismicRepository[];
		existingRepositories?: string[];
	},
): {
	readAll: SpyInstance;
	checkExists: SpyInstance;
	create: SpyInstance;
} => {
	// @ts-expect-error - Accessing protected method
	const manager = initProcess.manager;

	const readAll = vi
		.spyOn(manager.prismicRepository, "readAll")
		.mockImplementation(
			vi.fn(() => {
				if (!repositoryState?.repositories) {
					throw new Error("test: not logged in");
				}

				return Promise.resolve(repositoryState.repositories);
			}),
		);

	const checkExists = vi
		.spyOn(manager.prismicRepository, "checkExists")
		.mockImplementation(
			vi.fn((args: { domain: string }) => {
				if (!repositoryState?.existingRepositories) {
					throw new Error("test: not defined");
				}

				return Promise.resolve(
					repositoryState.existingRepositories.includes(args.domain),
				);
			}),
		);

	const create = vi
		.spyOn(manager.prismicRepository, "create")
		.mockImplementation(vi.fn(() => Promise.resolve()));

	return {
		readAll,
		checkExists,
		create,
	};
};
