import { Text } from "@prismicio/editor-ui";
import { FC } from "react";

import * as styles from "./Breadcrumb.css";

export type BreadcrumbProps = {
  folder: string;
  page?: string;
  separator?: string;
};

export const Breadcrumb: FC<BreadcrumbProps> = ({
  folder,
  page,
  separator = "/",
}) => {
  return (
    <div
      aria-label="Breadcrumb"
      data-testid={`breadcrumb-${folder}-${page ?? ""}`}
    >
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
    </div>
  );
};
