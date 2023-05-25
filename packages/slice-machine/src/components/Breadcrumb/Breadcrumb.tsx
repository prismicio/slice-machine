import { Text } from "@prismicio/editor-ui";
import { FC, ReactNode } from "react";

type BreadcrumbProps = Readonly<{
  children: ReactNode;
}>;

export const Breadcrumb: FC<BreadcrumbProps> = ({ children }) => {
  return <Text color="grey11">{children}</Text>;
};
