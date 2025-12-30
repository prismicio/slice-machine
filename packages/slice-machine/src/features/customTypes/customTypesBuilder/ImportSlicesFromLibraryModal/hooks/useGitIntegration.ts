import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

import { telemetry } from "@/apiClient";
import { managerClient } from "@/managerClient";

import { RepositorySelection, SliceImport } from "../types";
import {
  fetchSlicesFromLibraries,
  getDefaultBranch,
  getSliceLibraries,
} from "../utils/github";

export function useGitIntegration() {
  const [isImportingSlices, setIsImportingSlices] = useState(false);
  const [importedSlices, setImportedSlices] = useState<SliceImport[]>([]);

  const { data: githubIntegrations } = useSuspenseQuery({
    queryKey: ["getIntegrations"],
    queryFn: () => managerClient.prismicRepository.fetchGitIntegrations(),
  });
  const { mutateAsync: fetchGitHubToken } = useMutation({
    mutationFn: (args: { integrationId: string }) => {
      return managerClient.prismicRepository.fetchGitIntegrationToken({
        integrationId: args.integrationId,
      });
    },
  });

  const resetImportedSlices = () => {
    setImportedSlices([]);
    setIsImportingSlices(false);
  };

  const fetchSlicesFromGithub = async (args: {
    repository: RepositorySelection;
  }) => {
    const { repository } = args;

    try {
      resetImportedSlices();
      setIsImportingSlices(true);

      void telemetry.track({
        event: "slice-library:fetching-started",
        source_project_id: repository.fullName,
      });

      const { token } = await fetchGitHubToken({
        integrationId: repository.integrationId,
      });

      const [owner, repo] = args.repository.fullName.split("/");

      if (!owner || !repo) {
        throw new GitHubImportError("Invalid GitHub URL format");
      }

      const branch = await getDefaultBranch({ owner, repo, token });

      let libraries: string[] | undefined;

      try {
        libraries = await getSliceLibraries({ owner, repo, branch, token });
      } catch (error) {
        throw new GitHubImportError(`
          Failed to fetch slicemachine.config.json: ${
            error instanceof Error ? error.message : "Unknown error"
          }
        `);
      }

      if (libraries.length === 0) {
        throw new GitHubImportError(
          "No libraries were found in the SM config.",
        );
      }

      const fetchedSlices = await fetchSlicesFromLibraries({
        owner,
        repo,
        branch,
        libraries,
        token,
      });

      if (fetchedSlices.length === 0) {
        throw new GitHubImportError("No slices were found in the libraries.");
      }

      setImportedSlices(fetchedSlices);
      toast.success(
        `Found ${fetchedSlices.length} slice(s) from ${libraries.length} library/libraries`,
      );

      void telemetry.track({
        event: "slice-library:fetching-ended",
        slices_count: fetchedSlices.length,
        source_project_id: repository.fullName,
      });

      return fetchedSlices;
    } catch (error) {
      if (error instanceof GitHubImportError) {
        toast.error(error.message);
      } else {
        toast.error(
          `Failed to import from GitHub: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }

      void telemetry.track({
        event: "slice-library:fetching-failed",
        source_project_id: repository.fullName,
      });

      return [];
    } finally {
      setIsImportingSlices(false);
    }
  };

  return {
    integrations: githubIntegrations.integrations ?? [],
    isImportingSlices,
    importedSlices,
    resetImportedSlices,
    fetchSlicesFromGithub,
  };
}

class GitHubImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubImportError";
  }
}
