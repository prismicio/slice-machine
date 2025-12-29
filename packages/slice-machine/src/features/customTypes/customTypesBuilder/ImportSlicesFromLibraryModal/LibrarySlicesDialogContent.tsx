import { useStableEffect } from "@prismicio/editor-support/React";
import {
  Box,
  Button,
  Checkbox,
  ComboBox,
  ComboboxAction,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
  InlineLabel,
  ScrollArea,
  Skeleton,
  Text,
  TextInput,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { Suspense, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { DialogButtons, DialogButtonsSkeleton } from "./DialogButtons";
import { DialogContent } from "./DialogContent";
import { DialogTabs } from "./DialogTabs";
import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { SliceCard } from "./SliceCard";
import {
  CommonDialogContentProps,
  GitHubRepository,
  NewSlice,
  SliceImport,
} from "./types";
import { addSlices } from "./utils/addSlices";
import { sliceWithoutConflicts } from "./utils/sliceWithoutConflicts";

interface LibrarySlicesDialogContentProps extends CommonDialogContentProps {
  onSuccess: (args: {
    slices: { model: SharedSlice; langSmithUrl?: string }[];
    library?: string;
  }) => void;
}

const CARD_SPACING = 16;

function LibrarySlicesDialogSuspenseContent(
  props: LibrarySlicesDialogContentProps,
) {
  const { open, location, typeName, onSelectTab, onSuccess, selected } = props;

  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlices, setSelectedSlices] = useState<SliceImport[]>([]);

  const {
    integrations,
    isLoadingSlices,
    importSlicesFromGithub,
    slices: importedSlices,
    resetSlices,
  } = useImportSlicesFromGithub();

  const repositories = useMemo(() => {
    return integrations.map((integration) => integration.repositories).flat();
  }, [integrations]);

  const smActions = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const { completeStep: completeOnboardingStep } = useOnboarding();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const instanceId = useRef(crypto.randomUUID());

  useStableEffect(() => {
    if (!open) {
      setSelectedSlices([]);
      resetSlices();
      setGithubUrl("");
      instanceId.current = crypto.randomUUID();
    }
  }, [open]);

  const onSelectAll = (checked: boolean) => {
    setSelectedSlices(checked ? importedSlices : []);
  };

  const onImport = () => {
    void importSlicesFromGithub(githubUrl);
  };

  const onSelect = (slice: SliceImport) => {
    setSelectedSlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) return prev.filter((s) => s.model.id !== slice.model.id);
      return [...prev, slice];
    });
  };

  const onSubmit = async () => {
    if (selectedSlices.length === 0) {
      toast.error("Please select at least one slice");
      return;
    }

    // Prepare library slices for import
    const librarySlicesToImport: NewSlice[] = selectedSlices.map((slice) => ({
      image: slice.image,
      model: slice.model,
      files: slice.files,
      componentContents: slice.componentContents,
      mocks: slice.mocks,
      screenshots: slice.screenshots,
    }));

    // Ensure ids and names are conflict-free against existing and newly-added slices
    const conflictFreeSlices: NewSlice[] = [];

    const existingSlices = await managerClient.slices
      .readAllSlices()
      .then((slices) => slices.models.map(({ model }) => model));

    for (const sliceToImport of librarySlicesToImport) {
      const adjustedModel = sliceWithoutConflicts({
        existingSlices: existingSlices,
        newSlices: conflictFreeSlices,
        slice: sliceToImport.model,
      });

      conflictFreeSlices.push({ ...sliceToImport, model: adjustedModel });
    }

    const currentInstanceId = instanceId.current;
    setIsSubmitting(true);

    try {
      const { slices: createdSlices, library } =
        await addSlices(conflictFreeSlices);

      if (currentInstanceId !== instanceId.current) {
        throw new Error("Modal instance changed");
      }

      // Wait a moment to ensure all file writes are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const serverState = await getState();
      smActions.createSliceSuccess(serverState.libraries);

      // Also update mocks individually to ensure they're in the store
      for (const slice of conflictFreeSlices) {
        if (
          slice.mocks &&
          Array.isArray(slice.mocks) &&
          slice.mocks.length > 0
        ) {
          smActions.updateSliceMockSuccess({
            libraryID: library,
            sliceID: slice.model.id,
            mocks: slice.mocks,
          });
        }
      }

      syncChanges();

      setIsSubmitting(false);
      instanceId.current = crypto.randomUUID();
      resetSlices();

      void completeOnboardingStep("createSlice");

      for (const { model } of createdSlices) {
        void telemetry.track({
          event: "slice:created",
          id: model.id,
          name: model.name,
          library,
          location,
          mode: "import",
        });
      }

      onSuccess({ slices: createdSlices, library });
    } catch (error) {
      if (currentInstanceId !== instanceId.current) {
        throw error;
      }
      setIsSubmitting(false);
      toast.error("An unexpected error happened while adding slices.");
      throw error;
    }
  };

  const allSelected = importedSlices.every((slice) =>
    selectedSlices.some((s) => s.model.id === slice.model.id),
  );
  const someSelected = importedSlices.some((slice) =>
    selectedSlices.some((s) => s.model.id === slice.model.id),
  );

  let selectAllLabel = "Select all slices";
  if (allSelected) {
    selectAllLabel = `Selected all slices (${selectedSlices.length})`;
  } else if (someSelected) {
    selectAllLabel = `${selectedSlices.length} of ${importedSlices.length} selected`;
  }

  return (
    <DialogContent selected={selected}>
      <DialogTabs
        selectedTab="library"
        onSelectTab={onSelectTab}
        rightContent={
          <RepositorySelector
            repositories={repositories}
            onValueChange={setGithubUrl}
          />
        }
      />

      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {importedSlices.length > 0 ? (
          <Box flexDirection="column" flexGrow={1} minHeight={0}>
            <Box
              padding={{ block: 12, inline: CARD_SPACING }}
              alignItems="center"
              gap={8}
            >
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
                gap={CARD_SPACING}
                padding={{ inline: CARD_SPACING, bottom: CARD_SPACING }}
              >
                {importedSlices.map((slice) => {
                  const isSelected = selectedSlices.some(
                    (s) => s.model.id === slice.model.id,
                  );
                  return (
                    <SliceCard
                      model={slice.model}
                      thumbnailUrl={slice.thumbnailUrl}
                      key={slice.model.id}
                      selected={isSelected}
                      onSelectedChange={() => onSelect(slice)}
                    />
                  );
                })}
              </Box>
            </ScrollArea>
          </Box>
        ) : (
          <Box
            padding={CARD_SPACING}
            height="100%"
            flexDirection="column"
            gap={CARD_SPACING}
          >
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
        )}
      </Box>

      <DialogButtons
        totalSelected={selectedSlices.length}
        onSubmit={() => void onSubmit()}
        isSubmitting={isSubmitting}
        typeName={typeName}
      />
    </DialogContent>
  );
}

