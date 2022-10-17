import SliceMachineModal from "@components/SliceMachineModal";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button, Close, Flex, Heading } from "theme-ui";
import Card from "@components/Card";
import { ScreenshotPreview } from "@components/ScreenshotPreview";

type ScreenshotModalProps = {
  sliceName: string;
  screenshotUrl?: string;
};

// For displaying the screenshot preview in the slice simulator after the user has taken a screenshot
const ScreenshotPreviewModal: React.FunctionComponent<ScreenshotModalProps> = ({
  sliceName,
  screenshotUrl,
}) => {
  const { isScreenshotModalOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      isScreenshotModalOpen: isModalOpen(
        store,
        ModalKeysEnum.SCREENSHOT_PREVIEW
      ),
    })
  );

  const { closeScreenshotPreviewModal } = useSliceMachineActions();

  return (
    <SliceMachineModal
      isOpen={isScreenshotModalOpen}
      shouldCloseOnOverlayClick={true}
      contentLabel={"Screenshot Preview"}
      portalClassName={"ScreenshotPreviewModal"}
    >
      <Card
        radius={"0px"}
        bodySx={{
          p: 0,
          bg: "#FFF",
          position: "relative",
          height: "100%",
          padding: 16,
        }}
        footerSx={{
          p: 0,
        }}
        sx={{ border: "none" }}
        Header={() => (
          <Flex
            sx={{
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Heading sx={{ fontSize: "14px" }}>
              Screenshot Preview for {sliceName}
            </Heading>
            <Close
              type="button"
              onClick={() => closeScreenshotPreviewModal()}
            />
          </Flex>
        )}
        Footer={() => (
          <Flex
            style={{
              justifyContent: "flex-end",
              height: 64,
              alignItems: "center",
              paddingRight: 16,
              borderTop: "1px solid #DCDBDD",
            }}
          >
            <Button
              variant={"secondary"}
              sx={{
                fontWeight: 600,
              }}
              onClick={() => closeScreenshotPreviewModal()}
            >
              Close
            </Button>
          </Flex>
        )}
      >
        <ScreenshotPreview src={screenshotUrl} sx={{ height: "320px" }} />
      </Card>
    </SliceMachineModal>
  );
};

export default ScreenshotPreviewModal;
