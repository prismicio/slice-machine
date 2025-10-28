import { writeFile, access, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import type { NextEnvironment } from "../detectEnvironment";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

export async function createPageComponents(
  cwd: string,
  env: NextEnvironment,
  customTypes: CustomType[],
  verbose: boolean,
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  // Filter to only page types
  const pageTypes = customTypes.filter((ct) => ct.format === "page");

  for (const customType of pageTypes) {
    const wasCreated = await createPageComponent(cwd, env, customType, verbose);
    if (wasCreated) {
      created++;
    } else {
      skipped++;
    }
  }

  return { created, skipped };
}

async function createPageComponent(
  cwd: string,
  env: NextEnvironment,
  customType: CustomType,
  verbose: boolean,
): Promise<boolean> {
  const basePath = env.hasSrcDirectory ? "src" : ".";
  const extension = env.isTypeScript ? "tsx" : "jsx";

  let filename: string;
  let displayPath: string;

  if (env.hasAppRouter) {
    // App Router
    if (customType.repeatable) {
      // Repeatable: app/[customtype.id]/[uid]/page.tsx
      filename = join(
        cwd,
        basePath,
        "app",
        customType.id,
        "[uid]",
        `page.${extension}`,
      );
      displayPath = `${basePath}/app/${customType.id}/[uid]/page.${extension}`;
    } else {
      // Single: app/[customtype.id]/page.tsx
      filename = join(cwd, basePath, "app", customType.id, `page.${extension}`);
      displayPath = `${basePath}/app/${customType.id}/page.${extension}`;
    }
  } else {
    // Pages Router - all under /[customtype.id]/...
    if (customType.repeatable) {
      // Repeatable: pages/[customtype.id]/[uid].tsx
      filename = join(
        cwd,
        basePath,
        "pages",
        customType.id,
        `[uid].${extension}`,
      );
      displayPath = `${basePath}/pages/${customType.id}/[uid].${extension}`;
    } else {
      // Single: pages/[customtype.id].tsx
      filename = join(cwd, basePath, "pages", `${customType.id}.${extension}`);
      displayPath = `${basePath}/pages/${customType.id}.${extension}`;
    }
  }

  // Check if file already exists
  try {
    await access(filename);
    if (verbose) {
      console.log(chalk.gray(`⏭️  Skipped ${displayPath} (exists)`));
    }
    return false;
  } catch {
    // File doesn't exist, create it
  }

  // Ensure directory exists
  await mkdir(dirname(filename), { recursive: true });

  const contents = generatePageComponent(customType, env);

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    console.log(chalk.green(`✅ Created ${displayPath}`));
  }

  return true;
}

function generatePageComponent(
  customType: CustomType,
  env: NextEnvironment,
): string {
  if (env.hasAppRouter) {
    return generateAppRouterPage(
      customType,
      env.isTypeScript,
      env.hasSrcDirectory,
    );
  } else {
    return generatePagesRouterPage(
      customType,
      env.isTypeScript,
      env.hasSrcDirectory,
    );
  }
}

function generateAppRouterPage(
  customType: CustomType,
  isTypeScript: boolean,
  hasSrcDirectory: boolean,
): string {
  // Calculate import paths based on directory depth
  // Single: app/[id]/page.tsx → ../../prismicio (or ../../../prismicio if src/)
  // Repeatable: app/[id]/[uid]/page.tsx → ../../../prismicio (or ../../../../prismicio if src/)
  const levelsUp = customType.repeatable ? 3 : 2;
  const levelsUpWithSrc = hasSrcDirectory ? levelsUp + 1 : levelsUp;
  const importPath = "../".repeat(levelsUpWithSrc) + "prismicio";
  const slicesPath = "../".repeat(levelsUpWithSrc) + "slices";

  if (customType.repeatable) {
    if (isTypeScript) {
      return `import { Metadata } from "next";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "${importPath}";
import { components } from "${slicesPath}";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID("${customType.id}", uid)
    .catch(() => notFound());

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID("${customType.id}", uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("${customType.id}");

  return pages.map((page) => ({ uid: page.uid }));
}
`;
    } else {
      return `import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "${importPath}";
import { components } from "${slicesPath}";

export default async function Page({ params }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID("${customType.id}", uid)
    .catch(() => notFound());

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata({ params }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client
    .getByUID("${customType.id}", uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("${customType.id}");

  return pages.map((page) => ({ uid: page.uid }));
}
`;
    }
  } else {
    // Single type
    if (isTypeScript) {
      return `import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "${importPath}";
import { components } from "${slicesPath}";

export default async function Page() {
  const client = createClient();
  const page = await client.getSingle("${customType.id}").catch(() => notFound());

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("${customType.id}").catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
    },
  };
}
`;
    } else {
      return `import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "${importPath}";
import { components } from "${slicesPath}";

export default async function Page() {
  const client = createClient();
  const page = await client.getSingle("${customType.id}").catch(() => notFound());

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata() {
  const client = createClient();
  const page = await client.getSingle("${customType.id}").catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
    },
  };
}
`;
    }
  }
}

