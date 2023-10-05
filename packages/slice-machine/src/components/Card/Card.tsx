import { findFocusableAncestor } from "@prismicio/editor-support/DOM";
import { Text } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import type { UrlObject } from "node:url";
import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  createElement,
} from "react";

import * as styles from "./Card.css";

type CardProps = PropsWithChildren<
  {
    size?: keyof typeof styles.size;
    style?: CSSProperties;
    variant?: keyof typeof styles.variant;
  } & (
    | { interactive?: false }
    | ({ interactive: true; href: string } & {
        component?: "a" | FC<LinkProps>;
      })
    | ({ interactive: true; href?: undefined } & {
        checked?: boolean;
        disabled?: boolean;
        onClick?: (event: MouseEvent) => void;
      })
  )
>;

type LinkProps = {
  href: string | UrlObject;
  onClick?: (event: MouseEvent) => void;
};

export const Card: FC<CardProps> = (props) => {
  const { size = "medium", variant = "solid" } = props;
  const elementProps = {
    className: clsx(styles.root, styles.size[size], styles.variant[variant], {
      [styles.interactive]: props.interactive,
      [styles.interactiveVariant[variant]]: props.interactive,
    }),
  };
  if (props.interactive === true && props.href === undefined) {
    const {
      size: _size,
      variant: _variant,
      interactive: _interactive,
      checked,
      disabled,
      onClick,
      ...otherProps
    } = props;
    return (
      <div
        {...otherProps}
        {...elementProps}
        // TODO: add missing ARIA attributes and keyboard event handlers.
        data-disabled={disabled === true ? "" : undefined}
        data-state={checked === true ? "checked" : undefined}
        onClick={(event) => {
          if (disabled === true || onClick === undefined) return;
          const target = event.target as HTMLElement;
          if (findFocusableAncestor(target) === event.currentTarget) {
            onClick(event);
          }
        }}
        tabIndex={disabled === true ? undefined : 0}
      />
    );
  } else if (props.interactive === true) {
    const {
      size: _size,
      variant: _variant,
      interactive: _interactive,
      component = "a",
      ...otherProps
    } = props;
    return createElement(component, {
      ...otherProps,
      ...elementProps,
      onClick: (event) => {
        const target = event.target as HTMLElement;
        if (findFocusableAncestor(target) !== event.currentTarget) {
          event.preventDefault();
        }
      },
    });
  } else {
    const {
      size: _size,
      variant: _variant,
      interactive: _interactive,
      ...otherProps
    } = props;
    return <div {...otherProps} {...elementProps} />;
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
      className: clsx(styles.mediaComponent[component], className),
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
