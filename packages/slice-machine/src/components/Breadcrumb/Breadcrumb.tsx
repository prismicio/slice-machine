import { Text } from "@prismicio/editor-ui";
import { FC, PropsWithChildren } from "react";

export const Breadcrumb: FC<PropsWithChildren> = ({ children }) => {
  return <Text color="grey11">{children}</Text>;
};
