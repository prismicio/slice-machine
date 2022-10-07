import SliceMachineModal from "@components/SliceMachineModal";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button, Close, Container, Flex, Heading, Image } from "theme-ui";
import Card from "@components/Card";

type ScreenshotModalProps = {
  sliceName: string;
  screenshotUrl: string;
};

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
          paddingRight: 16,
          paddingLeft: 16,
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
        <Container
          sx={{
            height: 320,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundImage: "url(/pattern.png)",
            backgroundColor: "headSection",
            backgroundRepeat: "repeat",
            backgroundSize: "10px",
            display: "flex",
            borderRadius: "4px",
            border: "1px solid #DCDBDD",
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <Image style={{ maxHeight: "100%" }} src={screenshotUrl} />
        </Container>
      </Card>
    </SliceMachineModal>
  );
};

export default ScreenshotPreviewModal;
