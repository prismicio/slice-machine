import { Box, Link as ThemeLink, ThemeUIStyleObject } from "theme-ui";
import Link from "next/link";

export const LinkCardWrapper = ({
  link,
  children,
  sx,
}: {
  link: { as: string } | undefined;
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
}) => {
  //TODO: make the redirection through "connected-next-router" so that the router location is synched with redux
  return (
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
    <Link passHref href={link?.as || ""}>
      <ThemeLink
        sx={{
          textDecoration: "none",
          color: "inherit",
          ...sx,
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
  sx,
}: {
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
}) => {
  return <Box sx={{ cursor: "not-allowed", ...sx }}>{children}</Box>;
};

export enum WrapperType {
  clickable = "clickable",
  nonClickable = "nonClickable",
}

export const WrapperByType = {
  [WrapperType.clickable]: LinkCardWrapper,
  [WrapperType.nonClickable]: NonClickableCardWrapper,
};
