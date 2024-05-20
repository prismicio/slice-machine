import { Tag, Video } from "@prismicio/editor-ui";
import { Close, Flex, Heading, Paragraph } from "theme-ui";

import { telemetry } from "@/apiClient";
import { MasterSliceLibraryIcon } from "@/icons/MasterSliceLibraryIcon";
import { Button } from "@/legacy/components/Button";
import Card from "@/legacy/components/Card";
import SliceMachineModal from "@/legacy/components/SliceMachineModal";

type SliceLibraryPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SliceLibraryPreviewModal: React.FunctionComponent<
  SliceLibraryPreviewModalProps
> = ({ isOpen, onClose }) => {
  const Header = () => (
    <Flex
      sx={{
        position: "sticky",
        background: "gray",
        top: 0,
        zIndex: 1,
        p: "16px",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
      }}
    >
      <Flex sx={{ alignItems: "center" }}>
        <MasterSliceLibraryIcon />
        <Heading sx={{ fontSize: ".75rem", fontWeight: "bold", ml: 1, mr: 2 }}>
          Master Slice Library generator
        </Heading>
        <Tag title="BETA" />
      </Flex>
      <Close type="button" onClick={onClose} />
    </Flex>
  );

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
        },
      }}
      onRequestClose={onClose}
    >
      <Card
        bodySx={{
          p: 0,
          bg: "white",
          position: "relative",
          height: "100%",
          padding: 16,
        }}
        footerSx={{
          position: "sticky",
          bottom: 0,
          p: 0,
        }}
        sx={{ border: "none" }}
        borderFooter
        Header={Header}
        Footer={() => (
          <Flex
            sx={{
              justifyContent: "center",
              height: 64,
              alignItems: "center",
              paddingX: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "gray",
            }}
          >
            <Button
              label="Get the code"
              variant="primary"
              sx={{ minHeight: 39, minWidth: 78, flexGrow: 1 }}
              onClick={() => {
                void telemetry.track({
                  event: "slice-library:beta:code-opened",
                });

                window.open(
                  "https://github.com/prismicio-solution-engineering/slicify-library#readme",
                  "_blank",
                );
              }}
            />
          </Flex>
        )}
      >
        <Heading sx={{ mb: 2 }}>Create a master Slice Library</Heading>
        <Video
          src="https://res.cloudinary.com/dmtf1daqp/video/upload/v1715957263/Slice_library_video_oemhy0.mp4"
          sizing="contain"
          autoPlay
          loop
        />
        <Paragraph sx={{ mb: 2 }}>
          This is an{" "}
          <a
            href="https://slicify-app.vercel.app/slice-library"
            target="_blank"
          >
            example Slice Library
          </a>
          , which provides you with an overview of all your slices in one place.
          Build it yourself in a few steps.
        </Paragraph>
      </Card>
    </SliceMachineModal>
  );
};
