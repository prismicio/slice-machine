import {
  Box,
  Button,
  Checkbox,
  InlineLabel,
  ScrollArea,
  Text,
  TextInput,
} from "@prismicio/editor-ui";
import { useMemo, useState } from "react";

import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { useReuseExistingSlicesContext } from "./ReuseExistingSlicesContext";
import { SliceCard } from "./SliceCard";

export function LibrarySlicesTab() {
  const [githubUrl, setGithubUrl] = useState("");
  const { isLoadingSlices, handleImportFromGithub, slices } =
    useImportSlicesFromGithub();
  const { selectedLibrarySlices, toggleLibrarySlice, setAllLibrarySlices } =
    useReuseExistingSlicesContext();

  const { allSelected, someSelected } = useMemo(() => {
    if (slices.length === 0) return { allSelected: false, someSelected: false };
    return {
      allSelected: slices.every((slice) =>
        selectedLibrarySlices.some((s) => s.model.id === slice.model.id),
      ),
      someSelected: slices.some((slice) =>
        selectedLibrarySlices.some((s) => s.model.id === slice.model.id),
      ),
    };
  }, [slices, selectedLibrarySlices]);

  const onSelectAll = (checked: boolean) => {
    if (checked) {
      setAllLibrarySlices(slices);
    } else {
      setAllLibrarySlices([]);
    }
  };

  const onImport = async () => {
    const fetchedSlices = await handleImportFromGithub(githubUrl);
    setAllLibrarySlices(fetchedSlices);
  };

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
              onClick={() => void onImport()}
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

  let selectAllLabel = "Select all slices";
  if (allSelected) {
    selectAllLabel = `Selected all slices (${selectedLibrarySlices.length})`;
  } else if (someSelected) {
    selectAllLabel = `${selectedLibrarySlices.length} of ${slices.length} selected`;
  }

  return (
    <Box flexDirection="column" flexGrow={1} minHeight={0}>
      <Box padding={{ block: 12, inline: 16 }} alignItems="center" gap={8}>
        <InlineLabel value={selectAllLabel}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={onSelectAll}
          />
        </InlineLabel>
      </Box>
      <ScrollArea stableScrollbar={false}>
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr 1fr"
          gap={16}
          padding={{ inline: 16, bottom: 16 }}
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
    </Box>
  );
}
