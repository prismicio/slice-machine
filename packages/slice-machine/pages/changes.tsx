import React from "react";
import { Box, Button, Flex, Spinner, Text, useThemeUI } from "theme-ui";
import Container from "components/Container";
import Header from "components/Header";
import { MdModeEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { getLibraries, getRemoteSlices } from "../src/modules/slices";
import { SliceMachineStoreType } from "../src/redux/type";
import SliceMachineIconButton from "../components/SliceMachineIconButton";

const PushChangesButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => {
  return (
    <Button
      onClick={onClick}
      data-cy="push-changes"
      sx={{
        minWidth: "120px",
      }}
    >
      {loading ? <Spinner color="#FFF" size={14} /> : "Push Changes"}
    </Button>
  );
};

const changes: React.FunctionComponent = () => {
  useSelector((store: SliceMachineStoreType) => ({
    remoteSlices: getRemoteSlices(store),
    libraries: getLibraries(store),
  }));
  const { theme } = useThemeUI();

  return (
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
            <Flex sx={{ alignItems: "center" }}>
              <>
                <SliceMachineIconButton
                  Icon={MdModeEdit}
                  label="Edit custom type name"
                  data-cy="edit-custom-type"
                  sx={{
                    cursor: "pointer",
                    color: theme.colors?.icons,
                    height: 36,
                    width: 36,
                  }}
                  onClick={() => console.log("edit changes")}
                  style={{
                    color: "#4E4E55",
                    backgroundColor: "#F3F5F7",
                    border: "1px solid #3E3E4826",
                    marginRight: "8px",
                  }}
                />
                <PushChangesButton
                  onClick={() => console.log("push changes")}
                  loading={false}
                />
              </>
            </Flex>
          }
          MainBreadcrumb={<Text ml={2}>Changes</Text>}
          breadrumbHref="/changes"
        />
        <Flex
          sx={{
            alignItems: "center",
            fontSize: 3,
            fontWeight: "heading",
            mt: 40,
            backgroundColor: "#EEEEEE",
            borderRadius: 4,
            padding: "12px 16px",
          }}
        >
          <Text>{"Custom Types X"}</Text>
        </Flex>
        <Flex
          sx={{
            alignItems: "center",
            fontSize: 3,
            fontWeight: "heading",
            mt: 37,
            backgroundColor: "#EEEEEE",
            borderRadius: 4,
            padding: "12px 16px",
          }}
        >
          <Text>{"Slices X"}</Text>
        </Flex>
      </Box>
    </Container>
  );
};

export default changes;
