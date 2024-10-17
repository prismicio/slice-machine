import type { UrlObject } from "node:url";

import { Tooltip, useMediaQuery } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import {
  ComponentType,
  type FC,
  forwardRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  type SVGProps,
} from "react";

import { LogoIcon } from "@/icons/LogoIcon";
import OpenIcon from "@/icons/OpenIcon";

import { Divider } from "../Divider";
import styles from "./SideNav.module.css";

export const SideNav: FC<PropsWithChildren> = (props) => (
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

      <Tooltip content="Open Prismic repository" side="right">
        <a
          className={styles.repositoryLinkIcon}
          data-testid="prismic-repository-link"
          href={href}
          target="_blank"
        >
          <OpenIcon />
        </a>
      </Tooltip>
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

type BaseSideNavCtaProps = {
  title: string;
  active?: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  RightElement?: ReactNode;
};

type SideNavButtonProps = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

type SideNavLinkProps = {
  href: string;
  target?: "_blank";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

type ComponentProps<C extends CtaType> = C extends "a"
  ? SideNavLinkProps
  : C extends "button"
  ? SideNavButtonProps
  : C extends FC<infer P>
  ? Omit<P, keyof BaseSideNavCtaProps>
  : never;

export type SideNavCtaProps<C extends CtaType> = BaseSideNavCtaProps & {
  component?: C;
} & ComponentProps<C>;

type CtaType = "button" | "a" | FC<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function SideNavCta<C extends CtaType = "a">({
  title,
  RightElement,
  Icon,
  active,
  component,
  ...otherProps
}: SideNavCtaProps<C>) {
  const visible = useMediaQuery({ max: "medium" });
  const Comp = component ?? "a";

  return (
    <Tooltip content={title} side="right" visible={visible}>
      <Comp {...otherProps} className={styles.link} data-active={active}>
        <>
          <Icon className={styles.linkIcon} />
          <div className={styles.linkContent}>
            <span className={styles.linkText}>{title}</span>
            {RightElement}
          </div>
        </>
      </Comp>
    </Tooltip>
  );
}

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
  component?: "a" | FC<{ href: string | UrlObject }>;
};

export const UpdateInfo: FC<UpdateInfoProps> = ({
  href,
  onClick,
  component: Comp = "a",
}) => (
  <div className={styles.updateInfo}>
    <h3 className={styles.updateInfoTitle}>Updates Available</h3>

    <p className={styles.updateInfoText}>
      Some updates of Slice Machine are available.
    </p>

    {
      // TODO(DT-1942): This should be a Button with a link component for
      // accessibility
    }
    <Comp className={styles.updateInfoLink} href={href} onClick={onClick}>
      Learn more
    </Comp>
  </div>
);
