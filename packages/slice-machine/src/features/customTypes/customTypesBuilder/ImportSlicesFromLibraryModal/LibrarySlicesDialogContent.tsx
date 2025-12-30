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
  ErrorBoundary,
  Icon,
  InlineLabel,
  ScrollArea,
  Skeleton,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
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
import { EmptyView } from "./EmptyView";
import { useGitIntegration } from "./hooks/useGitIntegration";
import { useStableDebouncedEffect } from "./hooks/useStableDebouncedEffect";
import { SliceCard } from "./SliceCard";
import {
  CommonDialogContentProps,
  GitIntegration,
  NewSlice,
  RepositorySelection,
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

function LibrarySlicesDialogSuspenseContent(
  props: LibrarySlicesDialogContentProps,
) {
  const {
    location,
    typeName,
    onSelectTab,
    onSuccess,
    selected: isTabSelected,
  } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlices, setSelectedSlices] = useState<SliceImport[]>([]);
  const [selectedRepository, setSelectedRepository] =
    useState<RepositorySelection>();

  const {
    integrations,
    isImportingSlices,
    fetchSlicesFromGithub,
    importedSlices,
    resetImportedSlices,
  } = useGitIntegration();

  const smActions = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const { completeStep: completeOnboardingStep } = useOnboarding();
  const prismicRepositoryInformation = useRepositoryInformation();

  useEffect(() => {
    if (isTabSelected) {
      void telemetry.track({ event: "slice-library:opened" });
    }
  }, [isTabSelected]);

  useStableDebouncedEffect(() => {
    if (selectedRepository) {
      void telemetry.track({
        event: "slice-library:slice-selected",
        slices_count: selectedSlices.length,
        source_project_id: selectedRepository.fullName,
        destination_project_id: prismicRepositoryInformation.repositoryName,
      });
    }
  }, [selectedSlices]);

  const onSelectRepository = (repository: RepositorySelection) => {
    setSelectedRepository(repository);
    setSelectedSlices([]);
    void fetchSlicesFromGithub({ repository });
  };

  const onSelectAll = (checked: boolean) => {
    setSelectedSlices(checked ? importedSlices : []);
  };

  const onSelect = (slice: SliceImport) => {
    setSelectedSlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) return prev.filter((s) => s.model.id !== slice.model.id);
      return [...prev, slice];
    });
  };

  const importSelectedSlices = async () => {
    if (selectedSlices.length === 0) {
      toast.error("Please select at least one slice");
      return;
    }
    if (!selectedRepository) {
      toast.error("Please select a repository");
      return;
    }

    try {
      setIsSubmitting(true);
      void telemetry.track({
        event: "slice-library:import-started",
        source_project_id: selectedRepository.fullName,
      });

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

      const { slices: createdSlices, library } =
        await addSlices(conflictFreeSlices);

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
      resetImportedSlices();

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

      void telemetry.track({
        event: "slice-library:import-completed",
        slices_count: createdSlices.length,
        source_project_id: selectedRepository.fullName,
        destination_project_id: prismicRepositoryInformation.repositoryName,
      });

      onSuccess({ slices: createdSlices, library });
    } catch (error) {
      setIsSubmitting(false);
      toast.error("An unexpected error happened while adding slices.");

      void telemetry.track({
        event: "slice-library:import-failed",
        source_project_id: selectedRepository.fullName,
      });
    }
  };

  const configureUrl = new URL(
    "settings/git-integration",
    prismicRepositoryInformation.repositoryUrl,
  ).toString();

  let renderedContent: ReactNode;

  if (isImportingSlices) {
    renderedContent = <SlicesLoadingSkeleton />;
  } else if (integrations.length === 0) {
    renderedContent = (
      <EmptyView
        title="GitHub connection required"
        description={`Connect your GitHub account to access
repositories and set a library for this project.`}
        icon="github"
        actions={
          <Button size="medium" color="grey" startIcon="github" asChild>
            <a href={configureUrl} target="_blank">
              Connect GitHub
            </a>
          </Button>
        }
      />
    );
  } else if (!selectedRepository) {
    renderedContent = (
      <EmptyView
        title="No repository selected"
        description="Choose a GitHub repository from the menu above."
        icon="alert"
      />
    );
  } else if (importedSlices.length === 0) {
    renderedContent = (
      <EmptyView
        title="No slices found"
        description="This repository doesn't contain any Slice components."
        icon="viewDay"
      />
    );
  } else {
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

    renderedContent = (
      <>
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
              {importedSlices.map((slice) => (
                <SliceCard
                  key={slice.model.id}
                  model={slice.model}
                  thumbnailUrl={slice.thumbnailUrl}
                  selected={selectedSlices.some(
                    (s) => s.model.id === slice.model.id,
                  )}
                  onSelectedChange={() => onSelect(slice)}
                />
              ))}
            </Box>
          </ScrollArea>
        </Box>
        <DialogButtons
          totalSelected={selectedSlices.length}
          onSubmit={() => void importSelectedSlices()}
          isSubmitting={isSubmitting}
          typeName={typeName}
        />
      </>
    );
  }

  return (
    <DialogContent selected={isTabSelected}>
      <DialogTabs
        selectedTab="library"
        onSelectTab={onSelectTab}
        rightContent={
          <RepositorySelector
            integrations={integrations}
            selectedRepository={selectedRepository}
            onSelectRepository={onSelectRepository}
            configureUrl={configureUrl}
            isTabSelected={isTabSelected}
          />
        }
      />
      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {renderedContent}
      </Box>
    </DialogContent>
  );
}

