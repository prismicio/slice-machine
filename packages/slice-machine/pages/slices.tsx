import React from "react";
import { MdHorizontalSplit } from "react-icons/md";
import { Box, Flex, Text, Link } from "theme-ui";
import Container from "components/Container";

import CreateSliceModal from "components/Forms/CreateSliceModal";

import Header from "components/Header";
import Grid from "components/Grid";

import { SharedSlice } from "lib/models/ui/Slice";
import EmptyState from "components/EmptyState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  getFrontendSlices,
  getLibraries,
  getRemoteSlices,
} from "@src/modules/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { Button } from "@components/Button";
import { GoPlus } from "react-icons/go";
import { VIDEO_WHAT_ARE_SLICES } from "../lib/consts";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";

const SlicesIndex: React.FunctionComponent = () => {
  const { openCreateSliceModal, closeModals, createSlice } =
    useSliceMachineActions();

  const { modalPayload, onOpenModal } = useScreenshotChangesModal();

  const { sliceFilterFn, defaultVariationSelector } = modalPayload;

  const {
    isCreateSliceModalOpen,
    isCreatingSlice,
    remoteSlices,
    libraries,
    frontendSlices,
  } = useSelector((store: SliceMachineStoreType) => ({
    isCreateSliceModalOpen: isModalOpen(store, ModalKeysEnum.CREATE_SLICE),
    isCreatingSlice: isLoading(store, LoadingKeysEnum.CREATE_SLICE),
    remoteSlices: getRemoteSlices(store),
    libraries: getLibraries(store),
    frontendSlices: getFrontendSlices(store),
  }));

  const _onCreate = ({
    sliceName,
    from,
  }: {
    sliceName: string;
    from: string;
  }) => {
    createSlice(sliceName, from);
  };

  const localLibraries: LibraryUI[] = libraries.filter((l) => l.isLocal);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { modelsStatuses, authStatus, isOnline } =
    useModelStatus(frontendSlices);

  const slices = (libraries || []).map((l) => l.components).flat();
  const sliceCount = slices.length;

  return (
    <>
      <Container
        sx={{
          display: "flex",
          flex: 1,
        }}
      >
        <Box
          as={"main"}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header
            ActionButton={
              localLibraries?.length != 0 && sliceCount != 0 ? (
                <Button
                  label="Create a Slice"
                  onClick={openCreateSliceModal}
                  isLoading={isCreatingSlice}
                  disabled={isCreatingSlice}
                  Icon={GoPlus}
                  iconFill="#FFFFFF"
                  data-cy="create-slice"
                />
              ) : undefined
            }
            MainBreadcrumb={
              <>
                <MdHorizontalSplit /> <Text ml={2}>Slices</Text>
              </>
            }
            breadrumbHref="/slices"
          />
          {libraries && (
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
                    onCreateNew={openCreateSliceModal}
                    isLoading={isCreatingSlice}
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
                          href={"https://prismic.io/docs/core-concepts/slices"}
                          sx={(theme) => ({ color: theme?.colors?.primary })}
                        >
                          Learn more
                        </Link>
                        .
                      </>
                    }
                  />
                </Flex>
              ) : (
                libraries.map((lib) => {
                  const { name, isLocal, components } = lib;
                  return (
                    <Flex
                      key={name}
                      sx={{
                        flexDirection: "column",
                        "&:not(last-of-type)": {
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
                        {!isLocal && <p>⚠️ External libraries are read-only</p>}
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
                            onUpdateScreenshot: (e: React.MouseEvent) => {
                              e.preventDefault();
                              onOpenModal({
                                sliceFilterFn: (s: ComponentUI[]) =>
                                  s.filter(
                                    (e) => e.model.id === slice.model.id
                                  ),
                              });
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
          )}
        </Box>
      </Container>
      {localLibraries && localLibraries.length > 0 && (
        <>
          <ScreenshotChangesModal
            slices={sliceFilterFn(slices)}
            defaultVariationSelector={defaultVariationSelector}
          />
          <CreateSliceModal
            isCreatingSlice={isCreatingSlice}
            isOpen={isCreateSliceModalOpen}
            close={closeModals}
            libraries={localLibraries}
            remoteSlices={remoteSlices}
            onSubmit={({ sliceName, from }) => _onCreate({ sliceName, from })}
          />
        </>
      )}
    </>
  );
};

export default SlicesIndex;
