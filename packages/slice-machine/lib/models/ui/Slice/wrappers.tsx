import { Link as ThemeLink } from "theme-ui";
import Link from "next/link";

export const LinkCardWrapper = ({
  link,
  children,
}: {
  link: { as: string } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
}) => {
  //TODO: make the redirection through "connected-next-router" so that the router location is synched with redux
  return (
    <Link passHref href={link?.as || ""}>
      <ThemeLink
        sx={{
          textDecoration: "none",
          color: "inherit",
        }}
        as="a"
      >
        {children}
      </ThemeLink>
    </Link>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NonClickableCardWrapper = ({ children }: { children: any }) => {
  return <div style={{ cursor: "not-allowed" }}>{children}</div>;
};

export enum WrapperType {
  clickable = "clickable",
  nonClickable = "nonClickable",
}

export const WrapperByType = {
  [WrapperType.clickable]: LinkCardWrapper,
  [WrapperType.nonClickable]: NonClickableCardWrapper,
};
