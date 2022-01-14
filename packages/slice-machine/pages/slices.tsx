import React, { useState, useContext } from "react";
import { FiLayers } from "react-icons/fi";
import { Box, Flex, Button, Text, Spinner, Link } from "theme-ui";
import Container from "components/Container";

import { LibrariesContext } from "src/models/libraries/context";

import { GoPlus } from "react-icons/go";

import CreateSliceModal from "components/Forms/CreateSliceModal";

import { fetchApi } from "lib/builders/common/fetch";

import Header from "components/Header";
import Grid from "components/Grid";

import LibraryState from "lib/models/ui/LibraryState";
import SliceState from "lib/models/ui/SliceState";
import { SharedSlice } from "lib/models/ui/Slice";
import EmptyState from "components/EmptyState";

const CreateSliceButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button
    onClick={() => onClick()}
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
  const [isCreatingSlice, setIsCreatingSlice] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const _onCreate = ({
    sliceName,
    from,
  }: {
    sliceName: string;
    from: string;
  }) => {
    void fetchApi({
      url: `/api/slices/create?sliceName=${sliceName}&from=${from}`,
      setData() {
        setIsCreatingSlice(true);
      },
      successMessage: "Model was correctly saved to Prismic!",
      onSuccess({
        reason,
        variationId,
      }: {
        reason: string | undefined;
        variationId: string;
      }) {
        if (reason) {
          return console.error(reason);
        }
        window.location.href = `/${from.replace(
          /\//g,
          "--"
        )}/${sliceName}/${variationId}`;
      },
    });
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
                  onClick={() => setIsOpen(true)}
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
                  onCreateNew={() => setIsOpen(true)}
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
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          libraries={localLibraries}
          onSubmit={({ sliceName, from }) => _onCreate({ sliceName, from })}
        />
      )}
    </>
  );
};

export default SlicesIndex;
