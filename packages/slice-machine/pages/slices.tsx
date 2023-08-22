import { Button } from "@prismicio/editor-ui";
import React, { useState } from "react";
import Head from "next/head";
import { BaseStyles, Flex, Text, Link } from "theme-ui";
import { useSelector } from "react-redux";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SharedSlice } from "@lib/models/ui/Slice";
import { VIDEO_WHAT_ARE_SLICES } from "@lib/consts";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { CreateSliceModal } from "@components/Forms/CreateSliceModal";
import Grid from "@components/Grid";
import EmptyState from "@components/EmptyState";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { RenameSliceModal } from "@components/Forms/RenameSliceModal";
import { DeleteSliceModal } from "@components/DeleteSliceModal";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";

const SlicesIndex: React.FunctionComponent = () => {
  const { openRenameSliceModal, openDeleteSliceModal } =
    useSliceMachineActions();

  const { modalPayload, onOpenModal } = useScreenshotChangesModal();

  const { sliceFilterFn, defaultVariationSelector } = modalPayload;

  const { remoteSlices, libraries, frontendSlices } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
      frontendSlices: getFrontendSlices(store),
    })
  );
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);

  const localLibraries: LibraryUI[] = libraries.filter(
    (library) => library.isLocal
  );
  const sortedLibraries: LibraryUI[] = libraries.map((library) => {
    // Sort slices
    library.components = [...library.components].sort((slice1, slice2) => {
      return slice1.model.name.localeCompare(slice2.model.name);
    });
    return library;
  });

  const { modelsStatuses, authStatus, isOnline } = useModelStatus({
    slices: frontendSlices,
  });

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const slices = (libraries || []).map((l) => l.components).flat();
  const sliceCount = slices.length;

  const [sliceForEdit, setSliceForEdit] = useState<ComponentUI>();

  return (
    <>
      <Head>
        <title>Slices - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb folder="Slices" />
          {localLibraries?.length !== 0 && sliceCount !== 0 ? (
            <AppLayoutActions>
              <Button
                data-cy="create-slice"
                onClick={() => {
                  setIsCreateSliceModalOpen(true);
                }}
                startIcon="add"
              >
                Create
              </Button>
            </AppLayoutActions>
          ) : undefined}
        </AppLayoutHeader>
        <AppLayoutContent>
          <BaseStyles sx={{ display: "flex", flexDirection: "column" }}>
            {sortedLibraries.length > 0 ? (
              <Flex
                sx={{
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                {sliceCount === 0 ? (
                  <Flex
                    sx={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <EmptyState
                      title={"What are Slices?"}
                      onCreateNew={() => {
                        setIsCreateSliceModalOpen(true);
                      }}
                      buttonText={"Create one"}
                      videoPublicIdUrl={VIDEO_WHAT_ARE_SLICES}
                      documentationComponent={
                        <>
                          Slices are sections of your website. Prismic documents
                          contain a dynamic "Slice Zone" that allows content
                          creators to add, edit, and rearrange Slices to compose
                          dynamic layouts for any page design.{" "}
                          <Link
                            target={"_blank"}
                            href={
                              "https://prismic.io/docs/core-concepts/slices"
                            }
                            sx={(theme) => ({
                              color: theme?.colors?.primary,
                            })}
                          >
                            Learn more
                          </Link>
                          .
                        </>
                      }
                    />
                  </Flex>
                ) : (
                  sortedLibraries.map((lib) => {
                    const { name, isLocal, components } = lib;
                    return (
                      <Flex
                        key={name}
                        sx={{
                          flexDirection: "column",
                          "&:not(:last-of-type)": {
                            mb: 4,
                          },
                        }}
                      >
                        <Flex
                          sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Flex
                            sx={{
                              alignItems: "center",
                              fontSize: 3,
                              lineHeight: "48px",
                              fontWeight: "heading",
                              mb: 1,
                            }}
                          >
                            <Text>{name}</Text>
                          </Flex>
                          {!isLocal && (
                            <p>⚠️ External libraries are read-only</p>
                          )}
                        </Flex>
                        <Grid
                          elems={components}
                          defineElementKey={(slice: ComponentUI) =>
                            slice.model.name
                          }
                          renderElem={(slice: ComponentUI) => {
                            return SharedSlice.render({
                              slice,
                              StatusOrCustom: {
                                status: modelsStatuses.slices[slice.model.id],
                                authStatus,
                                isOnline,
                              },
                              actions: {
                                onUpdateScreenshot: (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  onOpenModal({
                                    sliceFilterFn: (s: ComponentUI[]) =>
                                      s.filter(
                                        (e) => e.model.id === slice.model.id
                                      ),
                                  });
                                },
                                openRenameModal: (slice: ComponentUI) => {
                                  setSliceForEdit(slice);
                                  openRenameSliceModal();
                                },
                                openDeleteModal: (slice: ComponentUI) => {
                                  setSliceForEdit(slice);
                                  openDeleteSliceModal();
                                },
                              },
                              showActions: true,
                            });
                          }}
                          gridGap="32px 16px"
                        />
                      </Flex>
                    );
                  })
                )}
              </Flex>
            ) : undefined}
          </BaseStyles>
          {localLibraries?.length > 0 && (
            <ScreenshotChangesModal
              slices={sliceFilterFn(slices)}
              defaultVariationSelector={defaultVariationSelector}
            />
          )}
          {localLibraries?.length > 0 && isCreateSliceModalOpen && (
            <CreateSliceModal
              localLibraries={localLibraries}
              remoteSlices={remoteSlices}
              onClose={() => {
                setIsCreateSliceModalOpen(false);
              }}
            />
          )}
          <RenameSliceModal
            sliceId={sliceForEdit?.model.id ?? ""}
            sliceName={sliceForEdit?.model.name ?? ""}
            libName={sliceForEdit?.from ?? ""}
            data-cy="rename-slice-modal"
          />
          <DeleteSliceModal
            sliceId={sliceForEdit?.model.id ?? ""}
            sliceName={sliceForEdit?.model.name ?? ""}
            libName={sliceForEdit?.from ?? ""}
          />
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default SlicesIndex;
