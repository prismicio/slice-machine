import React from "react";

import { pascalize } from "sm-commons/utils/str";

const PageInfo = ({ title, description }) => (
  <div
    style={{
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
    }}
  >
    <h2>{title}</h2>
    <p style={{ maxWidth: "320px", fontSize: "16px" }}>{description}</p>
  </div>
);

const emptySzProps = {
  title: "Your SliceZone is empty.",
  description:
    "Go to your writing room and start creating content to see it appear here!",
};

const slicePropNotFoundProps = {
  title: 'Property "slice" not found or not formatted properly',
  description:
    "This usually means that data passed as property `slices` is not right. Check your configuuration and logs for more info!",
};

export default function SliceZone({
  slices,
  sliceProps = {},
  resolver = () => null,
}) {
  if (!slices || !slices.length) {
    return process.env.NODE_ENV !== "production" ? (
      <PageInfo {...emptySzProps} />
    ) : null;
  }
  return slices.map((slice, i) => {
    if (!slice || !slice.slice_type) {
      return <PageInfo key={`slice-${i + 1}`} {...slicePropNotFoundProps} />;
    }
    const sliceName = pascalize(slice.slice_type);
    const Component = resolver({ sliceName, slice, i });
    const finalSliceProps =
      sliceProps && typeof sliceProps === "function"
        ? sliceProps({ sliceName, slice, i })
        : sliceProps;

    if (Component) {
      return (
        <Component
          key={`slice-${i + 1}`}
          slice={slice}
          i={i}
          {...finalSliceProps}
        />
      );
    }
    console.error(
      "Could not resolve slice, check that you properly pass a `resolver` property to SliceZone"
    );
    return null;
  });
}
