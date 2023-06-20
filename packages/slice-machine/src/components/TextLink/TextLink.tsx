import type { FC, ReactNode } from "react";
import { isValidElement, cloneElement } from "react";

import clsx from "clsx";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./TextLink.css";

type IconProps = Readonly<{
  className?: string;
}>;

interface TextLinkProps {
  children: string;
  color?: keyof typeof styles.colorVariant;
  endIcon?: ReactNode;
  href: string;
  textVariant?: "normal" | "smallBold" | "inherit";
}

export const TextLink: FC<TextLinkProps> = (props) => {
  const {
    children,
    color = "primary",
    endIcon,
    href,
    textVariant = "smallBold",
    ...otherProps
  } = props;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...otherProps}
      className={clsx(styles.root, styles.colorVariant[color])}
    >
      <Text component="span" color="inherit" variant={textVariant}>
        {children}
      </Text>
      {isValidElement<IconProps>(endIcon)
        ? cloneElement(endIcon, {
            className: clsx(
              endIcon.props.className,
              styles.endIcon,
              styles.iconVariant[textVariant]
            ),
          })
        : null}
    </a>
  );
};
