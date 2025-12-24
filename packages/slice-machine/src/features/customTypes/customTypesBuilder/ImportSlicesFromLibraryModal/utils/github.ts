import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { z } from "zod";

import { SliceFile, SliceImport } from "../types";
import { mapWithConcurrency } from "./mapWithConcurrency";

class GitHubRepositoryAPI {
  private readonly owner: string;
  private readonly repo: string;
  private readonly token?: string;
  private readonly baseUrl = "https://api.github.com";

  constructor(args: { owner: string; repo: string; token?: string }) {
    this.owner = args.owner;
    this.repo = args.repo;
    this.token = args.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };
    if (this.token !== undefined) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async getDefaultBranch() {
    const data = await this.request(`/repos/${this.owner}/${this.repo}`);
    return z.object({ default_branch: z.string() }).parse(data).default_branch;
  }

  async getFileContents(
    path: string,
    branch: string,
    isBinary = false,
  ): Promise<string | ArrayBuffer> {
    const data = await this.request(
      `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${branch}`,
    );
    const parsed = z
      .object({ content: z.string(), encoding: z.string() })
      .parse(data);

    if (parsed.encoding !== "base64") {
      throw new Error(`Unexpected encoding for ${path}: ${parsed.encoding}`);
    }

    // Decode base64 content
    const base64Content = parsed.content.replace(/\s/g, "");
    const binaryString = atob(base64Content);

    if (isBinary) {
      // Convert to ArrayBuffer
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } else {
      // Return as string
      return binaryString;
    }
  }

  async getDirectoryContents(path: string) {
    const contents = await this.request(
      `/repos/${this.owner}/${this.repo}/contents/${path}`,
    );
    return z
      .array(z.object({ name: z.string(), type: z.string(), path: z.string() }))
      .parse(contents);
  }

  async searchCode(args: { path?: string; filename?: string }) {
    const { path, filename } = args;

    const query: string[] = [];
    if (path !== undefined) query.push(`path:${path}`);
    if (filename !== undefined) query.push(`filename:${filename}`);
    query.push(`repo:${this.owner}/${this.repo}`);

    const searchUrl = `/search/code?q=${encodeURIComponent(query.join(" "))}`;
    const data = await this.request(searchUrl);

    return z
      .object({
        items: z
          .array(z.object({ path: z.string(), name: z.string() }))
          .optional(),
        total_count: z.number().optional(),
      })
      .parse(data);
  }

  async getSliceLibraries(branch: string) {
    const data = await this.request(
      `/repos/${this.owner}/${this.repo}/contents/slicemachine.config.json?ref=${branch}`,
    );
    const parsed = z
      .object({
        content: z.string().optional(),
        encoding: z.string().optional(),
      })
      .parse(data);

    if (typeof parsed.content === "string") {
      // GitHub API returns base64-encoded content
      const decodedContent = atob(parsed.content.replace(/\s/g, ""));

      return z
        .object({ libraries: z.array(z.string()) })
        .parse(JSON.parse(decodedContent)).libraries;
    } else {
      throw new Error("No content found in slicemachine.config.json");
    }
  }
}

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
}): Promise<string> => {
  const github = new GitHubRepositoryAPI({ owner, repo });
  return github.getDefaultBranch();
};

export const getSliceLibraries = async ({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch: string;
}): Promise<string[]> => {
  const github = new GitHubRepositoryAPI({ owner, repo });
  return github.getSliceLibraries(branch);
};

