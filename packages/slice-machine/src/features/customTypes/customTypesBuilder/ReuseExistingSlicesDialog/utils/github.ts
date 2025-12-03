import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { z } from "zod";

import { SliceFile, SliceImport } from "../types";
import { mapWithConcurrency } from "./mapWithConcurrency";

export const parseGithubUrl = (
  githubUrl: string,
): {
  owner: string;
  repo: string;
} => {
  const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/);
  if (!urlMatch) {
    throw new Error("Invalid GitHub URL format");
  }
  const [, owner, repoRaw] = urlMatch;
  const repo = repoRaw.replace(/\.git$/, "");
  return { owner, repo };
};

export const getDefaultBranch = async ({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) => {
  const rawUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(rawUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.statusText}`);
  }
  const json = z
    .object({ default_branch: z.string() })
    .parse(await response.json());

  return json.default_branch;
};

export const getSliceLibraries = async ({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch: string;
}) => {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/slicemachine.config.json`;
  const response = await fetch(rawUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch slicemachine.config.json: ${response.statusText}`,
    );
  }
  const json = z
    .object({ libraries: z.array(z.string()) })
    .parse(await response.json());

  let libraries = json.libraries;

  if (libraries.length === 0) {
    // Fallback: single Contents API call (defaults to default branch if no ref is provided)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/slicemachine.config.json`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = z
        .object({ content: z.string().optional() })
        .parse(await response.json());
      if (typeof data.content === "string") {
        const decodedContent = atob(data.content.replace(/\s/g, ""));
        const config = z
          .object({ libraries: z.array(z.string()) })
          .parse(JSON.parse(decodedContent));
        libraries = config.libraries;
      }
    } else {
      throw new Error(`Failed to fetch the SM config: ${response.statusText}`);
    }
  }

  return libraries;
};

