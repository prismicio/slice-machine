import React from "react";
import SliceMachineModal from "../SliceMachineModal";
import {
  Card,
  Close,
  Flex,
  Heading,
  Text,
  Paragraph,
  IconButton,
} from "theme-ui";
import { MdOutlineCopyAll } from "react-icons/md";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { getUpdateVersionInfo } from "@src/modules/environment";

const UpdateVersionModal: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { updateVersionInfo } = useSelector((store: SliceMachineStoreType) => ({
    updateVersionInfo: getUpdateVersionInfo(store),
    isOpen: isModalOpen(store, ModalKeysEnum.UPDATE_VERSION),
  }));

  const isOpen = false;

  const { closeUpdateVersionModal, openUpdateVersionModal } =
    useSliceMachineActions();

  React.useEffect(() => {
    if (!updateVersionInfo) return;
    if (updateVersionInfo.updateAvailable) openUpdateVersionModal();
  }, [updateVersionInfo?.updateAvailable]);

  const copy = () => {
    ref.current?.textContent &&
      navigator.clipboard.writeText(ref.current.textContent);
  };

  // if the data is not loaded
  if (!updateVersionInfo) return null;

  return (
    <SliceMachineModal
      appElement={document.body}
      isOpen={isOpen}
      style={{
        content: {
          position: "static",
          display: "flex",
          margin: "auto",
          minHeight: "initial",
          textAlign: "center",
        },
        overlay: {
          display: "flex",
        },
      }}
    >
      <Card
        sx={{
          maxWidth: "380px",
          padding: "20px",
          bg: "headSection",
        }}
      >
        <Flex
          sx={{
            marginBottom: "20px",
            paddingBottom: "20px",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "8px 8px 0px 0px",
            borderBottom: (t) => `1px solid ${t.colors?.borders}`,
          }}
        >
          <Heading sx={{ fontSize: "16px" }}>
            {" "}
            SliceMachine {updateVersionInfo.latestVersion} available
          </Heading>
          <Close
            tabIndex={0}
            sx={{ p: 0, alignSelf: "start" }}
            type="button"
            onClick={closeUpdateVersionModal}
            data-testid="update-modal-close"
          />
        </Flex>
        <Paragraph
          sx={{ fontSize: "14px", color: "#4E4E55", marginBottom: "20px" }}
        >
          To update to new version of Slice Machine, open a terminal, run the
          following command and restart Slice Machine:
        </Paragraph>
        <Flex
          sx={{
            border: "1px solid rgba(62, 62, 72, 0.15)",
            borderRadius: "4px",
            padding: "4px",
            justifyContent: "space-between",
          }}
        >
          <Text ref={ref} as="code" sx={{ margin: "4px", textAlign: "center" }}>
            {updateVersionInfo.updateCommand}
          </Text>
          <IconButton title="Click to copy" tabIndex={0} onClick={copy}>
            <MdOutlineCopyAll />
          </IconButton>
        </Flex>
      </Card>
    </SliceMachineModal>
  );
};

export default UpdateVersionModal;
