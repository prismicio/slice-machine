import { Text } from "@prismicio/editor-ui";
import { clsx } from "clsx";
import { cloneElement, type FC, isValidElement, type ReactNode } from "react";

import styles from "./TextLink.module.css";

type IconProps = Readonly<{
  className?: string;
}>;

interface TextLinkProps {
  children: string;
  color?: "primary" | "secondary";
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
      className={clsx(styles.root, styles[`color-${color}`])}
    >
      <Text component="span" color="inherit" variant={textVariant}>
        {children}
      </Text>
      {isValidElement<IconProps>(endIcon)
        ? cloneElement(endIcon, {
            className: clsx(
              endIcon.props.className,
              styles.endIcon,
              styles[`icon-${textVariant}`],
            ),
          })
        : null}
    </a>
  );
};