function RepositorySelector(props: {
  repositories: GitHubRepository[];
  onValueChange: (value: string) => void;
}) {
  const { repositories } = props;

  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);

  const { repositoryUrl } = useRepositoryInformation();

  const configureUrl = new URL("settings/git-integration", repositoryUrl);
  const filteredRepositories = repositories.filter((repository) =>
    repository.fullName.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button
          endIcon="arrowDropDown"
          textWeight="normal"
          sx={{ width: 420 }}
          startIcon="label"
          color="grey"
          size="large"
          flexContent
        >
          Select a GitHub repository
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        border={false}
        minWidth="full-trigger-width"
        childrenFocusScope
      >
        <ComboBox variant="attached">
          <ComboBoxInput
            value={filter}
            onValueChange={setFilter}
            placeholder="Search"
            endAdornment
          />
          <ComboBoxContent>
            {filteredRepositories.map((repository) => (
              <ComboBoxItem
                key={repository.fullName}
                value={repository.fullName}
              >
                <Box padding={{ inline: 8, block: 4 }}>
                  <Text variant="normal">{repository.fullName}</Text>
                </Box>
              </ComboBoxItem>
            ))}
            <ComboboxAction>
              <Button
                textWeight="normal"
                size="medium"
                color="dark"
                renderEndIcon={() => <Icon name="openInNew" size="small" />}
                flexContent
                asChild
                invisible
              >
                <a href={configureUrl.toString()}>
                  Configure Repositories on Prismic
                </a>
              </Button>
            </ComboboxAction>
          </ComboBoxContent>
        </ComboBox>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LibrarySlicesDialogContent(
  props: LibrarySlicesDialogContentProps,
) {
  return (
    <DialogContent selected={props.selected}>
      <Suspense
        fallback={
          <>
            <DialogTabs
              selectedTab="library"
              onSelectTab={props.onSelectTab}
              rightContent={<Skeleton height={40} width={420} />}
            />
            <Box
              flexGrow={1}
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              padding={16}
              gap={16}
              minHeight={0}
              overflow="hidden"
            >
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} height={240} width="100%" />
              ))}
            </Box>
            <DialogButtonsSkeleton />
          </>
        }
      >
        <LibrarySlicesDialogSuspenseContent {...props} />
      </Suspense>
    </DialogContent>
  );
}
