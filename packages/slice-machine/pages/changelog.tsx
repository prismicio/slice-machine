import Head from "next/head";

import Changelog from "@components/Changelog";

export default function ChangelogPage() {
  return (
    <>
      <Head>
        <title>Changelog - Slice Machine</title>
      </Head>
      <Changelog />
    </>
  );
}
