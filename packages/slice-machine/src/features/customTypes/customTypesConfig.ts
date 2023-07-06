import type { NextRouter } from "next/router";

import { DatabaseIcon } from "@src/icons/DatabaseIcon";
import { PageStackIcon } from "@src/icons/PageStackIcon";

export const CUSTOM_TYPES_CONFIG = {
  page: {
    blankSlateImage: "/blank-slate-page-types.png",
    builderPageDynamicSegment: "pageTypeId",
    getBuilderPagePathname: (pageTypeId: string) => `/page-types/${pageTypeId}`,
    matchesTablePagePathname: (pathname: string) =>
      pathname === CUSTOM_TYPES_CONFIG.page.tablePagePathname ||
      pathname.startsWith("/page-types"),
    tablePagePathname: "/",
    Icon: PageStackIcon,
  },
  custom: {
    blankSlateImage: "/blank-slate-custom-types.png",
    builderPageDynamicSegment: "customTypeId",
    getBuilderPagePathname: (customTypeId: string) =>
      `/custom-types/${customTypeId}`,
    matchesTablePagePathname: (pathname: string) =>
      pathname.startsWith(CUSTOM_TYPES_CONFIG.custom.tablePagePathname),
    tablePagePathname: "/custom-types",
    Icon: DatabaseIcon,
  },
};

export function matchesBuilderPagePathname(
  pathname: string,
  customTypeId: string
): boolean {
  return Object.values(CUSTOM_TYPES_CONFIG).some(({ getBuilderPagePathname }) =>
    pathname.startsWith(getBuilderPagePathname(customTypeId))
  );
}

export function readBuilderPageDynamicSegment(
  query: NextRouter["query"]
): string | undefined {
  const customTypesConfigValues = Object.values(CUSTOM_TYPES_CONFIG);
  for (const { builderPageDynamicSegment } of customTypesConfigValues) {
    const value = query[builderPageDynamicSegment];
    if (typeof value === "string") return value;
  }
}
