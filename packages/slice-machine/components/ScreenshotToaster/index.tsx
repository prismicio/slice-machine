import React, { FC } from "react";
import { ToastContentProps } from "react-toastify";
import { Flex, Image, Text } from "theme-ui";

type ScreenshotToasterProps = {
  screenshotUrl: string;
};

const ScreenshotToaster = ({
  data,
}: Partial<ToastContentProps<ScreenshotToasterProps>>) => (
  <Flex sx={{ height: 75, backgroundColor: "rgba(37, 37, 45, 0.9)" }}>
    <Flex
      sx={{
        width: 102,
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Image src={data?.screenshotUrl} style={{ maxHeight: "100%" }} />
    </Flex>
    <Flex
      style={{
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Text variant={"xl"} key={"title"}>
        Screenshot taken
      </Text>
      <Text variant={"xs"} key={"subtitle"}>
        Tap to view screenshot
      </Text>
    </Flex>
  </Flex>
);

export default ScreenshotToaster;
