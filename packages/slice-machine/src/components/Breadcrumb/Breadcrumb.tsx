import { Text } from "@prismicio/editor-ui";
import { FC } from "react";

import * as styles from "./Breadcrumb.css";

export const Breadcrumb: FC<{
  folder?: string;
  page?: string;
  separator?: string;
}> = ({ folder, page, separator = "/" }) => {
  return (
    <Text color="grey11">
      {folder}
      {page !== undefined ? (
        <>
          &nbsp;{separator}&nbsp;
          <Text className={styles.pageSpan} component="span" color="grey12">
            {page}
          </Text>
        </>
      ) : null}
    </Text>
  );
};
