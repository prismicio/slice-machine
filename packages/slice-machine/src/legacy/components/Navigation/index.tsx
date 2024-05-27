import { Box } from "@prismicio/editor-ui";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, Suspense, useState } from "react";
import { useSelector } from "react-redux";

import { telemetry } from "@/apiClient";
import { Divider } from "@/components/Divider";
import {
  SideNav,
  SideNavLink,
  SideNavList,
  SideNavListItem,
  SideNavRepository,
} from "@/components/SideNav/SideNav";
import { ErrorBoundary } from "@/ErrorBoundary";
import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { MasterSliceLibraryPreviewModal } from "@/features/masterSliceLibrary/SliceLibraryPreviewModal";
import { useGitIntegrationExperiment } from "@/features/settings/git/useGitIntegrationExperiment";
import { useMarketingContent } from "@/hooks/useMarketingContent";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";
import { FolderIcon } from "@/icons/FolderIcon";
import { LightningIcon } from "@/icons/Lightning";
import { MasterSliceLibraryIcon } from "@/icons/MasterSliceLibraryIcon";
import { SettingsIcon } from "@/icons/SettingsIcon";
import VideoItem from "@/legacy/components/Navigation/VideoItem";
import { userHasSeenTutorialsToolTip } from "@/modules/userContext";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

import { ChangesItem } from "./ChangesItem";
import { Environment } from "./Environment";
import styles from "./index.module.css";
import { RunningVersion } from "./RunningVersion";
import { UpdateBox } from "./UpdateBox";

const Navigation: FC = () => {
  const { hasSeenTutorialsToolTip } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasSeenTutorialsToolTip: userHasSeenTutorialsToolTip(store),
    }),
  );
  const router = useRouter();
  const { setSeenTutorialsToolTip } = useSliceMachineActions();
  const { repositoryName, repositoryDomain, repositoryUrl } =
    useRepositoryInformation();
  const gitIntegrationExperiment = useGitIntegrationExperiment();
  const [isSliceLibraryDialogOpen, setIsSliceLibraryDialogOpen] =
    useState(false);
  const { masterSliceLibrary } = useMarketingContent();

  return (
    <SideNav>
      <ErrorBoundary>
        <Suspense>
          <Environment />
        </Suspense>
      </ErrorBoundary>

      <Divider
        variant="edgeFaded"
        color="grey6"
        className={styles.environmentDivider}
      />

      <SideNavRepository
        repositoryName={repositoryName}
        repositoryDomain={repositoryDomain}
        href={repositoryUrl}
      />

      <Box flexDirection="column" padding={{ bottom: 24 }}>
        <ChangesItem />
      </Box>

      <SideNavList>
        <SideNavListItem>
          <SideNavLink
            title={CUSTOM_TYPES_MESSAGES["page"].name({
              start: true,
              plural: true,
            })}
            href={CUSTOM_TYPES_CONFIG["page"].tablePagePathname}
            active={CUSTOM_TYPES_CONFIG["page"].matchesTablePagePathname(
              router.asPath,
            )}
            component={Link}
            Icon={CUSTOM_TYPES_CONFIG.page.Icon}
          />
        </SideNavListItem>

        <SideNavListItem>
          <SideNavLink
            title={CUSTOM_TYPES_MESSAGES["custom"].name({
              start: true,
              plural: true,
            })}
            href={CUSTOM_TYPES_CONFIG["custom"].tablePagePathname}
            active={CUSTOM_TYPES_CONFIG["custom"].matchesTablePagePathname(
              router.asPath,
            )}
            component={Link}
            Icon={CUSTOM_TYPES_CONFIG.custom.Icon}
          />
        </SideNavListItem>

        <SideNavListItem>
          <SideNavLink
            title="Slices"
            href="/slices"
            Icon={FolderIcon}
            active={router.asPath.startsWith("/slices")}
            component={Link}
          />
        </SideNavListItem>
      </SideNavList>

      <ErrorBoundary>
        <Suspense>
          <UpdateBox />
        </Suspense>
      </ErrorBoundary>

      <SideNavList position="bottom">
        {masterSliceLibrary !== undefined && (
          <SideNavListItem>
            <MasterSliceLibraryPreviewModal
              isOpen={isSliceLibraryDialogOpen}
              onClose={() => {
                setIsSliceLibraryDialogOpen(false);
              }}
            />
            <SideNavLink
              title="Master Slice Library"
              href={"/"}
              Icon={MasterSliceLibraryIcon}
              onClick={(e) => {
                void telemetry.track({
                  event: "slice-library:beta:modal-opened",
                });

                setIsSliceLibraryDialogOpen(true);

                // We don't want it to actually navigate anywhere, but `href` is required
                e.preventDefault();
              }}
            />
          </SideNavListItem>
        )}

        <ErrorBoundary>
          <Suspense>
            <VideoItem
              hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
              onClose={setSeenTutorialsToolTip}
            />
          </Suspense>
        </ErrorBoundary>

        {gitIntegrationExperiment.eligible ? (
          <SideNavListItem>
            <SideNavLink
              title="Settings"
              href="/settings"
              Icon={SettingsIcon}
              active={router.asPath.startsWith("/settings")}
              component={Link}
            />
          </SideNavListItem>
        ) : undefined}

        <SideNavListItem>
          <SideNavLink
            title="Changelog"
            href="/changelog"
            Icon={LightningIcon}
            active={router.asPath.startsWith("/changelog")}
            component={Link}
            RightElement={
              <ErrorBoundary>
                <Suspense>
                  <RunningVersion />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </SideNavListItem>
      </SideNavList>
    </SideNav>
  );
};

export default Navigation;
