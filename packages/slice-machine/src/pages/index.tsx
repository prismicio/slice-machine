import { type FC } from "react";

import { CustomTypesTablePage as CustomTypesTablePageTemplate } from "@/features/customTypes/customTypesTable/CustomTypesTablePage";

const PageTypesTablePage: FC = () => {
  return <CustomTypesTablePageTemplate format="page" />;
};

export default PageTypesTablePage;