type RepositorySelectorProps = {
  integrations: GitIntegration[];
  selectedRepository: RepositorySelection | undefined;
  onSelectRepository: (repository: RepositorySelection) => void;
  configureUrl: string;
  isTabSelected: boolean;
};

function RepositorySelector(props: RepositorySelectorProps) {
  const {
    integrations,
    selectedRepository,
    onSelectRepository,
    configureUrl,
    isTabSelected,
  } = props;

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const onSelect = (repository: RepositorySelection) => {
    onSelectRepository(repository);
    setOpen(false);
  };

  const repositories = useMemo(() => {
    return integrations.flatMap((integration) =>
      integration.repositories.map((repository) => ({
        ...repository,
        integrationId: integration.id,
      })),
    );
  }, [integrations]);

  useStableDebouncedEffect(() => {
    if (isTabSelected && repositories.length > 0) {
      void telemetry.track({
        event: "slice-library:projects-listed",
        repositories_count: repositories.length,
      });
    }
  }, [isTabSelected, repositories]);

  const filteredRepositories = repositories.filter((repository) =>
    repository.fullName.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger disabled={integrations.length === 0}>
        <Button
          endIcon="arrowDropDown"
          textWeight="normal"
          sx={{ width: 420 }}
          startIcon="github"
          color="grey"
          size="large"
          flexContent
        >
          {selectedRepository
            ? selectedRepository.fullName
            : "Select a GitHub repository"}
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
            {filteredRepositories.length > 0 ? (
              <>
                {/* TODO: (DT-3163) Scroll to the selected repository */}
                {filteredRepositories.map((repository) => (
                  <ComboBoxItem
                    key={repository.fullName}
                    value={repository.fullName}
                    onCheckedChange={() => onSelect(repository)}
                    checked={
                      selectedRepository?.fullName === repository.fullName
                    }
                  >
                    <ComboBoxItemContent>
                      {repository.fullName}
                    </ComboBoxItemContent>
                  </ComboBoxItem>
                ))}
              </>
            ) : (
              <ComboBoxItem value="none" disabled>
                <ComboBoxItemContent disabled>
                  <Box padding={8}>No repositories found</Box>
                </ComboBoxItemContent>
              </ComboBoxItem>
            )}
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
                <a href={configureUrl} target="_blank">
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

function ComboBoxItemContent(props: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { children, disabled } = props;
  return (
    <Box padding={{ inline: 8, block: 4 }}>
      <Text variant="normal" color={disabled === true ? "grey9" : "grey12"}>
        {children}
      </Text>
    </Box>
  );
}

function SlicesLoadingSkeleton() {
  return (
    <>
      <Box
        flexGrow={1}
        minHeight={0}
        flexDirection="column"
        padding={{ inline: 16, top: 16 }}
        gap={16}
      >
        <Skeleton height={24} width={125} />
        <Box
          flexGrow={1}
          display="grid"
          gridTemplateColumns="1fr 1fr 1fr"
          gap={16}
          padding={{ bottom: 16 }}
          overflow="hidden"
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} height={240} width="100%" />
          ))}
        </Box>
      </Box>
      <DialogButtonsSkeleton />
    </>
  );
}

function LibrarySlicesLoggedInContent(props: LibrarySlicesDialogContentProps) {
  const { openLoginModal } = useSliceMachineActions();
  const queryClient = useQueryClient();
  const { data: isLoggedIn } = useSuspenseQuery({
    queryKey: ["checkIsLoggedIn"],
    queryFn: () => managerClient.user.checkIsLoggedIn(),
    gcTime: 0,
    staleTime: 0,
  });

  if (!isLoggedIn) {
    const onLogin = () => {
      props.onClose();
      openLoginModal();
      void queryClient.invalidateQueries({ queryKey: ["checkIsLoggedIn"] });
    };

    return (
      <>
        <DialogTabs selectedTab="library" onSelectTab={props.onSelectTab} />
        <EmptyView
          title="You are logged out"
          description={`This action requires you to be logged in.
Please log in to continue.`}
          icon="logout"
          actions={
            <Button size="small" color="grey" onClick={onLogin}>
              Log in
            </Button>
          }
        />
      </>
    );
  }

  return <LibrarySlicesDialogSuspenseContent {...props} />;
}

export function LibrarySlicesDialogContent(
  props: LibrarySlicesDialogContentProps,
) {
  return (
    <DialogContent selected={props.selected}>
      <ErrorBoundary
        renderError={() => (
          <>
            <DialogTabs selectedTab="library" onSelectTab={props.onSelectTab} />
            <EmptyView
              title="Failed to load library slices"
              icon="alert"
              color="tomato"
            />
          </>
        )}
      >
        <Suspense
          fallback={
            <>
              <DialogTabs
                selectedTab="library"
                onSelectTab={props.onSelectTab}
                rightContent={<Skeleton height={40} width={420} />}
              />
              <SlicesLoadingSkeleton />
            </>
          }
        >
          <LibrarySlicesLoggedInContent {...props} />
        </Suspense>
      </ErrorBoundary>
    </DialogContent>
  );
}
