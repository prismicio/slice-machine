import {
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  FileDropZone,
  ProgressCircle,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import { type FC, useState } from "react";
import { toast } from "react-toastify";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { AutoSaveStatusIndicator } from "@/features/autoSave/AutoSaveStatusIndicator";
import { FloatingBackButton } from "@/features/slices/sliceBuilder/FloatingBackButton";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";
import SimulatorButton from "@/legacy/lib/builders/SliceBuilder/SimulatorButton";

import { managerClient } from "../../../../managerClient";
import useSliceMachineActions from "../../../../modules/useSliceMachineActions";
import { Slices } from "../../models/common/Slice";
import FieldZones from "./FieldZones";
import { VariationsList } from "./VariationsList";

export const SliceBuilder: FC = () => {
  const { slice, actionQueueStatus, setSlice } = useSliceState();
  const horizontalScroll = useMediaQuery({ max: "large" });

  const contentDisplayProps = horizontalScroll
    ? { gridTemplateRows: "304px 1fr" }
    : { gridTemplateColumns: "320px 1fr" };

  const [loading, setLoading] = useState<boolean>(false);
  const { saveSliceCustomScreenshotSuccess } = useSliceMachineActions();

  const onFilesSelected = (files: File[]) => {
    void generateSlice(files);
  };

  async function generateSlice(files: File[] | undefined) {
    if (!files || files.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const imageFile = new Uint8Array(await files[0].arrayBuffer());
      const response = await managerClient.slices.generateSlice({
        libraryID: slice.from,
        slice: Slices.fromSM(slice.model),
        imageFile: imageFile,
      });

      if (response?.slice?.variations?.[0]?.id === undefined) {
        throw new Error("Slice generation failed - no variation id");
      }

      const imageUrl = URL.createObjectURL(files[0]);
      saveSliceCustomScreenshotSuccess(
        response.slice?.variations[0].id,
        {
          url: imageUrl,
        },
        {
          ...slice,
          model: Slices.toSM(response.slice),
          screenshots: {
            [response.slice?.variations[0].id]: {
              url: imageUrl,
            },
          },
        },
      );
      setSlice({
        ...slice,
        model: Slices.toSM(response.slice),
        screenshots: {
          [response.slice?.variations[0].id]: {
            url: imageUrl,
          },
        },
      });

      toast.success("Slice generated successfully");
    } catch (error) {
      toast.error("Slice generation failed");
      console.error("Slice generation failed", error);
    }

    setLoading(false);
  }

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url="/slices" />
        <AppLayoutBreadcrumb>
          <BreadcrumbItem>Slices</BreadcrumbItem>
          <BreadcrumbItem active>{slice.model.name}</BreadcrumbItem>
        </AppLayoutBreadcrumb>
        <AppLayoutActions>
          <AutoSaveStatusIndicator status={actionQueueStatus} />
          <SimulatorButton disabled={actionQueueStatus !== "done"} />
        </AppLayoutActions>
      </AppLayoutHeader>
      <AppLayoutContent>
        <Box gap={16} flexDirection="column">
          <Box
            display="grid"
            alignItems="flex-start"
            gap={16}
            {...contentDisplayProps}
          >
            <VariationsList horizontalScroll={horizontalScroll} />
            <FieldZones />
          </Box>
          <Box gap={8}>
            <FileDropZone
              assetType="image"
              onFilesSelected={onFilesSelected}
              overlay={<Overlay />}
            >
              <Box
                height={200}
                backgroundColor="grey3"
                justifyContent="center"
                alignItems="center"
                border={true}
                borderStyle="dashed"
                borderRadius={8}
              >
                {loading ? (
                  <Box gap={12} alignItems="center">
                    <ProgressCircle />
                    <Text variant="h4">
                      We are generating your new slice...
                    </Text>
                  </Box>
                ) : (
                  <Text variant="h4">Drop a slice screenshot here</Text>
                )}
              </Box>
            </FileDropZone>
          </Box>
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

function Overlay() {
  return (
    <Box justifyContent="center" flexDirection="column" height="100%">
      <BlankSlate>
        <BlankSlateIcon
          name="cloudUpload"
          lineColor="purple1"
          backgroundColor="purple12"
        />
        <BlankSlateTitle size="big">Drop a slice here</BlankSlateTitle>
        <BlankSlateDescription>
          Drop a slice screenshot to generate model, mocks and code.
        </BlankSlateDescription>
      </BlankSlate>
    </Box>
  );
}

export default SliceBuilder;
