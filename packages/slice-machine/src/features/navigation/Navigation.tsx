import { ActionList, Box, Separator, Skeleton } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { Suspense } from "react";

import { telemetry } from "@/apiClient";
import { DefaultErrorBoundary } from "@/errorBoundaries";
import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { RepositoryInfo } from "@/features/navigation/RepositoryInfo";
import { OnboardingGuide } from "@/features/onboarding";
import { useAdapterName } from "@/hooks/useAdapterName";
import { useMarketingContent } from "@/hooks/useMarketingContent";
import { FolderIcon } from "@/icons/FolderIcon";
import { LightningIcon } from "@/icons/Lightning";
import { MenuBookIcon } from "@/icons/MenuBookIcon";

import { ChangesItem } from "../../legacy/components/Navigation/ChangesItem";
import { Environment } from "../../legacy/components/Navigation/Environment";
import { NavigationItem } from "./NavigationItem";
import { SliceMachineVersion } from "./SliceMachineVersion";
import { UpdateInfo } from "./UpdateInfo";

export function Navigation() {
  const router = useRouter();

  const { documentationLink } = useMarketingContent();
  const adapter = useAdapterName();

  interface CustomTypeNavigationItemProps {
    type: "page" | "custom";
  }
  function CustomTypeNavigationItem({ type }: CustomTypeNavigationItemProps) {
    return (
      <NavigationItem
        title={CUSTOM_TYPES_MESSAGES[type].name({
          start: true,
          plural: true,
        })}
        href={CUSTOM_TYPES_CONFIG[type].tablePagePathname}
        active={CUSTOM_TYPES_CONFIG[type].matchesTablePagePathname(
          router.asPath,
        )}
        Icon={CUSTOM_TYPES_CONFIG[type].Icon}
      />
    );
  }

  return (
    <Box
      as="nav"
      flexDirection="column"
      padding={{ block: 16, inline: 16 }}
      gap={24}
      minWidth={0}
    >
      <Box flexDirection="column" gap={16}>
        <Suspense fallback={<Skeleton height={40} />}>
          <Environment />
        </Suspense>

        <Separator style="dashed" />

        <RepositoryInfo />

        <ChangesItem />
      </Box>

      <Box flexDirection="column" flexGrow={1} gap={32}>
        <ActionList variant="compact">
          <CustomTypeNavigationItem type="page" />

          <CustomTypeNavigationItem type="custom" />

          <NavigationItem
            title="Slices"
            href="/slices"
            Icon={FolderIcon}
            active={router.asPath.startsWith("/slices")}
          />
        </ActionList>

        <DefaultErrorBoundary>
          <Suspense>
            <UpdateInfo />
          </Suspense>
        </DefaultErrorBoundary>
      </Box>

      <Box flexDirection="column">
        <ActionList variant="compact">
          <DefaultErrorBoundary>
            <Suspense>
              <OnboardingGuide />
            </Suspense>
          </DefaultErrorBoundary>
          <NavigationItem
            title="Documentation"
            href={documentationLink}
            target="_blank"
            Icon={MenuBookIcon}
            onClick={() => {
              void telemetry.track({
                event: "navigation:documentation-link-clicked",
                framework: adapter,
              });
            }}
          />

          <NavigationItem
            title="Changelog"
            href="/changelog"
            Icon={LightningIcon}
            active={router.asPath.startsWith("/changelog")}
            RightElement={
              <DefaultErrorBoundary>
                <Suspense fallback={<Skeleton height={16} />}>
                  <SliceMachineVersion />
                </Suspense>
              </DefaultErrorBoundary>
            }
          />
        </ActionList>
      </Box>
    </Box>
  );
}
