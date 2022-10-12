import { FiLink2, FiImage, FiCode, FiList } from "react-icons/fi";
import { BsListOl } from "react-icons/bs";
import React from "react";
import { IconType } from "react-icons/lib";

const Icon =
  (v: React.ReactNode): IconType =>
  ({ size }) => {
    return <span style={{ fontSize: size }}>{v}</span>;
  };

const options = [
  {
    value: "paragraph",
    label: "P",
    icon: Icon("p"),
  },
  {
    value: "preformatted",
    label: "PRE",
    icon: Icon("pre"),
  },
  {
    value: "heading1",
    label: "H1",
    icon: Icon("h1"),
  },
  {
    value: "heading2",
    label: "H2",
    icon: Icon("h2"),
  },
  {
    value: "heading3",
    label: "H3",
    icon: Icon("h3"),
  },
  {
    value: "heading4",
    label: "H4",
    icon: Icon("h4"),
  },
  {
    value: "heading5",
    label: "H5",
    icon: Icon("h5"),
  },
  {
    value: "heading6",
    label: "H6",
    icon: Icon("h6"),
  },
  {
    value: "strong",
    label: "Strong",
    icon: Icon(<b>b</b>),
  },
  {
    value: "em",
    label: "em",
    icon: Icon(<em style={{ fontFamily: "serif" }}>I</em>),
  },
  {
    value: "hyperlink",
    label: "hyperlink",
    icon: Icon(<FiLink2 />),
  },
  {
    value: "image",
    label: "image",
    icon: Icon(<FiImage />),
  },
  {
    value: "embed",
    label: "embed",
    icon: Icon(<FiCode />),
  },
  {
    value: "list-item",
    label: "list",
    icon: Icon(<FiList />),
  },
  {
    value: "o-list-item",
    label: "o",
    icon: Icon(<BsListOl />),
  },
  {
    value: "rtl",
    label: "rtl",
    icon: Icon("rtl"),
  },
];

export const optionValues = options.map((e) => e.value);
export default options;
