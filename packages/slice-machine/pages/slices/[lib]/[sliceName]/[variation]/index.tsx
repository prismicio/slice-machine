import Head from "next/head";
import SliceBuilder from "lib/builders/SliceBuilder";
import useCurrentSlice from "@src/hooks/useCurrentSlice";
import { createComponentWithSlice } from "@src/layouts/WithSlice";

const SliceBuilderWithSlice = createComponentWithSlice(SliceBuilder);

export default function SlicePage() {
  const { slice } = useCurrentSlice();

  return (
    <>
      <Head>
        {slice ? <title>{slice.model.name} - Slice Machine</title> : null}
      </Head>
      <SliceBuilderWithSlice />
    </>
  );
}
