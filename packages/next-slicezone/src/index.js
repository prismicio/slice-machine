import SliceZone from "./SliceZone";

import { useGetStaticProps, useGetStaticPaths } from "./hooks/index.js";

export default SliceZone;
export {
  useGetStaticProps,
  useGetStaticPaths,
  useGetStaticPaths as withGetStaticPaths,
  useGetStaticProps as withGetStaticProps,
};
