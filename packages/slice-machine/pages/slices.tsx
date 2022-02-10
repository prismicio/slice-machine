import React, { useContext } from "react";
import { FiLayers } from "react-icons/fi";
import { Box, Flex, Button, Text, Spinner, Link } from "theme-ui";
import Container from "components/Container";

import { LibrariesContext } from "src/models/libraries/context";

import { GoPlus } from "react-icons/go";

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
    onClick={() => onClick()}
    data-cy="create-slice"
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      height: "48px",
      width: "48px",
    }}
  >
    {loading ? <Spinner color="#FFF" /> : <GoPlus size="2em" />}
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
                <FiLayers /> <Text ml={2}>Slice libraries</Text>
              </>
            }
            breadrumbHref="/slices"
          />
          {libraries && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sliceCount == 0 ? (
                <EmptyState
                  title={"Create your first Slice"}
                  explanations={[
                    "Click the + button on the top right to create the first slice of your project.",
                    "It will be stored locally. You will then be able to push it to Prismic.",
                  ]}
                  onCreateNew={openCreateSliceModal}
                  buttonText={"Create my first Slice"}
                  documentationComponent={
                    <>
                      Go to our{" "}
                      <Link
                        target={"_blank"}
                        href={"https://prismic.io/docs/core-concepts/slices"}
                        sx={(theme) => ({ color: theme?.colors?.primary })}
                      >
                        documentation
                      </Link>{" "}
                      to learn more about Slices.
                    </>
                  }
                />
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
                          slice.infos.sliceName
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
            </Box>
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
