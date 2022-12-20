import React from "react";

import { Box, Button as ThemeButton } from "theme-ui";
import Link from "next/link";

import Card from "@components/Card";

import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";

import { getStorybookUrl } from "@src/modules/environment";
import { createStorybookUrl } from "@src/utils/storybook";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import type Models from "@slicemachine/core/build/models";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import { Button } from "@components/Button";
import { AiOutlineCamera } from "react-icons/ai";

type SideBarProps = {
  component: ComponentUI;
  variation: Models.VariationSM;
};

const SideBar: React.FunctionComponent<SideBarProps> = ({
  component,
  variation,
}) => {
  const { screenshots } = component;
  const { openScreenshotsModal } = useScreenshotChangesModal();

  const { storybookUrl } = useSelector((state: SliceMachineStoreType) => ({
    storybookUrl: getStorybookUrl(state),
  }));

  return (
    <Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: "sidebar",
      }}
    >
      <Card
        bg="headSection"
        bodySx={{ p: 0 }}
        Footer={() => (
          <Button
            onClick={openScreenshotsModal}
            variant="secondarySmall"
            sx={{ fontWeight: "bold" }}
            Icon={AiOutlineCamera}
            iconFill="#1A1523"
            label="Update screenshot"
          />
        )}
        footerSx={{ padding: 2 }}
        sx={{ overflow: "hidden" }}
      >
        <ScreenshotPreview
          src={screenshots[variation.id]?.url}
          sx={{
            height: "198px",
            borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
            borderRadius: "4px 4px 0 0",
          }}
        />
      </Card>
      {storybookUrl && (
        <Link
          href={createStorybookUrl({
            storybook: storybookUrl,
            libraryName: component.from,
            sliceName: component.model.name,
            variationId: variation.id,
          })}
        >
          <ThemeButton variant={"secondary"} sx={{ width: "100%", mt: 3 }}>
            Open Storybook
          </ThemeButton>
        </Link>
      )}
      <ScreenshotChangesModal
        slices={[component]}
        defaultVariationSelector={{
          sliceID: component.model.id,
          variationID: variation.id,
        }}
      />
    </Box>
  );
};

export default SideBar;
