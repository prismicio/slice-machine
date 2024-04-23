import Head from "next/head";
import { useRouter } from "next/router";

import { SliceBuilderProvider } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import useCurrentSlice from "@/hooks/useCurrentSlice";
import SliceBuilder from "@/legacy/lib/builders/SliceBuilder";

export default function SlicePage() {
  const router = useRouter();
  const { slice: initialSlice, variation: defaultVariation } =
    useCurrentSlice();

  if (initialSlice === undefined || defaultVariation === undefined) {
    void router.replace("/");

    return null;
  }

  return (
    <SliceBuilderProvider initialSlice={initialSlice}>
      {({ slice }) => {
        return (
          <>
            <Head>
              <title>{slice.model.name} - Slice Machine</title>
            </Head>
            <SliceBuilder />
          </>
        );
      }}
    </SliceBuilderProvider>
  );
}
