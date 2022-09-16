import { Button, Text, Heading, Flex, Spinner } from "theme-ui";
import React from "react";
import { Video } from "cloudinary-react";
import { useSelector } from "react-redux";
import Tracking from "../../src/tracking/client";
import { SliceMachineStoreType } from "../../src/redux/type";
import { getFramework, getCurrentVersion } from "@src/modules/environment";
interface Props {
  title: string;
  onCreateNew: () => void;
  buttonText: string;
  isLoading: boolean;
  documentationComponent: React.ReactNode;
  videoPublicIdUrl: string;
}

const EmptyState: React.FunctionComponent<Props> = ({
  title,
  onCreateNew,
  buttonText,
  isLoading,
  documentationComponent,
  videoPublicIdUrl,
}) => {
  const { version, framework } = useSelector(
    (store: SliceMachineStoreType) => ({
      version: getCurrentVersion(store),
      framework: getFramework(store),
    })
  );

  return (
    <Flex sx={{ width: "80%", flexWrap: "wrap", justifyContent: "center" }}>
      <Flex
        sx={(theme) => ({
          flex: 1,
          alignItems: "center",
          minWidth: "400px",
          maxWidth: "70%",
          border: `1px solid ${theme.colors?.grey02 as string}`,
        })}
      >
        <Video
          cloudName="dmtf1daqp"
          controls
          loop
          style={{
            maxWidth: "100%",
            objectFit: "contain",
          }}
          publicId={videoPublicIdUrl}
          onPlay={() => {
            void Tracking.get().trackClickOnVideoTutorials(
              framework,
              version,
              videoPublicIdUrl
            );
          }}
        />
      </Flex>

      <Flex
        sx={(theme) => ({
          flexDirection: "column",
          border: `1px solid ${theme.colors?.grey02 as string}`,
          flex: 1,
          minWidth: "400px",
          maxWidth: "70%",
        })}
      >
        <Flex
          sx={(theme) => ({
            flexDirection: "column",
            p: 4,
            borderBottom: `1px solid ${theme.colors?.grey02 as string}`,
          })}
        >
          <Heading
            as="h3"
            variant={"heading"}
            sx={{ fontSize: "16px", lineHeight: "24px", mb: 2 }}
          >
            {title}
          </Heading>
          <Text variant="xs" sx={{ lineHeight: "24px", fontSize: "13px" }}>
            {documentationComponent}
          </Text>
        </Flex>
        <Flex
          sx={{
            p: 4,
            alignItems: "center",
          }}
        >
          <Button
            onClick={onCreateNew}
            data-cy="empty-state-main-button"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
              mr: 4,
            }}
          >
            {isLoading ? <Spinner color="#FFF" size={14} /> : buttonText}
          </Button>
          <Text
            sx={{
              fontSize: "12px",
              color: "grey04",
              maxWidth: "280px",
            }}
          >
            It will be stored locally and you will be able to push it to your
            repository
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default EmptyState;
