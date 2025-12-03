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

  const handleImportFromGithub = (githubUrl: string) => {
    void (async () => {
      try {
        setIsLoadingSlices(true);

        const { owner, repo } = parseGithubUrl(githubUrl);
        if (!owner || !repo) {
          toast.error("Invalid GitHub URL format");
          setIsLoadingSlices(false);
          return;
        }

        const branch = await getDefaultBranch({ owner, repo });

        let libraries: string[] | undefined;

        try {
          libraries = await getSliceLibraries({ owner, repo, branch });
        } catch (error) {
          console.error("Failed to fetch slicemachine.config.json:", error);
          toast.error(
            `Failed to fetch slicemachine.config.json: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
          setIsLoadingSlices(false);
          return;
        }

        if (libraries.length === 0) {
          console.warn("No libraries were found in the SM config.");
          setIsLoadingSlices(false);
          toast.error("No libraries were found in the SM config.");
          return;
        }

        const fetchedSlices = await fetchSlicesFromLibraries({
          owner,
          repo,
          branch,
          libraries,
        });

        if (fetchedSlices.length === 0) {
          toast.error("Error fetching slices from the repository");
          setIsLoadingSlices(false);
          return;
        }

        setSlices(fetchedSlices);
        setIsLoadingSlices(false);
        toast.success(
          `Found ${fetchedSlices.length} slice(s) from ${libraries.length} library/libraries`,
        );
      } catch (error) {
        console.error("Error importing from GitHub:", error);
        toast.error(
          `Error importing from GitHub: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        setIsLoadingSlices(false);
      }
    })();
  };

  return {
    isLoadingSlices,
    slices,
    resetSlices,
    handleImportFromGithub,
  };
}
