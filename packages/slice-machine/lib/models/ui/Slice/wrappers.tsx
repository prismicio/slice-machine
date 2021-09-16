import { Link as ThemeLink } from "theme-ui";
import Link from "next/link";

export const LinkCardWrapper = ({
  link,
  children,
}: {
  link: { as: string } | undefined;
  children: any;
}) => {
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
