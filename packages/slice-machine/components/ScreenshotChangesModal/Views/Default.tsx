import { Image, Text, Flex, Spinner } from "theme-ui";

import { ViewRendererProps } from "./";

export default function DefaultView({
  screenshot,
  isLoadingScreenshot,
}: ViewRendererProps) {
  return (
    <>
      {isLoadingScreenshot ? (
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            bg: "secondary",
            flexDirection: "column",
          }}
        >
          <Spinner />
          <Text sx={{ my: 2 }}>Uploading file ...</Text>
        </Flex>
      ) : (
        <Image
          src={screenshot.url}
          sx={{ width: "auto", height: "auto", maxHeight: "100%" }}
        />
      )}
    </>
  );
}
