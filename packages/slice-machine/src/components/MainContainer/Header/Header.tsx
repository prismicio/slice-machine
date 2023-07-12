import { ReactNode } from "react";

import { Button, ButtonGroup, Icon } from "@prismicio/editor-ui";

import * as styles from "./Header.css";

type HeaderProps = {
  actions?: ReactNode;
  backTo?: () => void;
  breadcrumb: ReactNode;
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
      {breadcrumb}
    </div>
    {actions !== undefined ? <ButtonGroup>{actions}</ButtonGroup> : null}
  </header>
);
