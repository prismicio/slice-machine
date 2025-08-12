import { Box, Button, ButtonGroup } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type FC, Suspense, useState } from "react";

import { DefaultErrorBoundary } from "@/errorBoundaries";
import { useCustomType } from "@/features/customTypes/customTypesBuilder/useCustomType";
import {
  CUSTOM_TYPES_CONFIG,
  matchesBuilderPagePathname,
  readBuilderPageDynamicSegment,
} from "@/features/customTypes/customTypesConfig";
import { type Route, useRouteChange } from "@/hooks/useRouteChange";
import { CloseIcon } from "@/icons/CloseIcon";
import { UndoIcon } from "@/icons/UndoIcon";

export const FloatingBackButton: FC = () => {
  const { source } = useRouteChange();
  const sourceCustomTypeId = getSourceCustomTypeId(source);
  return sourceCustomTypeId !== undefined ? (
    <DefaultErrorBoundary>
      <Suspense>
        <Box
          bottom={32}
          justifyContent="center"
          position="fixed"
          right={0}
          width="100vw"
        >
          <BackButton sourceCustomTypeId={sourceCustomTypeId} />
        </Box>
      </Suspense>
    </DefaultErrorBoundary>
  ) : null;
};

function getSourceCustomTypeId(source: Route): string | undefined {
  const sourceCustomTypeId = readBuilderPageDynamicSegment(source.query);
  return sourceCustomTypeId !== undefined &&
    matchesBuilderPagePathname(source.asPath, sourceCustomTypeId)
    ? sourceCustomTypeId
    : undefined;
}

type BackButtonProps = { sourceCustomTypeId: string };

const BackButton: FC<BackButtonProps> = ({ sourceCustomTypeId }) => {
  const sourceCustomType = useCustomType(sourceCustomTypeId);
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  if (sourceCustomType !== undefined && visible) {
    const { format, id } = sourceCustomType;
    // TODO(DT-1462): format should not be nullable.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const url = CUSTOM_TYPES_CONFIG[format!].getBuilderPagePathname(id);
    return (
      <ButtonGroup density="compact" color="dark">
        <Button
          onClick={() => {
            void router.push(url);
          }}
          renderStartIcon={() => <UndoIcon />}
        >
          Return to {sourceCustomType.label}
        </Button>
        <Button
          onClick={() => {
            setVisible(false);
          }}
          renderStartIcon={() => <CloseIcon />}
        />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
