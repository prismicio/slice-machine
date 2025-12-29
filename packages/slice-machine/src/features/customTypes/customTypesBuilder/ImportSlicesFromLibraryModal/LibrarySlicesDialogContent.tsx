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
  ErrorBoundary,
  Icon,
  InlineLabel,
  ScrollArea,
  Skeleton,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ReactNode, Suspense, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { EmptyView } from "@/features/customTypes/customTypesBuilder/ImportSlicesFromLibraryModal/EmptyView";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { DialogButtons, DialogButtonsSkeleton } from "./DialogButtons";
import { DialogContent } from "./DialogContent";
import { DialogTabs } from "./DialogTabs";
import { useGitIntegration } from "./hooks/useGitIntegration";
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

const CARD_SPACING = 16;

function LibrarySlicesDialogSuspenseContent(
  props: LibrarySlicesDialogContentProps,
) {
  const { open, location, typeName, onSelectTab, onSuccess, selected } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlices, setSelectedSlices] = useState<SliceImport[]>([]);

  const [selectedRepository, setSelectedRepository] =
    useState<RepositorySelection>();

  const {
    integrations,
    isLoadingSlices,
    importSlicesFromGithub,
    importedSlices,
    resetImportedSlices,
  } = useGitIntegration();

  const smActions = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const { completeStep: completeOnboardingStep } = useOnboarding();
  const { repositoryUrl } = useRepositoryInformation();

  const configureUrl = new URL(
    "settings/git-integration",
    repositoryUrl,
  ).toString();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const instanceId = useRef(crypto.randomUUID());

  useStableEffect(() => {
    if (!open) {
      setSelectedSlices([]);
      resetImportedSlices();
      instanceId.current = crypto.randomUUID();
    }
  }, [open]);

  const onSelectRepository = (repository: RepositorySelection) => {
    setSelectedRepository(repository);
    setSelectedSlices([]);
    void importSlicesFromGithub({ repository });
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
            integrations={integrations}
            selectedRepository={selectedRepository}
            onSelectRepository={onSelectRepository}
            configureUrl={configureUrl}
          />
        }
      />

      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {!isLoadingSlices ? (
          <>
            {integrations.length > 0 ? (
              <>
                {selectedRepository ? (
                  <>
                    {importedSlices.length > 0 ? (
                      <>
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
                              padding={{
                                inline: CARD_SPACING,
                                bottom: CARD_SPACING,
                              }}
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

                        <DialogButtons
                          totalSelected={selectedSlices.length}
                          onSubmit={() => void onSubmit()}
                          isSubmitting={isSubmitting}
                          typeName={typeName}
                        />
                      </>
                    ) : (
                      <EmptyView
                        title="Nothing to import"
                        description="No slices were found in the selected repository."
                        icon="alert"
                      />
                    )}
                  </>
                ) : (
                  <EmptyView
                    title="No repositories selected"
                    description="Choose a GitHub repository from the menu above."
                    icon="alert"
                  />
                )}
              </>
            ) : (
              <EmptyView
                title="GitHub connection required"
                description="Connect your GitHub account to access repositories and set a library for this project."
                icon="alert"
                children={
                  <Button
                    textWeight="normal"
                    size="medium"
                    color="grey"
                    // TODO: Replace with github icon when available
                    startIcon="prismic"
                    asChild
                  >
                    <a href={configureUrl} target="_blank">
                      Connect GitHub
                    </a>
                  </Button>
                }
              />
            )}
          </>
        ) : (
          <SlicesLoadingSkeleton />
        )}
      </Box>
    </DialogContent>
  );
}

type RepositorySelectorProps = {
  integrations: GitIntegration[];
  selectedRepository: RepositorySelection | undefined;
  onSelectRepository: (repository: RepositorySelection) => void;
  configureUrl: string;
};

function RepositorySelector(props: RepositorySelectorProps) {
  const { integrations, selectedRepository, onSelectRepository, configureUrl } =
    props;

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
                {/* TODO: Scroll to the selected repository */}
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
                  No repositories found
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
          description="This action requires you to be logged in. Please log in to continue."
          icon="logout"
        >
          <Button size="small" color="grey" onClick={onLogin}>
            Log in
          </Button>
        </EmptyView>
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
              <DialogButtonsSkeleton />
            </>
          }
        >
          <LibrarySlicesLoggedInContent {...props} />
        </Suspense>
      </ErrorBoundary>
    </DialogContent>
  );
}
