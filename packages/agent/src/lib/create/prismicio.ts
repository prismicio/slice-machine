import { writeFile, access, readFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import type { NextEnvironment } from "../detectEnvironment";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

export async function upsertPrismicFile(
  cwd: string,
  env: NextEnvironment,
  customTypes: CustomType[],
  hasNewPages: boolean = false,
  verbose: boolean,
): Promise<void> {
  const extension = env.isTypeScript ? "ts" : "js";
  const basePath = env.hasSrcDirectory ? "src" : ".";
  const filename = join(cwd, basePath, `prismicio.${extension}`);

  // Generate routes from page-type custom types
  const allRoutes = generateRoutesFromCustomTypes(customTypes);

  // Check if file already exists
  let fileExists = false;
  try {
    await access(filename);
    fileExists = true;
  } catch {
    // File doesn't exist, will create it
  }

  if (fileExists) {
    // If new pages were created, regenerate all routes
    if (hasNewPages) {
      const updated = await replaceRoutesInFile(filename, allRoutes);
      if (updated && verbose) {
        console.log(
          chalk.green(
            `✅ Updated routes in ${basePath}/prismicio.${extension}`,
          ),
        );
      }
    } else if (verbose) {
      console.log(
        chalk.gray(
          `⏭️  Skipped ${basePath}/prismicio.${extension} (no new pages)`,
        ),
      );
    }
    return;
  }

  let contents: string;

  if (env.hasAppRouter) {
    if (env.isTypeScript) {
      contents = generateAppRouterTypeScript(env.hasSrcDirectory, allRoutes);
    } else {
      contents = generateAppRouterJavaScript(env.hasSrcDirectory, allRoutes);
    }
  } else {
    if (env.isTypeScript) {
      contents = generatePagesRouterTypeScript(env.hasSrcDirectory, allRoutes);
    } else {
      contents = generatePagesRouterJavaScript(env.hasSrcDirectory, allRoutes);
    }
  }

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    console.log(chalk.green(`✅ Created ${basePath}/prismicio.${extension}`));
  }
}

function generateRoutesFromCustomTypes(customTypes: CustomType[]): string[] {
  // Filter to only page types
  const pageTypes = customTypes.filter((ct) => ct.format === "page");

  const routes: string[] = [];

  for (const customType of pageTypes) {
    if (customType.repeatable) {
      // Repeatable: /[customtype.id]/[uid]
      routes.push(
        `{ type: "${customType.id}", path: "/${customType.id}/:uid" }`,
      );
    } else {
      // Single: /[customtype.id]
      routes.push(`{ type: "${customType.id}", path: "/${customType.id}" }`);
    }
  }

  return routes;
}

function generateAppRouterTypeScript(
  hasSrcDirectory: boolean,
  routes: string[],
): string {
  const configPath = hasSrcDirectory ? ".." : ".";
  const routesArray =
    routes.length > 0 ? routes.map((r) => `  ${r}`).join(",\n") + "," : "";

  return `import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "${configPath}/slicemachine.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
// Routes must match your project's route structure.
const routes: Route[] = [
${routesArray}
  // Routes must match your project's route structure
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
};
`;
}

function generateAppRouterJavaScript(
  hasSrcDirectory: boolean,
  routes: string[],
): string {
  const configPath = hasSrcDirectory ? ".." : ".";
  const routesArray =
    routes.length > 0 ? routes.map((r) => `  ${r}`).join(",\n") + "," : "";

  return `import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "${configPath}/slicemachine.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 *
 * @type {import("@prismicio/client").Route[]}
 */
// Routes must match your project's route structure.
const routes = [
${routesArray}
  // Routes must match your project's route structure
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param {import("@prismicio/client").ClientConfig} config - Configuration for the Prismic client.
 */
export const createClient = (config = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
};
`;
}

function generatePagesRouterTypeScript(
  hasSrcDirectory: boolean,
  routes: string[],
): string {
  const configPath = hasSrcDirectory ? ".." : ".";
  const routesArray =
    routes.length > 0 ? routes.map((r) => `  ${r}`).join(",\n") + "," : "";

  return `import { createClient as baseCreateClient, type Routes } from "@prismicio/client";
import { enableAutoPreviews, type CreateClientConfig } from "@prismicio/next/pages";
import sm from "${configPath}/slicemachine.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
// Routes must match your project's route structure.
const routes: Routes = [
${routesArray}
  // Routes must match your project's route structure
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = ({ previewData, req, ...config }: CreateClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    ...config,
  });

  enableAutoPreviews({ client, previewData, req });

  return client;
};
`;
}

function generatePagesRouterJavaScript(
  hasSrcDirectory: boolean,
  routes: string[],
): string {
  const configPath = hasSrcDirectory ? ".." : ".";
  const routesArray =
    routes.length > 0 ? routes.map((r) => `  ${r}`).join(",\n") + "," : "";

  return `import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next/pages";
import sm from "${configPath}/slicemachine.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 *
 * @type {import("@prismicio/client").Route[]}
 */
// Routes must match your project's route structure.
const routes = [
${routesArray}
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param {import("@prismicio/next/pages").CreateClientConfig} config - Configuration for the Prismic client.
 */
export const createClient = ({ previewData, req, ...config } = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    ...config,
  });

  enableAutoPreviews({ client, previewData, req });

  return client;
};
`;
}

/**
 * Replaces the routes array in an existing prismicio file with all current routes.
 * Finds "const routes" and removes the entire block until ];, then adds it fresh.
 * If routes array doesn't exist, creates it after the repositoryName export.
 * Returns true if the file was updated.
 */
async function replaceRoutesInFile(
  filename: string,
  allRoutes: string[],
): Promise<boolean> {
  let content = await readFile(filename, "utf8");

  // Build the new routes content
  const routesArray =
    allRoutes.length > 0
      ? allRoutes.map((r) => `  ${r}`).join(",\n") + ","
      : "";

  const newRoutesContent = routesArray
    ? `\n${routesArray}\n  // Routes must match your project's route structure\n`
    : "\n  // Routes must match your project's route structure\n";

  // Find "const routes" and capture everything until the closing ];
  const routesRegex = /const\s+routes[\s\S]*?\];/;
  const match = content.match(routesRegex);

  if (match) {
    // Routes exist - replace them
    const declarationMatch = match[0].match(/^(const\s+routes[^=]*=)\s*\[/);
    const declaration = declarationMatch
      ? declarationMatch[1]
      : "const routes =";
    const newRoutesBlock = `${declaration} [${newRoutesContent}];`;
    content = content.replace(routesRegex, newRoutesBlock);
  } else {
    // Routes don't exist - create them after repositoryName
    // Find the repositoryName export
    const repoNameRegex = /export const repositoryName[\s\S]*?;/;
    const repoMatch = content.match(repoNameRegex);

    if (repoMatch) {
      const newRoutesBlock = `\n\n/**
 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
// Routes must match your project's route structure.
const routes = [${newRoutesContent}];`;

      content = content.replace(
        repoNameRegex,
        `${repoMatch[0]}${newRoutesBlock}`,
      );
    }
  }

  await writeFile(filename, content, "utf8");

  return true;
}
