import { Box } from "@prismicio/editor-ui";
import { type FC } from "react";

import FieldZones from "./FieldZones";
import { Sidebar } from "./Sidebar";

import { useSelector } from "react-redux";

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
import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import { AutoSaveStatus } from "@src/features/autoSave/AutoSaveStatus";

export const SliceBuilder: FC = () => {
  const { slice, autoSaveStatus } = useSliceState();

  const isSimulatorAvailableForFramework = useSelector(
    selectIsSimulatorAvailableForFramework,
  );

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url="/slices" />
        <AppLayoutBreadcrumb folder="Slices" page={slice.model.name} />
        <AppLayoutActions>
          <AutoSaveStatus status={autoSaveStatus} />
          <SimulatorButton
            isSimulatorAvailableForFramework={isSimulatorAvailableForFramework}
            disabled={autoSaveStatus !== "saved"}
          />
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
