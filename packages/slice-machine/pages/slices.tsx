import React, { useContext } from "react";
import { MdHorizontalSplit } from "react-icons/md";
import { Box, Flex, Button, Text, Spinner, Link } from "theme-ui";
import Container from "components/Container";

import { LibrariesContext } from "src/models/libraries/context";

import CreateSliceModal from "components/Forms/CreateSliceModal";

import Header from "components/Header";
import Grid from "components/Grid";

import LibraryState from "lib/models/ui/LibraryState";
import SliceState from "lib/models/ui/SliceState";
import { SharedSlice } from "lib/models/ui/Slice";
import EmptyState from "components/EmptyState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

const CreateSliceButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button
    onClick={onClick}
    data-cy="create-slice"
    sx={{
      minWidth: "120px",
    }}
  >
    {loading ? <Spinner color="#FFF" size={14} /> : "Create a Slice"}
  </Button>
);

const SlicesIndex: React.FunctionComponent = () => {
  const libraries = useContext(LibrariesContext);
  const { openCreateSliceModal, closeCreateSliceModal, createSlice } =
    useSliceMachineActions();

  const { isCreateSliceModalOpen, isCreatingSlice } = useSelector(
    (store: SliceMachineStoreType) => ({
      isCreateSliceModalOpen: isModalOpen(store, ModalKeysEnum.CREATE_SLICE),
      isCreatingSlice: isLoading(store, LoadingKeysEnum.CREATE_SLICE),
    })
  );

  const _onCreate = ({
    sliceName,
    from,
  }: {
    sliceName: string;
    from: string;
  }) => {
    createSlice(sliceName, from);
  };

  const localLibraries: LibraryState[] | undefined = libraries?.filter(
    (l) => l.isLocal
  );

  const sliceCount = (libraries || []).reduce((count, lib) => {
    if (!lib) {
      return count;
    }

    return count + lib.components.length;
  }, 0);

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
                <CreateSliceButton
                  onClick={openCreateSliceModal}
                  loading={isCreatingSlice}
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
                libraries.map((lib: LibraryState) => {
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
                        elems={components.map(([e]) => e)}
                        defineElementKey={(slice: SliceState) =>
                          slice.model.name
                        }
                        renderElem={(slice: SliceState) => {
                          return SharedSlice.render({
                            displayStatus: true,
                            slice,
                          });
                        }}
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
        <CreateSliceModal
          isCreatingSlice={isCreatingSlice}
          isOpen={isCreateSliceModalOpen}
          close={closeCreateSliceModal}
          libraries={localLibraries}
          onSubmit={({ sliceName, from }) => _onCreate({ sliceName, from })}
        />
      )}
    </>
  );
};

export default SlicesIndex;
