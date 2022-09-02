import { Link as ThemeLink } from "theme-ui";
import Link from "next/link";

export const LinkCardWrapper = ({
  link,
  children,
}: {
  link: { as: string } | undefined;
  children: React.ReactNode;
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

export const NonClickableCardWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div style={{ cursor: "not-allowed" }}>{children}</div>;
};

export const NoCardWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export enum WrapperType {
  clickable = "clickable",
  nonClickable = "nonClickable",
  changesPage = "changesPage",
}

export const WrapperByType = {
  [WrapperType.clickable]: LinkCardWrapper,
  [WrapperType.nonClickable]: NonClickableCardWrapper,
  [WrapperType.changesPage]: NoCardWrapper,
};
