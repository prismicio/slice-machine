import { Box, Button, ScrollArea, Text, TextInput } from "@prismicio/editor-ui";
import { useEffect, useState } from "react";

import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { useReuseExistingSlicesContext } from "./ReuseExistingSlicesContext";
import { SliceCard } from "./SliceCard";

export function LibrarySlicesTab() {
  const [githubUrl, setGithubUrl] = useState("");
  const { isLoadingSlices, handleImportFromGithub, slices } =
    useImportSlicesFromGithub();
  const { selectedLibrarySlices, toggleLibrarySlice, setAllLibrarySlices } =
    useReuseExistingSlicesContext();

  useEffect(() => {
    if (slices.length === 0) return;

    // Set all slices as selected by default
    setAllLibrarySlices(slices);
  }, [slices, setAllLibrarySlices]);

  if (slices.length === 0) {
    return (
      <Box padding={16} height="100%" flexDirection="column" gap={16}>
        <Box flexDirection="column" gap={8}>
          <Box
            display="flex"
            flexDirection="column"
            gap={8}
            padding={16}
            border
            borderRadius={8}
          >
            <Text color="grey11">Import from GitHub</Text>
            <TextInput
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onValueChange={setGithubUrl}
            />
            <Button
              onClick={() => void handleImportFromGithub(githubUrl)}
              disabled={!githubUrl.trim() || isLoadingSlices}
              loading={isLoadingSlices}
              color="purple"
            >
              {isLoadingSlices ? "Loading slices..." : "Import from GitHub"}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <ScrollArea stableScrollbar={false}>
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr 1fr"
        gap={16}
        padding={16}
      >
        {slices.map((slice) => {
          const isSelected = selectedLibrarySlices.some(
            (s) => s.model.id === slice.model.id,
          );
          return (
            <SliceCard
              model={slice.model}
              thumbnailUrl={slice.thumbnailUrl}
              key={slice.model.id}
              selected={isSelected}
              onSelectedChange={() => {
                toggleLibrarySlice(slice);
              }}
            />
          );
        })}
      </Box>
    </ScrollArea>
  );
}
