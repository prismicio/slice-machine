import { ActionList, Box, Separator, Skeleton } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";

import { telemetry } from "@/apiClient";
import { ErrorBoundary } from "@/ErrorBoundary";
import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { MasterSliceLibraryPreviewModal } from "@/features/masterSliceLibrary/SliceLibraryPreviewModal";
import { RepositoryInfo } from "@/features/navigation/RepositoryInfo";
import { OnboardingGuide } from "@/features/onboarding";
import { useGitIntegrationExperiment } from "@/features/settings/git/useGitIntegrationExperiment";
import { useMarketingContent } from "@/hooks/useMarketingContent";
import { FolderIcon } from "@/icons/FolderIcon";
import { LightningIcon } from "@/icons/Lightning";
import { MasterSliceLibraryIcon } from "@/icons/MasterSliceLibraryIcon";
import { SettingsIcon } from "@/icons/SettingsIcon";

import { ChangesItem } from "../../legacy/components/Navigation/ChangesItem";
import { Environment } from "../../legacy/components/Navigation/Environment";
import { NavigationItem } from "./NavigationItem";
import { SliceMachineVersion } from "./SliceMachineVersion";
import { UpdateInfo } from "./UpdateInfo";

export function Navigation() {
  const router = useRouter();

  const gitIntegrationExperiment = useGitIntegrationExperiment();
  const [isSliceLibraryDialogOpen, setIsSliceLibraryDialogOpen] =
    useState(false);
  const { masterSliceLibrary } = useMarketingContent();

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
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <Environment />
          </Suspense>
        </ErrorBoundary>

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

        <ErrorBoundary>
          <Suspense>
            <UpdateInfo />
          </Suspense>
        </ErrorBoundary>
      </Box>

      <Box flexDirection="column">
        <ActionList variant="compact">
          <ErrorBoundary>
            <Suspense>
              <OnboardingGuide />
            </Suspense>
          </ErrorBoundary>

          {masterSliceLibrary && (
            <>
              <MasterSliceLibraryPreviewModal
                isOpen={isSliceLibraryDialogOpen}
                onClose={() => {
                  setIsSliceLibraryDialogOpen(false);
                }}
              />
              <NavigationItem
                title="Master Slice Library"
                Icon={MasterSliceLibraryIcon}
                onClick={() => {
                  void telemetry.track({
                    event: "slice-library:beta:modal-opened",
                  });

                  setIsSliceLibraryDialogOpen(true);
                }}
              />
            </>
          )}

          {gitIntegrationExperiment.eligible && (
            <NavigationItem
              title="Settings"
              href="/settings"
              Icon={SettingsIcon}
              active={router.asPath.startsWith("/settings")}
            />
          )}

          <NavigationItem
            title="Changelog"
            href="/changelog"
            Icon={LightningIcon}
            active={router.asPath.startsWith("/changelog")}
            RightElement={
              <ErrorBoundary>
                <Suspense fallback={<Skeleton height={16} />}>
                  <SliceMachineVersion />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </ActionList>
      </Box>
    </Box>
  );
}
