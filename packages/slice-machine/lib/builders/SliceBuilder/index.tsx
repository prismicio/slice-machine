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
import { FloatingBackButton } from "@src/features/slices/sliceBuilder/FloatingBackButton";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import { AutoSaveStatusIndicator } from "@src/features/autoSave/AutoSaveStatusIndicator";

export const SliceBuilder: FC = () => {
  const { slice, actionQueueStatus } = useSliceState();

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url="/slices" />
        <AppLayoutBreadcrumb folder="Slices" page={slice.model.name} />
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
