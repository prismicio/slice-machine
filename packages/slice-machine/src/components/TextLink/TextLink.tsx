import type { FC, ReactNode } from "react";
import { isValidElement, cloneElement } from "react";

import clsx from "clsx";
import { Text } from "@prismicio/editor-ui";

import * as styles from "./TextLink.css";
import * as textStyles from "@prismicio/editor-ui/dist/components/Text/Text.css";

type IconProps = Readonly<{
  className?: string;
  size?: number;
}>;

type Variant = keyof typeof textStyles.variant;

export interface TextLinkProps {
  href: string;
  children: string;
  endIcon?: ReactNode;
  textVariant?: Variant;
}

const iconVariantMapping: Readonly<Record<Variant, number>> = {
  normal: 22,
  bold: 22,
  small: 20,
  extraSmall: 18,
  smallBold: 20,
  emphasized: 18,
  h1: 26,
  h2: 24,
  h3: 22,
  h4: 20,
  inherit: 22,
};

export const TextLink: FC<TextLinkProps> = (props) => {
  const { href, children, textVariant = "smallBold", endIcon } = props;

  return (
    <a href={href} target="_blank" className={styles.root} rel="noreferrer">
      <Text color="inherit" variant={textVariant} className={styles.text}>
        {children}
      </Text>
      {isValidElement<IconProps>(endIcon)
        ? cloneElement(endIcon, {
            className: clsx(endIcon.props.className, styles.endIcon),
            size: iconVariantMapping[textVariant],
          })
        : null}
    </a>
  );
};
