import {
  HTMLAttributes,
  type CSSProperties,
  type FC,
  type LiHTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  type SVGProps,
  createElement,
  forwardRef,
} from "react";
import clsx from "clsx";
import type { UrlObject } from "node:url";

import LogoIcon from "@src/icons/LogoIcon";
import OpenIcon from "@src/icons/OpenIcon";

import { Divider } from "../Divider";

import * as styles from "./SideNav.css";

type SideNavProps = PropsWithChildren<{ style?: CSSProperties }>;

export const SideNav: FC<SideNavProps> = (props) => (
  <nav {...props} className={styles.root} />
);

export const SideNavLogo: FC = () => {
  return <LogoIcon className={styles.logo} />;
};

type SideNavRepositoryProps = {
  repositoryName: string;
  repositoryDomain: string;
  href: string;
};

export const SideNavRepository: FC<SideNavRepositoryProps> = ({
  href,
  repositoryDomain,
  repositoryName,
}) => {
  return (
    <div className={styles.repository}>
      <div className={styles.repositoryInfo}>
        <h1 className={styles.repositoryName}>{repositoryName}</h1>

        <h2 className={styles.repositoryDomain}>{repositoryDomain}</h2>
      </div>

      <a
        className={styles.repositoryLinkIcon}
        href={href}
        target="_blank"
        title="Open prismic repository"
      >
        <OpenIcon />
      </a>
    </div>
  );
};

type SideNavListProps = PropsWithChildren<{
  /**
   * Position of the list in the SideNav.
   *
   * @default "top"
   */
  position?: "top" | "bottom";
}>;

export const SideNavList: FC<SideNavListProps> = ({
  position = top,
  children,
}) => (
  <ul
    className={clsx(styles.list, {
      [styles.listBottom]: position === "bottom",
    })}
  >
    {children}
  </ul>
);

export const SideNavListItem = forwardRef<
  HTMLLIElement,
  LiHTMLAttributes<HTMLLIElement>
>((props, ref) => <li {...props} className={styles.listItem} ref={ref} />);

export const SideNavListTitle: FC<PropsWithChildren> = (props) => (
  <h3 {...props} className={styles.listTitle} />
);

export const SideNavSeparator = () => (
  <Divider color="grey6" className={styles.separator} />
);

export type SideNavLinkProps = {
  title: string;
  href: string;
  active?: boolean;
  Icon: FC<SVGProps<SVGSVGElement>>;
  target?: "_blank";
  RightElement?: ReactNode;
  component?: "a" | FC<LinkProps>;
  onClick?: (event: MouseEvent) => void;
};

type LinkProps = {
  href: string | UrlObject;
};

export const SideNavLink: FC<SideNavLinkProps> = ({
  title,
  RightElement,
  Icon,
  active,
  component = "a",
  ...otherProps
}) =>
  createElement(
    component,
    { ...otherProps, ...{ className: styles.link, "data-active": active } },
    <>
      <Icon className={styles.linkIcon} />
      <div className={styles.linkContent}>
        <span className={styles.linkText}>{title}</span>
        {RightElement}
      </div>
    </>,
  );

type RightElementProps = PropsWithChildren<
  {
    type?: "pill" | "text";
  } & HTMLAttributes<HTMLSpanElement>
>;

export const RightElement: FC<RightElementProps> = ({
  type = "text",
  children,
  ...props
}) => {
  return (
    <span
      {...props}
      className={clsx({
        [styles.rightElementPill]: type === "pill",
        [styles.rightElementText]: type === "text",
      })}
    >
      {children}
    </span>
  );
};

type UpdateInfoProps = {
  onClick?: (event: MouseEvent) => void;
  href: string;
  component?: "a" | FC<LinkProps>;
};

export const UpdateInfo: FC<UpdateInfoProps> = ({
  href,
  onClick,
  component = "a",
}) => (
  <div className={styles.updateInfo}>
    <h3 className={styles.updateInfoTitle}>Updates Available</h3>

    <p className={styles.updateInfoText}>
      Some updates of Slice Machine are available.
    </p>

    {createElement(
      component,
      { ...{ className: styles.updateInfoLink, onClick }, href },
      "Learn more",
    )}
  </div>
);