function generatePagesRouterPage(
  customType: CustomType,
  isTypeScript: boolean,
  hasSrcDirectory: boolean,
): string {
  // Calculate import paths based on directory depth
  // Single: pages/[id].tsx → ../prismicio (or ../../prismicio if src/)
  // Repeatable: pages/[id]/[uid].tsx → ../../prismicio (or ../../../prismicio if src/)
  const levelsUp = customType.repeatable ? 2 : 1;
  const levelsUpWithSrc = hasSrcDirectory ? levelsUp + 1 : levelsUp;
  const importPath = "../".repeat(levelsUpWithSrc) + "prismicio";
  const slicesPath = "../".repeat(levelsUpWithSrc) + "slices";

  if (customType.repeatable) {
    if (isTypeScript) {
      return `import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { isFilled, asLink, asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { components } from "${slicesPath}";
import { createClient } from "${importPath}";

type Params = { uid: string };

export default function Page({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>{page.data.meta_title}</title>
        {isFilled.keyText(page.data.meta_description) ? (
          <meta name="description" content={page.data.meta_description} />
        ) : null}
        {isFilled.image(page.data.meta_image) ? (
          <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
        ) : null}
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function getStaticProps({
  params,
  previewData,
}: GetStaticPropsContext<Params>) {
  const client = createClient({ previewData });
  const page = await client.getByUID("${customType.id}", params!.uid);

  return { props: { page } };
}

export async function getStaticPaths() {
  const client = createClient();
  const pages = await client.getAllByType("${customType.id}");

  return {
    paths: pages.map((page) => asLink(page)),
    fallback: false,
  };
}
`;
    } else {
      return `import Head from "next/head";
import { isFilled, asLink, asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { components } from "${slicesPath}";
import { createClient } from "${importPath}";

export default function Page({ page }) {
  return (
    <>
      <Head>
        <title>{page.data.meta_title}</title>
        {isFilled.keyText(page.data.meta_description) ? (
          <meta name="description" content={page.data.meta_description} />
        ) : null}
        {isFilled.image(page.data.meta_image) ? (
          <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
        ) : null}
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function getStaticProps({ params, previewData }) {
  const client = createClient({ previewData });
  const page = await client.getByUID("${customType.id}", params.uid);

  return { props: { page } };
}

export async function getStaticPaths() {
  const client = createClient();
  const pages = await client.getAllByType("${customType.id}");

  return {
    paths: pages.map((page) => asLink(page)),
    fallback: false,
  };
}
`;
    }
  } else {
    // Single type
    if (isTypeScript) {
      return `import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { isFilled, asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { components } from "${slicesPath}";
import { createClient } from "${importPath}";

export default function Page({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>{page.data.meta_title}</title>
        {isFilled.keyText(page.data.meta_description) ? (
          <meta name="description" content={page.data.meta_description} />
        ) : null}
        {isFilled.image(page.data.meta_image) ? (
          <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
        ) : null}
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function getStaticProps({ previewData }: GetStaticPropsContext) {
  const client = createClient({ previewData });
  const page = await client.getSingle("${customType.id}");

  return { props: { page } };
}
`;
    } else {
      return `import Head from "next/head";
import { isFilled, asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { components } from "${slicesPath}";
import { createClient } from "${importPath}";

export default function Page({ page }) {
  return (
    <>
      <Head>
        <title>{page.data.meta_title}</title>
        {isFilled.keyText(page.data.meta_description) ? (
          <meta name="description" content={page.data.meta_description} />
        ) : null}
        {isFilled.image(page.data.meta_image) ? (
          <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
        ) : null}
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

export async function getStaticProps({ previewData }) {
  const client = createClient({ previewData });
  const page = await client.getSingle("${customType.id}");

  return { props: { page } };
}
`;
    }
  }
}
