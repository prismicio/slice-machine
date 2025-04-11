import {
  BackgroundIcon,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Switch,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BaseStyles } from "theme-ui";

import { getState, telemetry } from "@/apiClient";
import { ListHeader } from "@/components/List";
import { addAiFeedback } from "@/features/aiFeedback";
import { useAiSliceGenerationExperiment } from "@/features/builder/useAiSliceGenerationExperiment";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { GenerateSliceWithAiModal } from "@/features/customTypes/customTypesBuilder/GenerateSliceWithAiModal";
import { SliceZoneBlankSlate } from "@/features/customTypes/customTypesBuilder/SliceZoneBlankSlate";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { addSlicesToSliceZone } from "@/features/slices/actions/addSlicesToSliceZone";
import { useSlicesTemplates } from "@/features/slicesTemplates/useSlicesTemplates";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { CreateSliceModal } from "@/legacy/components/Forms/CreateSliceModal";
import { ToastMessageWithPath } from "@/legacy/components/ToasterContainer";
import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import {
  CustomTypes,
  CustomTypeSM,
} from "@/legacy/lib/models/common/CustomType";
import type { SliceZoneSlice } from "@/legacy/lib/models/common/CustomType/sliceZone";
import type { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import type { SlicesSM } from "@/legacy/lib/models/common/Slices";
import { managerClient } from "@/managerClient";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@/modules/slices";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import type { SliceMachineStoreType } from "@/redux/type";

import { DeleteSliceZoneModal } from "./DeleteSliceZoneModal";
import { SlicesList } from "./List";
import { SlicesTemplatesModal } from "./SlicesTemplatesModal";
import UpdateSliceZoneModal from "./UpdateSliceZoneModal";

const mapAvailableAndSharedSlices = (
  sliceZone: SlicesSM,
  libraries: ReadonlyArray<LibraryUI> | null,
) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const availableSlices = (libraries || []).reduce<ReadonlyArray<ComponentUI>>(
    (acc, curr: LibraryUI) => {
      return [...acc, ...curr.components];
    },
    [],
  );
  const { slicesInSliceZone, notFound } = sliceZone.value.reduce<{
    slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
    notFound: ReadonlyArray<{ key: string }>;
  }>(
    (acc, { key, value }) => {
      // Shared Slice
      if (value.type === "SharedSlice") {
        const maybeSliceState: ComponentUI | undefined = availableSlices.find(
          (slice) => slice.model.id === key,
        );

        if (maybeSliceState) {
          return {
            ...acc,
            slicesInSliceZone: [
              ...acc.slicesInSliceZone,
              { type: "SharedSlice", payload: maybeSliceState },
            ],
          };
        }

        return { ...acc, notFound: [...acc.notFound, { key }] };
      }

      // Composite and legacy Slice
      return {
        ...acc,
        slicesInSliceZone: [
          ...acc.slicesInSliceZone,
          { type: "Slice", payload: { key, value } },
        ],
      };
    },
    { slicesInSliceZone: [], notFound: [] },
  );

  return { availableSlices, slicesInSliceZone, notFound };
};

