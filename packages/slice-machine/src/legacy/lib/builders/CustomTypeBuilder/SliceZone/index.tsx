import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Switch,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BaseStyles } from "theme-ui";

import { telemetry } from "@/apiClient";
import { ListHeader } from "@/components/List";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { SliceZoneBlankSlate } from "@/features/customTypes/customTypesBuilder/SliceZoneBlankSlate";
import { addSlicesToSliceZone } from "@/features/slices/actions/addSlicesToSliceZone";
import { useSlicesTemplates } from "@/features/slicesTemplates/useSlicesTemplates";
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
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@/modules/slices";
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
  const { query, replace, pathname } = useRouter();
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

  const redirectToEditMode = () => {
    if (query.newPageType === "true") {
      void replace(
        { pathname, query: { pageTypeId: query.pageTypeId } },
        undefined,
        { shallow: true },
      );
    }
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

  return (
    <>
      {query.newPageType === undefined ? (
        <ListHeader
          actions={
            sliceZone ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button color="grey" startIcon="add">
                    Add slices
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
                      shortcut={<Badge color="purple" title="New" />}
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
          Slice Zone
        </ListHeader>
      ) : undefined}
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
          <SliceZoneBlankSlate
            openUpdateSliceZoneModal={openUpdateSliceZoneModal}
            openCreateSliceModal={openCreateSliceModal}
            openSlicesTemplatesModal={openSlicesTemplatesModal}
            projectHasAvailableSlices={availableSlicesToAdd.length > 0}
            isSlicesTemplatesSupported={availableSlicesTemplates.length > 0}
          />
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
            setCustomType(CustomTypes.fromSM(newCustomType));
            closeUpdateSliceZoneModal();
            redirectToEditMode();
            toast.success("Slice(s) added to slice zone");
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
            setCustomType(CustomTypes.fromSM(newCustomType));
            closeSlicesTemplatesModal();
            redirectToEditMode();
            toast.success(
              <ToastMessageWithPath
                message="Slice template(s) added to slice zone and created at: "
                path={`${localLibraries[0].name}/`}
              />,
            );
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
            setCustomType(CustomTypes.fromSM(newCustomType));
            closeCreateSliceModal();
            redirectToEditMode();
            toast.success(
              <ToastMessageWithPath
                message="New slice added to slice zone and created at: "
                path={`${localLibraries[0].name}/`}
              />,
            );
          }}
          localLibraries={localLibraries}
          remoteSlices={remoteSlices}
          onClose={closeCreateSliceModal}
        />
      )}
    </>
  );
};

export default SliceZone;
