import React from "react";

import { Box, Spinner, Text, Button as ThemeButton } from "theme-ui";
import Link from "next/link";

import Card from "@components/Card";

import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  selectIsSimulatorAvailableForFramework,
  getFramework,
  getStorybookUrl,
  getLinkToStorybookDocs,
} from "@src/modules/environment";
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
  const { checkSimulatorSetup } = useSliceMachineActions();

  const router = useRouter();

  const {
    isCheckingSimulatorSetup,
    isSimulatorAvailableForFramework,
    linkToStorybookDocs,
    framework,
    storybookUrl,
  } = useSelector((state: SliceMachineStoreType) => ({
    framework: getFramework(state),
    linkToStorybookDocs: getLinkToStorybookDocs(state),
    isCheckingSimulatorSetup: isLoading(state, LoadingKeysEnum.CHECK_SIMULATOR),
    isSimulatorAvailableForFramework:
      selectIsSimulatorAvailableForFramework(state),
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
      <ThemeButton
        data-testid="open-set-up-simulator"
        disabled={!isSimulatorAvailableForFramework}
        onClick={() =>
          checkSimulatorSetup(true, () =>
            window.open(`${router.asPath}/simulator`, component.model.id)
          )
        }
        variant={
          isSimulatorAvailableForFramework ? "secondary" : "disabledSecondary"
        }
        sx={{ cursor: "pointer", width: "100%", mt: 3 }}
      >
        {isCheckingSimulatorSetup ? <Spinner size={12} /> : "Preview Slice"}
      </ThemeButton>
      {!isSimulatorAvailableForFramework && (
        <Text
          as="p"
          sx={{
            textAlign: "center",
            mt: 3,
            color: "grey05",
            "::first-letter": {
              "text-transform": "uppercase",
            },
          }}
        >
          {`Slice Simulator does not support ${
            framework || "your"
          } framework yet.`}
          &nbsp;
          {!storybookUrl ? (
            <>
              You can{" "}
              <a target={"_blank"} href={linkToStorybookDocs}>
                install Storybook
              </a>{" "}
              instead.
            </>
          ) : null}
        </Text>
      )}

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
