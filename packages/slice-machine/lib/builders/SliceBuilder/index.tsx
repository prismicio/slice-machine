import { Box } from "@prismicio/editor-ui";
import { type FC } from "react";

import FieldZones from "./FieldZones";
import { Sidebar } from "./Sidebar";

import SimulatorButton from "@builders/SliceBuilder/SimulatorButton";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { BreadcrumbItem } from "@src/components/Breadcrumb";
import { FloatingBackButton } from "@src/features/slices/sliceBuilder/FloatingBackButton";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import { AutoSaveStatusIndicator } from "@src/features/autoSave/AutoSaveStatusIndicator";
import { ModelProvider } from "@src/features/models/ModelProvider";

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
          <ModelProvider type="slice" model={slice}>
            <FieldZones />
          </ModelProvider>
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
