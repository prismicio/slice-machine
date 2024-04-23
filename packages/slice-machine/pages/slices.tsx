import { Button } from "@prismicio/editor-ui";
import { SharedSlice as SharedSliceType } from "@prismicio/types-internal/lib/customtypes";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BaseStyles, Flex, Link, Text } from "theme-ui";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@/hooks/useScreenshotChangesModal";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";
import { DeleteSliceModal } from "@/legacy/components/DeleteSliceModal";
import EmptyState from "@/legacy/components/EmptyState";
import { CreateSliceModal } from "@/legacy/components/Forms/CreateSliceModal";
import { RenameSliceModal } from "@/legacy/components/Forms/RenameSliceModal";
import Grid from "@/legacy/components/Grid";
import ScreenshotChangesModal from "@/legacy/components/ScreenshotChangesModal";
import { SliceToastMessage } from "@/legacy/components/ToasterContainer";
import { VIDEO_WHAT_ARE_SLICES } from "@/legacy/lib/consts";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { getLibraries, getRemoteSlices } from "@/modules/slices";
import { SliceMachineStoreType } from "@/redux/type";

const SlicesIndex: React.FunctionComponent = () => {
  const router = useRouter();
  const { modalPayload, onOpenModal } = useScreenshotChangesModal();

  const { sliceFilterFn, defaultVariationSelector } = modalPayload;

  const { remoteSlices, libraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
    }),
  );
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const [isDeleteSliceModalOpen, setIsDeleteSliceModalOpen] = useState(false);
  const [isRenameSliceModalOpen, setIsRenameSliceModalOpen] = useState(false);

  const localLibraries: LibraryUI[] = libraries.filter(
    (library) => library.isLocal,
  );
  const sortedLibraries: LibraryUI[] = libraries.map((library) => {
    // Sort slices
    library.components = [...library.components].sort((slice1, slice2) => {
      return slice1.model.name.localeCompare(slice2.model.name);
    });
    return library;
  });

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const slices = (libraries || []).map((l) => l.components).flat();
  const sliceCount = slices.length;

  const [sliceForEdit, setSliceForEdit] = useState<ComponentUI>();

  const openDeleteSliceModal = () => {
    setIsDeleteSliceModalOpen(true);
  };

  const openRenameSliceModal = () => {
    setIsRenameSliceModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Slices - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb>
            <BreadcrumbItem>Slices</BreadcrumbItem>
          </AppLayoutBreadcrumb>
          {localLibraries?.length !== 0 && sliceCount !== 0 ? (
            <AppLayoutActions>
              <Button
                data-testid="create-slice"
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
                      data-testid="slices-table-blank-slate"
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
                          defineElementKey={(slice) => slice.model.name}
                          renderElem={(slice) => (
                            <SharedSliceCard
                              action={{
                                type: "menu",
                                onRemove: () => {
                                  setSliceForEdit(slice);
                                  openDeleteSliceModal();
                                },
                                onRename: () => {
                                  setSliceForEdit(slice);
                                  openRenameSliceModal();
                                },
                              }}
                              mode="navigation"
                              onUpdateScreenshot={() => {
                                onOpenModal({
                                  sliceFilterFn: (s) =>
                                    s.filter(
                                      (e) => e.model.id === slice.model.id,
                                    ),
                                });
                              }}
                              slice={slice}
                              variant="solid"
                            />
                          )}
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
              onSuccess={(newSlice: SharedSliceType, libraryName: string) => {
                // Redirect to the slice page
                const variationId = newSlice.variations[0].id;
                const sliceLocation = SLICES_CONFIG.getBuilderPagePathname({
                  libraryName,
                  sliceName: newSlice.name,
                  variationId,
                });
                void router.push(sliceLocation);
                toast.success(
                  SliceToastMessage({
                    path: `${libraryName}/${newSlice.name}/model.json`,
                  }),
                );
              }}
              onClose={() => {
                setIsCreateSliceModalOpen(false);
              }}
            />
          )}
          <RenameSliceModal
            isOpen={isRenameSliceModalOpen}
            slice={sliceForEdit}
            onClose={() => {
              setIsRenameSliceModalOpen(false);
            }}
            data-testid="rename-slice-modal"
          />
          <DeleteSliceModal
            isOpen={isDeleteSliceModalOpen}
            libName={sliceForEdit?.from ?? ""}
            sliceId={sliceForEdit?.model.id ?? ""}
            sliceName={sliceForEdit?.model.name ?? ""}
            onClose={() => {
              setIsDeleteSliceModalOpen(false);
            }}
          />
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default SlicesIndex;
