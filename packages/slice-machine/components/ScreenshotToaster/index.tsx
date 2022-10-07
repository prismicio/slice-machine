import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { FC } from "react";
import { Container, Flex, Image, Text } from "theme-ui";

type ScreenshotToasterProps = {
  url: string;
};

const ScreenshotToaster: FC<ScreenshotToasterProps> = ({ url }) => {
  const { openScreenshotPreviewModal } = useSliceMachineActions();

  return (
    <Flex
      sx={{ height: 75, backgroundColor: "rgba(37, 37, 45, 0.9)" }}
      onClick={openScreenshotPreviewModal}
    >
      <Container
        sx={{
          width: 102,
          justifyContent: "center",
          height: "100%",
          display: "flex",
          mr: 16,
          backgroundImage: "url(/pattern.png)",
          backgroundColor: "headSection",
          backgroundRepeat: "repeat",
          backgroundSize: "5px",
          borderRadius: "2px",
        }}
      >
        <Image sx={{ maxHeight: "100%", objectFit: "contain" }} src={url} />
      </Container>
      <Flex
        style={{
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Text sx={{ fontWeight: "Display", fontSize: 16 }}>
          Screenshot taken
        </Text>
        <Text
          variant={"xs"}
          sx={{ fontSize: 14, color: "icons", fontWeight: "label" }}
        >
          Tap to view screenshot
        </Text>
      </Flex>
    </Flex>
  );
};

export default ScreenshotToaster;
