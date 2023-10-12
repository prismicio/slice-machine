import Head from "next/head";
import Simulator from "@components/Simulator";
import useCurrentSlice from "@src/hooks/useCurrentSlice";
import { createComponentWithSlice } from "@src/layouts/WithSlice";

const SimulatorWithSlice = createComponentWithSlice(Simulator);

export default function SimulatorPage() {
  const { slice } = useCurrentSlice();

  return (
    <>
      <Head>
        <title>
          {slice ? `Simulator: ${slice.model.name}` : "Simulator"} - Slice
          Machine
        </title>
      </Head>
      <SimulatorWithSlice />
    </>
  );
}
