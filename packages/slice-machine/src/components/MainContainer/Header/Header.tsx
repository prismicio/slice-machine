import { ReactElement } from "react";

import { Button, ButtonGroup, Icon } from "@prismicio/editor-ui";

import { Breadcrumb } from "@src/components/Breadcrumb";

import * as styles from "./Header.css";

type HeaderProps = {
  actions?: ReactElement[];
  backTo?: () => void;
  breadcrumb: string;
};

export const Header = ({ actions, backTo, breadcrumb }: HeaderProps) => (
  <header className={styles.root}>
    <div className={styles.spaceBetweenFlex}>
      {backTo !== undefined ? (
        <Button
          variant="secondary"
          startIcon={<Icon name="arrowBack" />}
          onClick={backTo}
        />
      ) : null}
      <Breadcrumb>{breadcrumb}</Breadcrumb>
    </div>
    {actions ? <ButtonGroup>{actions}</ButtonGroup> : null}
  </header>
);
