import React from "react";
import { Box, Button, Flex, Spinner, Text } from "theme-ui";
import Container from "components/Container";
import Header from "components/Header";
import { MdLoop } from "react-icons/md";
import { useSelector } from "react-redux";
import { getUnSyncedSlices } from "../src/modules/slices";
import { SliceMachineStoreType } from "../src/redux/type";
import { getUnSyncedCustomTypes } from "@src/modules/availableCustomTypes";
import { ChangesItems } from "@components/ChangesItems";
import { ChangesEmptyPage } from "@components/ChangesEmptyPage";

const PushChangesButton = ({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) => {
  return (
    <Button
      onClick={onClick}
      data-cy="push-changes"
      disabled={disabled}
      sx={{ minWidth: "120px" }}
    >
      {loading ? (
        <Spinner color="#FFF" size={14} />
      ) : (
        <Flex sx={{ alignItems: "center" }}>
          <MdLoop size={18} />
          <span>Push Changes</span>
        </Flex>
      )}
    </Button>
  );
};

const changes: React.FunctionComponent = () => {
  const { unSyncedSlices, unSyncedCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      unSyncedSlices: getUnSyncedSlices(store),
      unSyncedCustomTypes: getUnSyncedCustomTypes(store),
    })
  );
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

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
            <PushChangesButton
              onClick={() => console.log("push changes")} //todo: add push changes feeture
              loading={false}
              disabled={numberOfChanges === 0}
            />
          }
          MainBreadcrumb={<Text ml={2}>Changes</Text>}
          breadrumbHref="/changes"
        />
        {numberOfChanges > 0 ? (
          <ChangesItems
            unSyncedSlices={unSyncedSlices}
            unSyncedCustomTypes={unSyncedCustomTypes}
          />
        ) : (
          <ChangesEmptyPage />
        )}
      </Box>
    </Container>
  );
};

export default changes;
