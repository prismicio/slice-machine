import type { FC, ReactNode } from "react";
import { isValidElement, cloneElement } from "react";

import clsx from "clsx";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./TextLink.css";
import * as textStyles from "@prismicio/editor-ui/dist/components/Text/Text.css";

type IconProps = Readonly<{
  className?: string;
}>;

type Variant = keyof typeof textStyles.variant;

export interface TextLinkProps {
  children: string;
  color?: keyof typeof styles.colorVariant;
  endIcon?: ReactNode;
  href: string;
  textVariant?: Variant;
}

export const TextLink: FC<TextLinkProps> = (props) => {
  const {
    children,
    color = "primary",
    endIcon,
    href,
    textVariant = "smallBold",
  } = props;

  return (
    <a
      href={href}
      target="_blank"
      className={clsx(styles.root, styles.colorVariant[color])}
      rel="noreferrer"
    >
      <Text color="inherit" variant={textVariant} className={styles.text}>
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
