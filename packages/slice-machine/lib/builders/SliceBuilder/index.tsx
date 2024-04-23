import SimulatorButton from "@builders/SliceBuilder/SimulatorButton";
import { Box } from "@prismicio/editor-ui";
import { BreadcrumbItem } from "@src/components/Breadcrumb";
import { AutoSaveStatusIndicator } from "@src/features/autoSave/AutoSaveStatusIndicator";
import { FloatingBackButton } from "@src/features/slices/sliceBuilder/FloatingBackButton";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import { type FC } from "react";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";

import FieldZones from "./FieldZones";
import { Sidebar } from "./Sidebar";

export const SliceBuilder: FC = () => {
  const { slice, actionQueueStatus } = useSliceState();

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
        <Box
          alignItems="flex-start"
          display="grid"
          gap={16}
          gridTemplateColumns="320px 1fr"
        >
          <Sidebar />
          <FieldZones />
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
