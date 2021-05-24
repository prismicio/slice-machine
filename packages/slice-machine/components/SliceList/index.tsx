import { Link as ThemeLink } from "theme-ui";
import Link from "next/link";
import Card from "./Card";

import SliceState from "../../lib/models/ui/SliceState";
import * as Links from "../../lib/builders/SliceBuilder/links";
import Grid from "../Grid";

const DefaultCardWrapper = ({
  link,
  children,
}: {
  link: { as: string };
  children: any;
}) => {
  return (
    <Link
      passHref
      href={link.as}
    >
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

const SliceList = ({
  slices,
  cardType = "ForSlicePage",
  cardProps,
  gridProps,
  CardWrapper = DefaultCardWrapper,
}: {
  cardType?: string;
  slices: ReadonlyArray<SliceState>;
  cardProps?: object;
  gridProps?: object;
  CardWrapper?: Function;
}) => (
  <Grid
    {...gridProps}
    elems={slices}
    renderElem={(slice: SliceState) => {
      const defaultVariation = SliceState.variation(slice);
      if (!defaultVariation) {
        return null;
      }
      const variationId = defaultVariation.id;
      const link = Links.variation(
        slice.href,
        slice.jsonModel.name,
        variationId
      );
      return (
        <CardWrapper
          slice={slice}
          variationId={variationId}
          link={link}
          key={`${slice.from}-${slice.jsonModel.id}-${variationId}`}
        >
          <Card
            cardType={cardType}
            slice={slice}
            {...cardProps}
            defaultVariation={defaultVariation}
          />
        </CardWrapper>
      );
    }}
  />
);

export default SliceList;
