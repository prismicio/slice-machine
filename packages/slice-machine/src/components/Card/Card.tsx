import type { UrlObject } from "node:url";

import { findFocusableAncestor } from "@prismicio/editor-support/DOM";
import { Text } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import {
  createElement,
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import styles from "./Card.module.css";

type CardProps = PropsWithChildren<
  {
    checked?: boolean;
    size?: "small" | "medium";
    style?: CSSProperties;
    variant?: "solid" | "outlined";
  } & (
    | // Props for rendering a non-interactive `div` element.
    NarrowedCardProps<{ interactive?: false }>
    // Props for rendering an interactive `div` element.
    | NarrowedCardProps<{
        interactive: true;
        disabled?: boolean;
        onClick?: (event: MouseEvent) => void;
      }>
    // Props for rendering an `a` element.
    | NarrowedCardProps<{ interactive: true; href: string; component?: "a" }>
    // Props for rendering any link `component`.
    | NarrowedCardProps<{
        interactive: true;
        href: string;
        component: FC<LinkProps>;
        replace?: boolean;
      }>
  )
>;

// This type is used to spread the `Card`'s `otherProps` before they can be
// narrowed down.
type NarrowedCardProps<T> = NarrowedProps<
  T,
  "component" | "disabled" | "href" | "interactive" | "onClick" | "replace"
>;

/**
 * Construct a type with the properties of T and a set of optional properties K
 * (excluding those already in type T).
 */
type NarrowedProps<T, K extends PropertyKey> = T &
  Omit<Partial<Record<K, never>>, keyof T>;

type LinkProps = {
  href: string | UrlObject;
  onClick?: (event: MouseEvent) => void;
};

export const Card: FC<CardProps> = (props) => {
  const {
    checked = false,
    size = "medium",
    variant = "solid",
    interactive: _interactive,
    disabled: _disabled,
    onClick: _onClick,
    href: _href,
    component = "a",
    replace: _replace,
    ...otherProps
  } = props;
  const elementProps = {
    ...otherProps,
    className: clsx(styles.root, styles[`size-${size}`], styles[variant], {
      [styles.interactive]: props.interactive,
    }),
    "data-state": checked === true ? "checked" : undefined,
  };
  if (props.interactive === true && props.href === undefined) {
    return (
      <div
        {...elementProps}
        // TODO: add missing ARIA attributes and keyboard event handlers.
        data-disabled={props.disabled === true ? "" : undefined}
        onClick={(event) => {
          if (props.disabled === true || props.onClick === undefined) return;
          const target = event.target as HTMLElement;
          if (findFocusableAncestor(target) === event.currentTarget) {
            props.onClick(event);
          }
        }}
        tabIndex={props.disabled === true ? undefined : 0}
      />
    );
  } else if (props.interactive === true) {
    return createElement(component, {
      ...elementProps,
      href: props.href,
      onClick: (event) => {
        const target = event.target as HTMLElement;
        if (findFocusableAncestor(target) !== event.currentTarget) {
          event.preventDefault();
        }
      },
      ...(component === "a" ? {} : { replace: props.replace }),
    });
  } else {
    return <div {...elementProps} />;
  }
};

type CardMediaProps = { overlay?: ReactNode } & (
  | ({ component?: "img" } & ImgHTMLAttributes<HTMLImageElement>)
  | ({ component: "div" } & HTMLAttributes<HTMLDivElement>)
);

export const CardMedia: FC<CardMediaProps> = ({
  className,
  component = "img",
  overlay,
  ...otherProps
}) => (
  <div className={styles.media}>
    {createElement(component, {
      ...otherProps,
      className: clsx(styles[`mediaComponent-${component}`], className),
    })}
    {Boolean(overlay) ? (
      <div className={styles.mediaOverlay}>{overlay}</div>
    ) : undefined}
  </div>
);

export const CardActions: FC<PropsWithChildren> = (props) => (
  <div {...props} className={styles.actions} />
);

type CardFooterProps = {
  action?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
};

export const CardFooter: FC<CardFooterProps> = ({
  action,
  subtitle,
  title,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.footer}>
    <div className={styles.footerTexts}>
      <Text component="span" noWrap variant="bold">
        {title}
      </Text>
      <Text color="grey11" component="span" noWrap variant="small">
        {subtitle}
      </Text>
    </div>
    {action}
  </div>
);

export const CardStatus: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => (
  <div {...otherProps} className={styles.status}>
    <Text
      align="center"
      color="inherit"
      component="span"
      noWrap
      variant="smallBold"
    >
      {children}
    </Text>
  </div>
);
