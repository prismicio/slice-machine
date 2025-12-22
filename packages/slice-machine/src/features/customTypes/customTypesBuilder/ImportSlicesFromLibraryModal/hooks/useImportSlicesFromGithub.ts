import { useState } from "react";
import { toast } from "react-toastify";

import { SliceImport } from "../types";
import {
  fetchSlicesFromLibraries,
  getDefaultBranch,
  getSliceLibraries,
  parseGithubUrl,
} from "../utils/github";

export function useImportSlicesFromGithub() {
  const [isLoadingSlices, setIsLoadingSlices] = useState(false);
  const [slices, setSlices] = useState<SliceImport[]>([]);

  const resetSlices = () => {
    setSlices([]);
    setIsLoadingSlices(false);
  };

  const handleImportFromGithub = async (githubUrl: string) => {
    try {
      setIsLoadingSlices(true);

      const { owner, repo } = parseGithubUrl(githubUrl);
      if (!owner || !repo) {
        throw new GitHubImportError("Invalid GitHub URL format");
      }

      const branch = await getDefaultBranch({ owner, repo });

      let libraries: string[] | undefined;

      try {
        libraries = await getSliceLibraries({ owner, repo, branch });
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
      });

      if (fetchedSlices.length === 0) {
        throw new GitHubImportError("No slices were found in the libraries.");
      }

      setSlices(fetchedSlices);
      toast.success(
        `Found ${fetchedSlices.length} slice(s) from ${libraries.length} library/libraries`,
      );

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

      return [];
    } finally {
      setIsLoadingSlices(false);
    }
  };

  return {
    isLoadingSlices,
    slices,
    resetSlices,
    handleImportFromGithub,
  };
}

class GitHubImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubImportError";
  }
}