interface SliceZoneProps {
  customType: CustomTypeSM;
  onCreateSliceZone: () => void;
  onDeleteSliceZone: () => void;
  onRemoveSharedSlice: (sliceId: string) => void;
  sliceZone?: SlicesSM | null | undefined;
  tabId: string;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  customType,
  onCreateSliceZone,
  onDeleteSliceZone,
  onRemoveSharedSlice,
  sliceZone,
  tabId,
}) => {
  const aiSliceGenerationExperiment = useAiSliceGenerationExperiment();
  const availableSlicesTemplates = useSlicesTemplates();
  const [isSlicesTemplatesModalOpen, setIsSlicesTemplatesModalOpen] =
    useState(false);
  const [isUpdateSliceZoneModalOpen, setIsUpdateSliceZoneModalOpen] =
    useState(false);
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const [isGenerateSliceWithAiModalOpen, setIsGenerateSliceWithAiModalOpen] =
    useState(false);
  const { remoteSlices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
      slices: getFrontendSlices(store),
    }),
  );
  const { setCustomType } = useCustomTypeState();
  const { completeStep } = useOnboarding();
  const { createSliceSuccess, openLoginModal } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();

  const localLibraries: readonly LibraryUI[] = libraries.filter(
    (library) => library.isLocal,
  );
  const { availableSlices, slicesInSliceZone, notFound } = useMemo(
    () =>
      sliceZone
        ? mapAvailableAndSharedSlices(sliceZone, libraries)
        : { availableSlices: [], slicesInSliceZone: [], notFound: [] },
    [sliceZone, libraries],
  );
  const [isDeleteSliceZoneModalOpen, setIsDeleteSliceZoneModalOpen] =
    useState(false);

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notFound]);

  const sharedSlicesInSliceZone = slicesInSliceZone
    .filter((e) => e.type === "SharedSlice")
    .map((e) => e.payload) as ReadonlyArray<ComponentUI>;

  /* Preserve these keys in SliceZone */
  const availableSlicesToAdd = availableSlices.filter(
    (slice) =>
      !sharedSlicesInSliceZone.some(
        (sharedSlice) => sharedSlice.model.id === slice.model.id,
      ),
  );

  const openUpdateSliceZoneModal = () => {
    setIsUpdateSliceZoneModalOpen(true);
  };

  const openCreateSliceModal = () => {
    setIsCreateSliceModalOpen(true);
  };

  const openGenerateSliceWithAiModal = async () => {
    const isLoggedIn = await managerClient.user.checkIsLoggedIn();

    if (isLoggedIn) {
      setIsGenerateSliceWithAiModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  const openSlicesTemplatesModal = () => {
    setIsSlicesTemplatesModalOpen(true);

    void telemetry.track({
      event: "custom-type:open-add-from-templates",
      customTypeId: customType.id,
      customTypeFormat: customType.format,
    });
  };

  const closeUpdateSliceZoneModal = () => {
    setIsUpdateSliceZoneModalOpen(false);
  };

  const closeCreateSliceModal = () => {
    setIsCreateSliceModalOpen(false);
  };

  const closeGenerateSliceWithAiModal = () => {
    setIsGenerateSliceWithAiModalOpen(false);
  };

  const closeSlicesTemplatesModal = () => {
    setIsSlicesTemplatesModalOpen(false);
  };

  return (
    <>
      <ListHeader
        actions={
          sliceZone ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  color="purple"
                  startIcon="add"
                  data-testid="add-new-slice-dropdown"
                >
                  Add
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {aiSliceGenerationExperiment.eligible && (
                  <DropdownMenuItem
                    renderStartIcon={() => (
                      <BackgroundIcon
                        name="autoFixHigh"
                        size="extraSmall"
                        iconSize="small"
                        radius={6}
                        variant="solid"
                        color="purple"
                      />
                    )}
                    onSelect={() => void openGenerateSliceWithAiModal()}
                    description="Build a Slice based on your design image."
                  >
                    Generate from image
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  renderStartIcon={() => (
                    <BackgroundIcon
                      name="add"
                      size="extraSmall"
                      iconSize="small"
                      radius={6}
                      variant="solid"
                      color="white"
                    />
                  )}
                  onSelect={openCreateSliceModal}
                  description="Build a custom Slice your way."
                >
                  Start from scratch
                </DropdownMenuItem>

                {availableSlicesTemplates.length > 0 ? (
                  <DropdownMenuItem
                    onSelect={openSlicesTemplatesModal}
                    renderStartIcon={() => (
                      <BackgroundIcon
                        name="contentCopy"
                        size="extraSmall"
                        iconSize="small"
                        radius={6}
                        variant="solid"
                        color="white"
                      />
                    )}
                    description="Select from your created Slices."
                  >
                    Use a template
                  </DropdownMenuItem>
                ) : undefined}

                {availableSlicesToAdd.length > 0 ? (
                  <DropdownMenuItem
                    onSelect={openUpdateSliceZoneModal}
                    renderStartIcon={() => (
                      <BackgroundIcon
                        name="folder"
                        size="extraSmall"
                        iconSize="small"
                        radius={6}
                        variant="solid"
                        color="white"
                      />
                    )}
                    description="Select from your created Slices."
                  >
                    Reuse an existing Slice
                  </DropdownMenuItem>
                ) : undefined}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
        toggle={
          customType.format !== "page" || tabId !== "Main" ? (
            <Switch
              checked={!!sliceZone}
              onCheckedChange={(checked) => {
                if (checked) {
                  onCreateSliceZone();
                } else {
                  setIsDeleteSliceZoneModalOpen(true);
                }
              }}
              size="small"
              data-testid="slice-zone-switch"
            />
          ) : undefined
        }
      >
        Slices
      </ListHeader>

      {sliceZone ? (
        slicesInSliceZone.length > 0 ? (
          <BaseStyles>
            <SlicesList
              slices={slicesInSliceZone}
              format={customType.format}
              path={{
                customTypeID: customType.id,
                tabID: tabId,
                sliceZoneID: sliceZone?.key ?? "",
              }}
              onRemoveSharedSlice={onRemoveSharedSlice}
            />
          </BaseStyles>
        ) : (
          <Box
            flexDirection="column"
            flexGrow={1}
            justifyContent="center"
            alignItems="center"
            padding={{ block: 32 }}
          >
            <SliceZoneBlankSlate
              openUpdateSliceZoneModal={openUpdateSliceZoneModal}
              openCreateSliceModal={openCreateSliceModal}
              openGenerateSliceWithAiModal={() =>
                void openGenerateSliceWithAiModal()
              }
              openSlicesTemplatesModal={openSlicesTemplatesModal}
              projectHasAvailableSlices={availableSlicesToAdd.length > 0}
              isSlicesTemplatesSupported={availableSlicesTemplates.length > 0}
            />
          </Box>
        )
      ) : undefined}
      {isUpdateSliceZoneModalOpen && (
        <UpdateSliceZoneModal
          formId={`tab-slicezone-form-${tabId}`}
          availableSlices={availableSlicesToAdd}
          onSubmit={(slices: SharedSlice[]) => {
            const newCustomType = addSlicesToSliceZone({
              customType,
              tabId,
              slices,
            });
            setCustomType(CustomTypes.fromSM(newCustomType), () => {
              toast.success("Slice(s) added to slice zone");
            });
            void completeStep("createSlice");
            closeUpdateSliceZoneModal();
          }}
          close={closeUpdateSliceZoneModal}
        />
      )}
      {isSlicesTemplatesModalOpen && (
        <SlicesTemplatesModal
          formId={`tab-slicezone-form-${tabId}`}
          availableSlicesTemplates={availableSlicesTemplates}
          localLibraries={localLibraries}
          location={`${customType.format}_type`}
          onSuccess={(slices: SharedSlice[]) => {
            const newCustomType = addSlicesToSliceZone({
              customType,
              tabId,
              slices,
            });
            setCustomType(CustomTypes.fromSM(newCustomType), () => {
              toast.success(
                <ToastMessageWithPath
                  message="Slice template(s) added to slice zone and created at: "
                  path={`${localLibraries[0].name}/`}
                />,
              );
            });
            void completeStep("createSlice");
            closeSlicesTemplatesModal();
          }}
          close={closeSlicesTemplatesModal}
        />
      )}
      {isDeleteSliceZoneModalOpen && (
        <DeleteSliceZoneModal
          closeDeleteSliceZoneModal={() => {
            setIsDeleteSliceZoneModalOpen(false);
          }}
          deleteSliceZone={() => {
            onDeleteSliceZone();
            setIsDeleteSliceZoneModalOpen(false);
          }}
        />
      )}
      {localLibraries?.length !== 0 && isCreateSliceModalOpen && (
        <CreateSliceModal
          onSuccess={(newSlice: SharedSlice) => {
            const newCustomType = addSlicesToSliceZone({
              customType,
              tabId,
              slices: [newSlice],
            });
            setCustomType(CustomTypes.fromSM(newCustomType), () => {
              toast.success(
                <ToastMessageWithPath
                  message="New slice added to slice zone and created at: "
                  path={`${localLibraries[0].name}/`}
                />,
              );
            });
            closeCreateSliceModal();
          }}
          localLibraries={localLibraries}
          location={`${customType.format}_type`}
          remoteSlices={remoteSlices}
          onClose={closeCreateSliceModal}
        />
      )}
      <GenerateSliceWithAiModal
        open={isGenerateSliceWithAiModalOpen}
        onSuccess={async ({ slices, library }) => {
          const serverState = await getState();
          createSliceSuccess(serverState.libraries);

          const newCustomType = addSlicesToSliceZone({
            customType,
            tabId,
            slices: slices.map((slice) => slice.model),
          });
          setCustomType(CustomTypes.fromSM(newCustomType), () => {
            toast.success(
              <ToastMessageWithPath
                message="Slice(s) added to slice zone and created at: "
                path={library}
              />,
            );
          });
          void completeStep("createSlice");
          syncChanges();

          for (const { model, langSmithUrl } of slices) {
            void telemetry.track({
              event: "slice:created",
              id: model.id,
              name: model.name,
              library,
              location: `${customType.format}_type`,
              mode: "ai",
              langSmithUrl,
            });

            addAiFeedback({
              type: "model",
              library,
              sliceId: model.id,
              variationId: model.variations[0].id,
              langSmithUrl,
            });
          }

          closeGenerateSliceWithAiModal();
        }}
        onClose={closeGenerateSliceWithAiModal}
      />
    </>
  );
};

export default SliceZone;
