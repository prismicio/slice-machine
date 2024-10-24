import { ActionListItem, Tooltip, useMediaQuery } from "@prismicio/editor-ui";
import Link from "next/link";
import type { FC, MouseEventHandler, ReactNode, SVGProps } from "react";

interface NavigationItemProps {
  title: string;
  href?: string;
  active?: boolean;
  Icon: FC<SVGProps<SVGSVGElement>>;
  RightElement?: ReactNode;
  onClick?: MouseEventHandler<Element>;
}

export function NavigationItem(props: NavigationItemProps) {
  const { title, href, active, Icon, RightElement, onClick, ...otherProps } =
    props;

  const isCollapsed = useMediaQuery({ max: "medium" });

  const Content = (
    <ActionListItem
      textVariant="normal"
      backgroundColor="transparent"
      renderStartIcon={() => <Icon width={isCollapsed ? 28 : 32} />}
      renderEndIcon={() => RightElement}
      selected={active}
    >
      {isCollapsed ? null : title}
    </ActionListItem>
  );

  return (
    <Tooltip content={title} side="right" visible={isCollapsed}>
      {href !== undefined ? (
        <Link href={href} style={{ textDecoration: "none" }} {...otherProps}>
          {Content}
        </Link>
      ) : (
        onClick && (
          <button
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: 0,
              textAlign: "left",
            }}
            onClick={onClick}
          >
            {Content}
          </button>
        )
      )}
    </Tooltip>
  );
}
