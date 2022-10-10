import { Image, Flex, Spinner } from "theme-ui";

import { ViewRendererProps } from "./";

export default function DefaultView({
  screenshot,
  isLoadingScreenshot,
}: ViewRendererProps) {
  return (
    <>
      {isLoadingScreenshot ? (
        <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
          <Spinner />
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
