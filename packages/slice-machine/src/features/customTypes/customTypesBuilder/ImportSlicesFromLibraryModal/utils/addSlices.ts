import { managerClient } from "@/managerClient";

import { NewSlice, SliceFile } from "../types";
import { mapWithConcurrency } from "./mapWithConcurrency";

export async function addSlices(newSlices: NewSlice[]) {
  // use the first library
  const { libraries = [] } =
    await managerClient.project.getSliceMachineConfig();
  const library = libraries[0];
  if (!library) {
    throw new Error("No library found in the config.");
  }

  // Create slices with bounded concurrency
  await mapWithConcurrency(newSlices, 3, async (slice: NewSlice) => {
    const { errors } = await managerClient.slices.createSlice({
      libraryID: library,
      model: slice.model,
      componentContents: slice.componentContents,
    });
    if (errors.length) {
      throw new Error(`Failed to create slice ${slice.model.id}.`);
    }
  });

  // Update mocks and screenshots, and write additional files
  const slices = await mapWithConcurrency(
    newSlices,
    3,
    async (slice: NewSlice) => {
      const { model, image, langSmithUrl, mocks, files, screenshots } = slice;

      // Update mocks if available
      if (mocks && Array.isArray(mocks) && mocks.length > 0) {
        const { errors: mocksErrors } =
          await managerClient.slices.updateSliceMocks({
            libraryID: library,
            sliceID: model.id,
            mocks,
          });
        if (mocksErrors.length) {
          console.warn(
            `Failed to update mocks for slice ${model.id}:`,
            mocksErrors,
          );
        }
      }

      // Update screenshots for all variations
      if (screenshots && Object.keys(screenshots).length > 0) {
        await Promise.all(
          Object.entries(screenshots).map(
            async ([variationID, screenshotFile]) => {
              if (screenshotFile.size > 0) {
                await managerClient.slices.updateSliceScreenshot({
                  libraryID: library,
                  sliceID: model.id,
                  variationID,
                  data: screenshotFile,
                });
              }
            },
          ),
        );
      } else if (
        image.size > 0 &&
        model.variations !== undefined &&
        model.variations.length > 0
      ) {
        // Fallback to using the first image if no screenshots were provided
        await managerClient.slices.updateSliceScreenshot({
          libraryID: library,
          sliceID: model.id,
          variationID: model.variations[0].id,
          data: image,
        });
      }

      // Write additional files (CSS, other assets, etc.)
      console.log(
        `About to write files for slice ${model.id}:`,
        files
          ? `${files.length} file(s) - ${files
              .map((f: SliceFile) => f.path)
              .join(", ")}`
          : "no files",
      );
      if (files && files.length > 0) {
        await writeSliceFiles({
          libraryID: library,
          sliceID: model.id,
          files,
        });
      } else {
        console.warn(`No files to write for slice ${model.id}. Files:`, files);
      }

      return { model, langSmithUrl };
    },
  );

  return { library, slices };
}

/**
 * Writes additional slice files to the filesystem using the manager's plugin runner
 * Uses the manager client's RPC interface to write files
 */
async function writeSliceFiles(args: {
  libraryID: string;
  sliceID: string;
  files: SliceFile[];
}): Promise<void> {
  const { libraryID, sliceID, files } = args;

  if (files.length === 0) {
    return;
  }

  // Filter out files that are already handled by other methods
  // Note: We still write ALL files, but skip ones that are handled by createSlice/updateSliceMocks/updateSliceScreenshot
  // This includes component files in subdirectories, CSS files, assets, etc.
  const filesToWrite = files.filter(
    (file) =>
      // Skip mocks.json (handled by updateSliceMocks)
      file.path !== "mocks.json" &&
      // Skip screenshots (handled by updateSliceScreenshot)
      !file.path.startsWith("screenshot-") &&
      // Skip the main index component file (handled by createSlice with componentContents)
      // But allow component files in subdirectories (e.g., components/Button.tsx)
      !file.path.match(/^index\.(tsx?|jsx?|vue|svelte)$/),
  );

  console.log(
    `Writing ${filesToWrite.length} additional file(s) for slice ${sliceID}:`,
    filesToWrite.map((f) => f.path),
  );

  if (filesToWrite.length === 0) {
    return;
  }

  try {
    const filesForRPC = filesToWrite.map((file) => {
      if (file.isBinary) {
        return {
          path: file.path,
          contents: file.contents,
          isBinary: true,
        };
      } else if (typeof file.contents === "string") {
        return {
          path: file.path,
          contents: file.contents,
          isBinary: false,
        };
      } else {
        throw new Error(`Unexpected file contents type for ${file.path}`);
      }
    });

    const result = await managerClient.slices.writeSliceFiles({
      libraryID,
      sliceID,
      files: filesForRPC,
    });

    if (result.errors.length > 0) {
      console.error(
        `Errors writing files for slice ${sliceID}:`,
        result.errors.map((e: { message?: string }) => e.message ?? String(e)),
      );
    } else {
      console.log(
        `Successfully wrote ${filesToWrite.length} file(s) for slice ${sliceID}`,
      );
    }
  } catch (error) {
    console.error(
      `Error writing files for slice ${sliceID}:`,
      error instanceof Error ? error.message : String(error),
    );
    // Don't throw - allow slice creation to succeed even if some files fail
  }
}
