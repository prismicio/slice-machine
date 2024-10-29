import { ActionListItem, Tooltip, useMediaQuery } from "@prismicio/editor-ui";
import Link from "next/link";
import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  type SVGProps,
  useCallback,
} from "react";

type NavigationItemPropsBase = {
  title: string;
  active?: boolean;
  Icon: FC<SVGProps<SVGSVGElement>>;
  RightElement?: ReactNode;
};

type NavigationLinkItemProps = NavigationItemPropsBase & {
  href: string;
  target?: "_blank";
  onClick?: never;
};

type NavigationButtonItemProps = NavigationItemPropsBase & {
  href?: never;
  target?: never;
  onClick: MouseEventHandler<Element>;
};

type NavigationItemProps = NavigationLinkItemProps | NavigationButtonItemProps;

export function NavigationItem(props: NavigationItemProps) {
  const { title, href, target, active, Icon, RightElement, onClick } = props;

  const isCollapsed = useMediaQuery({ max: "medium" });

  const ItemIcon = useCallback(() => {
    return <Icon width={isCollapsed ? 28 : 32} />;
  }, [Icon, isCollapsed]);

  const Content = (
    <ActionListItem
      textVariant="normal"
      backgroundColor="transparent"
      renderStartIcon={ItemIcon}
      endAdornment={RightElement}
      selected={active}
    >
      {isCollapsed ? null : title}
    </ActionListItem>
  );

  return (
    <Tooltip content={title} side="right" visible={isCollapsed}>
      {href !== undefined ? (
        <Link
          href={href}
          target={target}
          style={{ textDecoration: "none" }}
          data-active={active}
        >
          {Content}
        </Link>
      ) : (
        <button
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
          }}
          onClick={onClick}
          data-active={active}
        >
          {Content}
        </button>
      )}
    </Tooltip>
  );
}
