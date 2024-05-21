import Head from "next/head";
import { useRouter } from "next/router";

import useCurrentSlice from "@/hooks/useCurrentSlice";
import Simulator from "@/legacy/components/Simulator";

export default function SimulatorPage() {
  const router = useRouter();
  const { slice, variation } = useCurrentSlice();

  if (slice === undefined || variation === undefined) {
    void router.replace("/");

    return null;
  }

  return (
    <>
      <Head>
        <title>{`Simulator: ${slice.model.name} - Slice Machine`}</title>
      </Head>
      <Simulator slice={slice} variation={variation} />
    </>
  );
}
