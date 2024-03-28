import { Box } from "@prismicio/editor-ui";
import { Suspense, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { telemetry } from "@src/apiClient";
import VideoItem from "@components/Navigation/VideoItem";
import { LightningIcon } from "@src/icons/Lightning";
import { MathPlusIcon } from "@src/icons/MathPlusIcon";
import { SettingsIcon } from "@src/icons/SettingsIcon";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import {
  SideNavLink,
  SideNavListItem,
  SideNavList,
  SideNav,
  SideNavRepository,
} from "@src/components/SideNav/SideNav";
import { Divider } from "@src/components/Divider";
import { FolderIcon } from "@src/icons/FolderIcon";
import { userHasSeenTutorialsToolTip } from "@src/modules/userContext";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { useGitIntegrationExperiment } from "@src/features/settings/git/useGitIntegrationExperiment";
import { useRepositoryInformation } from "@src/hooks/useRepositoryInformation";
import { ErrorBoundary } from "@src/ErrorBoundary";

import { ChangesItem } from "./ChangesItem";
import { Environment } from "./Environment";
import { RunningVersion } from "./RunningVersion";
import { UpdateBox } from "./UpdateBox";

import * as styles from "./index.css";

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
        <SideNavListItem>
          <SideNavLink
            title="Invite team"
            href={`${repositoryUrl}/settings/users`}
            Icon={MathPlusIcon}
            onClick={() => {
              void telemetry.track({
                event: "users-invite-button-clicked",
              });
            }}
            target="_blank"
          />
        </SideNavListItem>

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
