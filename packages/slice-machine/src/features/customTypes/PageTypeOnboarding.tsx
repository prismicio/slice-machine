import { useState } from "react";
import { Box, Button, Text } from "@prismicio/editor-ui";
import { cache } from "@prismicio/editor-support/Suspense";

import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { BlankPageIcon } from "@src/icons/BlankPageIcon";
import { getIsEmptyProject } from "@src/hooks/useIsEmptyProject";

export function PageTypeOnboarding() {
  const [isCreatingCustomType, setIsCreatingCustomType] = useState(false);
  const [isCreateCustomTypeModalOpen, setIsCreateCustomTypeModalOpen] =
    useState(false);

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
        <Button
          loading={isCreatingCustomType}
          onClick={() => {
            setIsCreateCustomTypeModalOpen(true);
          }}
        >
          Create a page type
        </Button>
        <CreateCustomTypeModal
          format="page"
          isCreating={isCreatingCustomType}
          isOpen={isCreateCustomTypeModalOpen}
          origin="onboarding"
          onCreateChange={(isCreating) => {
            setIsCreatingCustomType(isCreating);
            cache.clear(getIsEmptyProject, []);
          }}
          onOpenChange={setIsCreateCustomTypeModalOpen}
        />
      </Box>
    </Box>
  );
}
