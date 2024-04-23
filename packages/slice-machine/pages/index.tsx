import { type FC } from "react";

import { CustomTypesTablePage as CustomTypesTablePageTemplate } from "@/features/customTypes/customTypesTable/CustomTypesTablePage";
import { PageTypeOnboarding } from "@/features/customTypes/PageTypeOnboarding";
import { useIsEmptyProject } from "@/hooks/useIsEmptyProject";

const PageTypesTablePage: FC = () => {
  const isEmptyProject = useIsEmptyProject();

  if (isEmptyProject) {
    return <PageTypeOnboarding />;
  }

  return <CustomTypesTablePageTemplate format="page" />;
};

export default PageTypesTablePage;