const mocksSchema = z.array(
  z.unknown().transform((content, ctx) => {
    const result = SharedSliceContent.decode(content);
    if (result._tag === "Left") {
      for (const error of result.left) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
        });
      }

      return z.NEVER;
    }

    return result.right;
  }),
);

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
  const github = new GitHubRepositoryAPI({ owner, repo });
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
    let apiFailed = false;

    try {
      const libraryContents = await github.getDirectoryContents(normalizedPath);
      sliceDirectories = libraryContents
        .filter((item) => item.type === "dir")
        .map((item) => ({
          name: item.name,
          path: item.path,
        }));
    } catch (error) {
      apiFailed = true;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("403")) {
        console.warn(
          `GitHub API returned 403 for ${libraryPath}, trying direct discovery...`,
        );
      } else {
        console.warn(
          `GitHub API error for ${libraryPath}, trying direct discovery...`,
          errorMessage,
        );
      }
    }

    // If API failed, use GitHub Search API to find all model.json files in this library path
    if (apiFailed && sliceDirectories.length === 0) {
      console.log(
        `Attempting to discover slices using GitHub Search API for ${libraryPath}...`,
      );

      try {
        // Use GitHub Search API to find all model.json files in the library path
        const searchData = await github.searchCode({
          path: normalizedPath,
          filename: "model.json",
        });

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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("403")) {
          console.warn(
            `GitHub Search API also returned 403. Cannot discover slices without API access.`,
          );
        } else {
          console.warn(
            `Error using GitHub Search API for ${libraryPath}:`,
            errorMessage,
          );
        }
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
        const modelContent = await github.getFileContents(
          `${sliceDir.path}/model.json`,
          branch,
          false,
        );

        if (typeof modelContent !== "string") {
          console.warn(
            `Failed to fetch model.json for slice: ${sliceDir.name} - unexpected content type`,
          );
          return;
        }

        const modelResult = SharedSlice.decode(JSON.parse(modelContent));
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
            api: github,
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
              const parsedMocksResult = mocksSchema.safeParse(
                JSON.parse(file.contents),
              );
              if (!parsedMocksResult.success) {
                console.warn(
                  `Failed to decode mocks.json for slice: ${sliceDir.name}`,
                );
              } else {
                const parsedMocks = parsedMocksResult.data;
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
                const screenshotPath = `${sliceDir.path}/screenshot-${variation.id}.png`;
                const screenshotContent = await github.getFileContents(
                  screenshotPath,
                  branch,
                  true,
                );

                if (screenshotContent instanceof ArrayBuffer) {
                  const blob = new Blob([screenshotContent], {
                    type: "image/png",
                  });
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
                // Screenshot might not exist for this variation, that's okay
                console.warn(
                  `Failed to fetch screenshot for variation ${variation.id}:`,
                  error instanceof Error ? error.message : String(error),
                );
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
  api: GitHubRepositoryAPI;
  branch: string;
  directoryPath: string;
}): Promise<SliceFile[]> => {
  const { api, branch, directoryPath } = args;
  const files: SliceFile[] = [];

  // Try GitHub API first
  let apiWorked = false;
  try {
    const contents = await api.getDirectoryContents(directoryPath);
    apiWorked = true;

    const fileItems = contents.filter((i) => i.type === "file");
    const dirItems = contents.filter((i) => i.type === "dir");

    // Process files with bounded concurrency
    const fileResults = await mapWithConcurrency(fileItems, 8, async (item) => {
      if (item.name === "model.json") return null;
      try {
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

        const fileContents = await api.getFileContents(
          item.path,
          branch,
          isBinaryFile,
        );

        return {
          path: item.name,
          contents: fileContents,
          isBinary: isBinaryFile,
        } as SliceFile;
      } catch (error) {
        console.warn(
          `Failed to fetch file ${item.path}:`,
          error instanceof Error ? error.message : String(error),
        );
        return null;
      }
    });
    for (const r of fileResults) {
      if (r) files.push(r);
    }

    // Recursively process directories sequentially (counts are usually low)
    for (const item of dirItems) {
      const subFiles = await fetchAllFilesFromDirectory({
        api,
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
  } catch (error) {
    console.warn(
      `GitHub API failed for directory ${directoryPath}, trying Search API...`,
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
      const searchData = await api.searchCode({ path: directoryPath });

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

              const fileContents = await api.getFileContents(
                item.path,
                branch,
                isBinaryFile,
              );

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("403")) {
        console.warn(
          `GitHub Search API returned 403 for ${directoryPath}. Cannot fetch files without API access.`,
        );
      } else {
        console.warn(
          `Error using GitHub Search API for ${directoryPath}:`,
          errorMessage,
        );
      }
    }
  }

  return files;
};
