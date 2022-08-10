import React from "react";
import { Box, Button, Flex, Spinner, Text, useThemeUI } from "theme-ui";
import Container from "components/Container";
import Header from "components/Header";
import { MdModeEdit, MdLoop } from "react-icons/md";
import { useSelector } from "react-redux";
import Grid from "components/Grid";
import { getUnSyncedSlices } from "../src/modules/slices";
import { SliceMachineStoreType } from "../src/redux/type";
import SliceMachineIconButton from "../components/SliceMachineIconButton";
import { ChangesSectionHeader } from "../components/ChangesSectionHeader";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SharedSlice } from "@lib/models/ui/Slice";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { getUnSyncedCustomTypes } from "@src/modules/availableCustomTypes";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";

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
                  onClick={() => console.log("edit changes")} //todo: add onClick for edit
                  style={{
                    color: "#4E4E55",
                    backgroundColor: "#F3F5F7",
                    border: "1px solid #3E3E4826",
                    marginRight: "8px",
                  }}
                />
                <PushChangesButton
                  onClick={() => console.log("push changes")} //todo: add push changes feeture
                  loading={false}
                />
              </>
            </Flex>
          }
          MainBreadcrumb={<Text ml={2}>Changes</Text>}
          breadrumbHref="/changes"
        />
        <ChangesSectionHeader
          text={"Custom Types"}
          amount={unSyncedCustomTypes.length}
        />
        <CustomTypeTable customTypes={unSyncedCustomTypes} />
        <Box sx={{ mb: "16px" }}>
          <ChangesSectionHeader
            text={"Slices"}
            amount={unSyncedSlices.length}
          />
        </Box>
        <Grid
          elems={unSyncedSlices}
          defineElementKey={(slice: ComponentUI) => slice.model.name}
          gridTemplateMinPx="290px"
          renderElem={(slice: ComponentUI) => {
            return SharedSlice.render({
              displayStatus: true,
              slice: slice,
              thumbnailHeightPx: "177px",
              wrapperType: WrapperType.changesPage,
            });
          }}
          gridGap="24px 48px"
        />
      </Box>
    </Container>
  );
};

export default changes;
