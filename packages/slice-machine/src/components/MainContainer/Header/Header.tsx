import { ReactNode } from "react";

import { Button, ButtonGroup, Icon } from "@prismicio/editor-ui";

import { Breadcrumb } from "@src/components/Breadcrumb";

import * as styles from "./Header.css";

type HeaderProps = {
  actions?: ReactNode;
  backTo?: () => void;
  breadcrumb: string;
};

export const Header = ({ actions, backTo, breadcrumb }: HeaderProps) => (
  <header className={styles.root}>
    <div className={styles.navigation}>
      {backTo !== undefined ? (
        <Button
          variant="secondary"
          startIcon={<Icon name="arrowBack" />}
          onClick={backTo}
        />
      ) : null}
      <Breadcrumb>{breadcrumb}</Breadcrumb>
    </div>
    {actions !== undefined ? <ButtonGroup>{actions}</ButtonGroup> : null}
  </header>
);
