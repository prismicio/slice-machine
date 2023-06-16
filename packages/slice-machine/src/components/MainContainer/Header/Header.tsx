import { ReactElement } from "react";

import { Button, ButtonGroup, Icon } from "@prismicio/editor-ui";

import { Breadcrumb } from "@src/components/Breadcrumb";

import * as styles from "./Header.css";

type HeaderProps = {
  Actions?: ReactElement[];
  backTo?: () => void;
  breadcrumb: string;
};

export const Header = ({ Actions, backTo, breadcrumb }: HeaderProps) => (
  <header className={styles.root}>
    <div className={styles.flex}>
      {backTo !== undefined ? (
        <Button
          variant="secondary"
          startIcon={<Icon name="arrowBack" />}
          onClick={backTo}
        />
      ) : null}
      <Breadcrumb>{breadcrumb}</Breadcrumb>
    </div>
    {Actions ? <ButtonGroup>{Actions}</ButtonGroup> : null}
  </header>
);
