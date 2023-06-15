import router from "next/router";
import { ReactElement } from "react";

import { ButtonGroup } from "@prismicio/editor-ui";
import { IconButton } from "@src/components/IconButton";

import { Breadcrumb } from "@src/components/Breadcrumb";

import * as styles from "./Header.css";

type HeaderProps = {
  Actions?: ReactElement[];
  backTo?: string;
  breadcrumb: string;
};

export const Header = ({ Actions, backTo, breadcrumb }: HeaderProps) => (
  <header className={styles.root}>
    <div className={styles.flex}>
      {backTo !== undefined ? (
        <IconButton icon="arrowBack" onClick={() => void router.push(backTo)} />
      ) : null}
      <Breadcrumb>{breadcrumb}</Breadcrumb>
    </div>
    {Actions ? <ButtonGroup>{Actions}</ButtonGroup> : null}
  </header>
);