export const fetchSlicesFromLibraries = async ({
  owner,
  repo,
  branch,
  libraries,
}: {
  owner: string;
  repo: string;
  branch: string;
  libraries: string[];
}) => {
  const fetchedSlices: SliceImport[] = [];

  console.log(
    `Fetching slices from ${libraries.length} library/libraries:`,
    libraries,
  );

  for (const libraryPath of libraries) {
    // Normalize library path (remove leading ./ if present)
    const normalizedPath = libraryPath.replace(/^\.\//, "");

    let sliceDirectories: Array<{
      name: string;
      path: string;
    }> = [];

    // Try GitHub API first
    const libraryApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${normalizedPath}`;
    let apiFailed = false;

    try {
      const libraryResponse = await fetch(libraryApiUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (libraryResponse.ok) {
        const libraryContents = z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              path: z.string(),
            }),
          )
          .parse(await libraryResponse.json());
        sliceDirectories = libraryContents
          .filter((item) => item.type === "dir")
          .map((item) => ({
            name: item.name,
            path: item.path,
          }));
      } else if (libraryResponse.status === 403) {
        apiFailed = true;
        console.warn(
          `GitHub API returned 403 for ${libraryPath}, trying direct discovery...`,
        );
      } else {
        console.warn(
          `Failed to fetch library directory: ${libraryPath}`,
          libraryResponse.statusText,
        );
        continue;
      }
    } catch (error) {
      apiFailed = true;
      console.warn(
        `GitHub API error for ${libraryPath}, trying direct discovery...`,
        error instanceof Error ? error.message : String(error),
      );
    }

    // If API failed, use GitHub Search API to find all model.json files in this library path
    if (apiFailed && sliceDirectories.length === 0) {
      console.log(
        `Attempting to discover slices using GitHub Search API for ${libraryPath}...`,
      );

      try {
        // Use GitHub Search API to find all model.json files in the library path
        // Format: q=path:libraryPath filename:model.json repo:owner/repo
        const searchQuery = `path:${normalizedPath} filename:model.json repo:${owner}/${repo}`;
        const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(
          searchQuery,
        )}`;

        const searchResponse = await fetch(searchUrl, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (searchResponse.ok) {
          const searchData = (await searchResponse.json()) as {
            items?: Array<{
              path: string;
              name: string;
            }>;
            total_count?: number;
          };

          if (searchData.items && searchData.items.length > 0) {
            // Extract slice directory names from the paths
            // Path format: slices/marketing/slice-name/model.json
            const foundSlices = new Set<string>();
            for (const item of searchData.items) {
              // Extract the slice directory name from the path
              // e.g., "slices/marketing/hero/model.json" -> "hero"
              const pathParts = item.path.split("/");
              // The slice name should be the second-to-last part (before "model.json")
              if (pathParts.length >= 2) {
                const sliceName = pathParts[pathParts.length - 2];
                if (sliceName && !foundSlices.has(sliceName)) {
                  foundSlices.add(sliceName);
                }
              }
            }

            // Convert to slice directories format
            sliceDirectories = Array.from(foundSlices).map((sliceName) => ({
              name: sliceName,
              path: `${normalizedPath}/${sliceName}`,
            }));

            console.log(
              `Discovered ${sliceDirectories.length} slice(s) via GitHub Search API for library ${libraryPath}`,
            );
          } else {
            console.warn(
              `GitHub Search API found no model.json files in ${libraryPath}`,
            );
          }
        } else if (searchResponse.status === 403) {
          console.warn(
            `GitHub Search API also returned 403. Cannot discover slices without API access.`,
          );
        } else {
          console.warn(
            `GitHub Search API failed: ${searchResponse.statusText}`,
          );
        }
      } catch (error) {
        console.warn(
          `Error using GitHub Search API for ${libraryPath}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    if (sliceDirectories.length === 0) {
      console.warn(
        `No slices found in library ${libraryPath}. The repository may be private or require authentication.`,
      );
      continue;
    }

    console.log(
      `Processing ${sliceDirectories.length} slice(s) in library ${libraryPath}`,
    );

    // Fetch each slice's model.json, screenshot, and all other files with bounded concurrency
    const perSlice = async (sliceDir: { name: string; path: string }) => {
      try {
        const modelUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sliceDir.path}/model.json`;
        const modelResponse = await fetch(modelUrl);

        if (!modelResponse.ok) {
          console.warn(
            `Failed to fetch model.json for slice: ${sliceDir.name}`,
          );
          return;
        }

        const modelResult = SharedSlice.decode(await modelResponse.json());
        if (modelResult._tag === "Left") {
          console.warn(
            `Failed to decode model.json for slice: ${sliceDir.name}`,
          );
          return;
        }
        const model = modelResult.right;

        // Fetch all files from the slice directory
        // Wrap in try-catch to prevent failures from blocking other slices
        let sliceFiles: SliceFile[] = [];
        try {
          sliceFiles = await fetchAllFilesFromDirectory({
            owner,
            repo,
            branch,
            directoryPath: sliceDir.path,
          });
          console.log(
            `Fetched ${sliceFiles.length} file(s) for slice ${sliceDir.name}:`,
            sliceFiles.map((f) => `${f.path}${f.isBinary ? " (binary)" : ""}`),
          );
        } catch (error) {
          console.warn(
            `Failed to fetch files for slice ${sliceDir.name}:`,
            error instanceof Error ? error.message : String(error),
          );
          // Continue with empty sliceFiles array
        }

        // Extract component contents and mocks
        let componentContents: string | undefined;
        let mocks: SharedSliceContent[] | undefined;

        for (const file of sliceFiles) {
          if (
            componentContents === undefined &&
            file.path.match(/^index\.(tsx?|jsx?|vue|svelte)$/)
          ) {
            if (typeof file.contents === "string") {
              componentContents = file.contents;
            }
          }

          if (file.path === "mocks.json" && typeof file.contents === "string") {
            try {
              const parsedMocksResult = SharedSliceContent.decode(
                JSON.parse(file.contents),
              );
              if (parsedMocksResult._tag === "Left") {
                console.warn(
                  `Failed to decode mocks.json for slice: ${sliceDir.name}`,
                );
              } else {
                const parsedMocks = parsedMocksResult.right;
                if (Array.isArray(parsedMocks) && parsedMocks.length > 0) {
                  mocks = parsedMocks;
                }
              }
            } catch {
              console.warn(
                `Failed to decode mocks.json for slice: ${sliceDir.name}`,
              );
            }
          }
        }

        // Fetch screenshots for all variations (usually few); keep unbounded or lightly bounded
        let thumbnailUrl: string | undefined;
        let screenshotFile: File | undefined;
        const screenshots: Record<string, File> = {};

        if (model.variations !== undefined && model.variations.length > 0) {
          const screenshotResults = await Promise.allSettled(
            model.variations.map(async (variation) => {
              try {
                const screenshotUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sliceDir.path}/screenshot-${variation.id}.png`;
                const screenshotResponse = await fetch(screenshotUrl);

                if (screenshotResponse.ok) {
                  const blob = await screenshotResponse.blob();
                  const file = new File(
                    [blob],
                    `screenshot-${variation.id}.png`,
                    {
                      type: "image/png",
                    },
                  );
                  screenshots[variation.id] = file;

                  if (
                    thumbnailUrl === undefined &&
                    model.variations[0] !== undefined &&
                    variation.id === model.variations[0].id
                  ) {
                    thumbnailUrl = URL.createObjectURL(blob);
                    screenshotFile = file;
                  }
                }
              } catch (error) {
                throw error;
              }
            }),
          );

          screenshotResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.warn(
                `Failed to fetch screenshot for variation ${model.variations[index]?.id}:`,
                result.reason instanceof Error
                  ? result.reason.message
                  : String(result.reason),
              );
            }
          });
        }

        const backupImageFile =
          screenshotFile ??
          new File([], `${model.name}.json`, {
            type: "application/json",
          });

        const sliceData: SliceImport = {
          image: backupImageFile,
          thumbnailUrl: thumbnailUrl ?? URL.createObjectURL(backupImageFile),
          model,
          files: sliceFiles,
          componentContents,
          mocks,
          screenshots:
            Object.keys(screenshots).length > 0 ? screenshots : undefined,
        };
        fetchedSlices.push(sliceData);
      } catch (error) {
        console.warn(
          `Error fetching slice ${sliceDir.name}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    };

    // Process slice directories with a concurrency cap to avoid API throttling
    await mapWithConcurrency(sliceDirectories, 6, perSlice);
  }

  return fetchedSlices;
};

/**
 * Recursively fetches all files from a GitHub directory
 */
const fetchAllFilesFromDirectory = async (args: {
  owner: string;
  repo: string;
  branch: string;
  directoryPath: string;
}): Promise<SliceFile[]> => {
  const { owner, repo, branch, directoryPath } = args;
  const files: SliceFile[] = [];

  // Try GitHub API first
  let apiWorked = false;
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      apiWorked = true;
      const contents = (await response.json()) as Array<{
        name: string;
        type: string;
        path: string;
        content?: string;
        encoding?: string;
      }>;

      const fileItems = contents.filter((i) => i.type === "file");
      const dirItems = contents.filter((i) => i.type === "dir");

      // Process files with bounded concurrency
      const fileResults = await mapWithConcurrency(
        fileItems,
        8,
        async (item) => {
          if (item.name === "model.json") return null;
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
          const fileResponse = await fetch(rawUrl);
          if (!fileResponse.ok) return null;

          const binaryExtensions = [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".ico",
            ".webp",
          ];
          const isBinaryFile = binaryExtensions.some((ext) =>
            item.name.toLowerCase().endsWith(ext),
          );
          let fileContents: string | ArrayBuffer;
          if (isBinaryFile) {
            const arrayBuffer = await fileResponse.arrayBuffer();
            fileContents = arrayBuffer;
          } else {
            fileContents = await fileResponse.text();
          }
          return {
            path: item.name,
            contents: fileContents,
            isBinary: isBinaryFile,
          } as SliceFile;
        },
      );
      for (const r of fileResults) {
        if (r) files.push(r);
      }

      // Recursively process directories sequentially (counts are usually low)
      for (const item of dirItems) {
        const subFiles = await fetchAllFilesFromDirectory({
          owner,
          repo,
          branch,
          directoryPath: item.path,
        });
        for (const subFile of subFiles) {
          files.push({
            ...subFile,
            path: `${item.name}/${subFile.path}`,
          });
        }
      }
    }
  } catch (error) {
    console.warn(
      `GitHub API failed for directory ${directoryPath}, trying HTML parsing...`,
      error instanceof Error ? error.message : String(error),
    );
  }

  // If API failed, use GitHub Search API to find all files recursively
  if (!apiWorked) {
    try {
      console.log(
        `Using GitHub Search API to find all files in ${directoryPath}...`,
      );

      // Use GitHub Search API to find all files in this directory (recursively)
      // Format: path:directoryPath repo:owner/repo
      const searchQuery = `path:${directoryPath} repo:${owner}/${repo}`;
      const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(
        searchQuery,
      )}`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (searchResponse.ok) {
        const searchData = (await searchResponse.json()) as {
          items?: Array<{
            path: string;
            name: string;
          }>;
          total_count?: number;
        };

        if (searchData.items && searchData.items.length > 0) {
          console.log(
            `Found ${searchData.items.length} file(s) via Search API for ${directoryPath}`,
          );

          // Fetch all discovered files
          // Note: Search API returns up to 100 results per page, but we should get all files
          const fetched = await mapWithConcurrency(
            searchData.items,
            8,
            async (item) => {
              try {
                if (item.name === "model.json") return null;
                const relativePath = item.path.startsWith(directoryPath + "/")
                  ? item.path.slice(directoryPath.length + 1)
                  : item.name;
                const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
                const fileResponse = await fetch(rawUrl);
                if (!fileResponse.ok) {
                  console.warn(
                    `Failed to fetch file ${item.path}: ${fileResponse.status} ${fileResponse.statusText}`,
                  );
                  return null;
                }
                const binaryExtensions = [
                  ".png",
                  ".jpg",
                  ".jpeg",
                  ".gif",
                  ".svg",
                  ".ico",
                  ".webp",
                  ".woff",
                  ".woff2",
                  ".ttf",
                  ".eot",
                  ".otf",
                  ".pdf",
                  ".zip",
                  ".gz",
                ];
                const isBinaryFile = binaryExtensions.some((ext) =>
                  item.name.toLowerCase().endsWith(ext),
                );
                let fileContents: string | ArrayBuffer;
                if (isBinaryFile) {
                  fileContents = await fileResponse.arrayBuffer();
                } else {
                  fileContents = await fileResponse.text();
                }
                return {
                  path: relativePath,
                  contents: fileContents,
                  isBinary: isBinaryFile,
                } as SliceFile | null;
              } catch (error) {
                console.warn(
                  `Error fetching file ${item.path}:`,
                  error instanceof Error ? error.message : String(error),
                );
                return null;
              }
            },
          );
          for (const item of fetched) {
            if (item) files.push(item);
          }

          console.log(
            `Fetched ${files.length} file(s) from ${directoryPath} via Search API`,
          );
        } else {
          console.warn(`GitHub Search API found no files in ${directoryPath}`);
        }
      } else if (searchResponse.status === 403) {
        console.warn(
          `GitHub Search API returned 403 for ${directoryPath}. Cannot fetch files without API access.`,
        );
      } else {
        console.warn(
          `GitHub Search API failed for ${directoryPath}: ${searchResponse.statusText}`,
        );
      }
    } catch (error) {
      console.warn(
        `Error using GitHub Search API for ${directoryPath}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return files;
};
