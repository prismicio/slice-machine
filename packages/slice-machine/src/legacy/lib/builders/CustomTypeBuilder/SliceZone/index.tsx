import {
  Badge,
  BlankSlate as PBBlankSlate,
  BlankSlateDescription as PBBlankSlateDescription,
  BlankSlateIcon as PBBlankSlateIcon,
  BlankSlateTitle as PBBlankSlateTitle,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileDropZone,
  Icon,
  ProgressCircle,
  Switch,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BaseStyles } from "theme-ui";

import { getState, telemetry } from "@/apiClient";
import {
  BlankSlate,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { ListHeader } from "@/components/List";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { addSlicesToSliceZone } from "@/features/slices/actions/addSlicesToSliceZone";
import { useSlicesTemplates } from "@/features/slicesTemplates/useSlicesTemplates";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { SliceMachinePrinterIcon } from "@/icons/SliceMachinePrinterIcon";
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
  const availableSlicesTemplates = useSlicesTemplates();
  const [isSlicesTemplatesModalOpen, setIsSlicesTemplatesModalOpen] =
    useState(false);
  const [isUpdateSliceZoneModalOpen, setIsUpdateSliceZoneModalOpen] =
    useState(false);
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const { remoteSlices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
      slices: getFrontendSlices(store),
    }),
  );
  const { setCustomType } = useCustomTypeState();
  const { completeStep } = useOnboarding();
  const { createSliceSuccess } = useSliceMachineActions();
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

  const closeSlicesTemplatesModal = () => {
    setIsSlicesTemplatesModalOpen(false);
  };

  const [loading, setLoading] = useState<boolean>(false);

  const onFilesSelected = (files: File[]) => {
    void generateSlices(files);
  };

  async function generateSlices(files: File[]) {
    setLoading(true);

    try {
      const sliceImages = await Promise.all(
        files.map(async (file) => {
          const imageFile = new Uint8Array(await file.arrayBuffer());
          return imageFile;
        }),
      );
      const response = await managerClient.slices.generateSlicesFromUrl({
        sliceImages,
        sliceMachineUIOrigin: window.location.origin,
      });

      // TODO(DT-1453): Remove the need of the global getState
      const serverState = await getState();
      // Update Redux store
      createSliceSuccess(serverState.libraries);
      syncChanges();

      const newCustomType = addSlicesToSliceZone({
        customType,
        tabId,
        slices: response.slices,
      });

      setCustomType(CustomTypes.fromSM(newCustomType), () => {
        toast.success("Slices generated successfully");
      });
    } catch (error) {
      toast.error("Slices generation failed");
      console.error("Slices generation failed", error);
    }

    setLoading(false);
  }

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
                <DropdownMenuItem
                  startIcon={<Icon name="add" size="large" />}
                  onSelect={openCreateSliceModal}
                  description="Start from scratch."
                >
                  Create new
                </DropdownMenuItem>

                {availableSlicesTemplates.length > 0 ? (
                  <DropdownMenuItem
                    onSelect={openSlicesTemplatesModal}
                    startIcon={<Icon name="contentCopy" size="large" />}
                    description="Select from premade examples."
                    endAdornment={
                      <Text color="inherit" component="kbd">
                        <Badge color="purple" title="New" />
                      </Text>
                    }
                  >
                    Use template
                  </DropdownMenuItem>
                ) : undefined}

                {availableSlicesToAdd.length > 0 ? (
                  <DropdownMenuItem
                    onSelect={openUpdateSliceZoneModal}
                    startIcon={<Icon name="folder" size="large" />}
                    description="Select from your own slices."
                  >
                    Select existing
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
            flexGrow={1}
            justifyContent="center"
            data-testid="slice-zone-blank-slate"
          >
            <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
              <BlankSlateContent>
                <Box justifyContent="center" padding={{ bottom: 16 }}>
                  <SliceMachinePrinterIcon />
                </Box>
                <BlankSlateTitle>Add slices</BlankSlateTitle>
                <BlankSlateDescription>
                  Slices are website sections that you can reuse on different
                  pages with different content. Each slice has its own component
                  in your code.
                </BlankSlateDescription>
                <Box width="100%" gap={12} flexGrow={1} padding={{ top: 16 }}>
                  <FileDropZone
                    assetType="image"
                    onFilesSelected={onFilesSelected}
                    overlay={<Overlay />}
                  >
                    <Box
                      height={200}
                      backgroundColor="grey3"
                      justifyContent="center"
                      alignItems="center"
                      border={true}
                      borderStyle="dashed"
                      borderRadius={8}
                    >
                      {loading ? (
                        <Box gap={12} alignItems="center">
                          <ProgressCircle />
                          <Text variant="h4">
                            We are generating your new slices...
                          </Text>
                        </Box>
                      ) : (
                        <Text variant="h4">
                          Drop the slices screenshots you want to add here
                        </Text>
                      )}
                    </Box>
                  </FileDropZone>
                </Box>
              </BlankSlateContent>
            </BlankSlate>
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
          remoteSlices={remoteSlices}
          onClose={closeCreateSliceModal}
        />
      )}
    </>
  );
};

function Overlay() {
  return (
    <Box justifyContent="center" flexDirection="column" height="100%">
      <PBBlankSlate>
        <PBBlankSlateIcon
          name="cloudUpload"
          lineColor="purple1"
          backgroundColor="purple12"
        />
        <PBBlankSlateTitle size="big">Drop a slice here</PBBlankSlateTitle>
        <PBBlankSlateDescription>
          Drop slice screenshots to generate their model, mocks and code.
        </PBBlankSlateDescription>
      </PBBlankSlate>
    </Box>
  );
}

export default SliceZone;
