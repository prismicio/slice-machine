import { CustomTypesTablePage as CustomTypesTablePageTemplate } from "@src/features/customTypes/customTypesTable/CustomTypesTablePage";
import { PageTypeOnboarding } from "@src/features/customTypes/PageTypeOnboarding";
import { useIsEmptyProject } from "@src/hooks/useIsEmptyProject";
import { type FC } from "react";

const PageTypesTablePage: FC = () => {
  const isEmptyProject = useIsEmptyProject();

  if (isEmptyProject) {
    return <PageTypeOnboarding />;
  }

  return <CustomTypesTablePageTemplate format="page" />;
};

export default PageTypesTablePage;
