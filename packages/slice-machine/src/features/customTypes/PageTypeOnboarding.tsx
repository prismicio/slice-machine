import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, Text } from "@prismicio/editor-ui";
import { cache } from "@prismicio/editor-support/Suspense";

import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { isLoading } from "@src/modules/loading";
import { BlankPageIcon } from "@src/icons/BlankPageIcon";
import { getIsEmptyProject } from "@src/hooks/useIsEmptyProject";

export function PageTypeOnboarding() {
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { isCreatingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE,
      ),
    }),
  );
  // State to ensure button loader is still visible while redirecting
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    if (isCreatingCustomType) {
      setIsButtonLoading(true);
      cache.clear(getIsEmptyProject, []);
    }
  }, [isCreatingCustomType]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      height="100vh"
      alignItems="center"
      backgroundColor="grey2"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width={384}
      >
        <BlankPageIcon />
        <Text variant="h3" align="center" sx={{ marginTop: 16 }}>
          Blank page
        </Text>
        <Text color="grey11" align="center" sx={{ marginBottom: 16 }}>
          Welcome to Slice Machine. Your journey starts with your first page
          type — the model that you will use to create pages for your website.
        </Text>
        <Button onClick={openCreateCustomTypeModal} loading={isButtonLoading}>
          Create a page type
        </Button>
        <CreateCustomTypeModal format="page" origin="onboarding" />
      </Box>
    </Box>
  );
}
