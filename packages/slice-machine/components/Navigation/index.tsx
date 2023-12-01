import { ErrorBoundary } from "@prismicio/editor-ui";
import { Suspense, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { telemetry } from "@src/apiClient";
import VideoItem from "@components/Navigation/VideoItem";
import { LightningIcon } from "@src/icons/Lightning";
import { MathPlusIcon } from "@src/icons/MathPlusIcon";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import {
  SideNavSeparator,
  SideNavLink,
  SideNavListItem,
  SideNavList,
  UpdateInfo,
  RightElement,
  SideNav,
  SideNavRepository,
} from "@src/components/SideNav/SideNav";
import { Divider } from "@src/components/Divider";
import { FolderIcon } from "@src/icons/FolderIcon";
import { userHasSeenTutorialsToolTip } from "@src/modules/userContext";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { getChangelog } from "@src/modules/environment";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { useRepositoryInformation } from "@src/hooks/useRepositoryInformation";

import { ChangesListItem } from "./ChangesListItem";
import { Environment } from "./Environment";

import * as styles from "./index.css";

const Navigation: FC = () => {
  const { changelog, hasSeenTutorialsToolTip } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      hasSeenTutorialsToolTip: userHasSeenTutorialsToolTip(store),
    }),
  );
  const router = useRouter();
  const { setUpdatesViewed, setSeenTutorialsToolTip } =
    useSliceMachineActions();
  const { repositoryName, repositoryDomain, repositoryUrl } =
    useRepositoryInformation();

  return (
    <SideNav>
      <ErrorBoundary
        onError={(error) => {
          console.error(
            `An error occurred while rendering the environments switch`,
            error,
          );
        }}
      >
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

        <SideNavSeparator />

        <ChangesListItem />

        <SideNavSeparator />

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

      {(changelog.sliceMachine.updateAvailable ||
        changelog.adapter.updateAvailable) && (
        <UpdateInfo
          href="/changelog"
          onClick={() => {
            const latestVersion =
              changelog.sliceMachine.versions.length > 0
                ? changelog.sliceMachine.versions?.[0]
                : null;
            setUpdatesViewed({
              latest: latestVersion && latestVersion.versionNumber,
              latestNonBreaking:
                changelog.sliceMachine.latestNonBreakingVersion,
            });
          }}
          component={Link}
        />
      )}

      <SideNavList position="bottom">
        <SideNavLink
          title="Invite team"
          href={`${repositoryUrl}/settings/users`}
          Icon={(props) => <MathPlusIcon {...props} />}
          onClick={() => {
            void telemetry.track({
              event: "users-invite-button-clicked",
            });
          }}
          target="_blank"
        />

        <ErrorBoundary>
          <Suspense>
            <VideoItem
              hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
              onClose={setSeenTutorialsToolTip}
            />
          </Suspense>
        </ErrorBoundary>

        <SideNavListItem>
          <SideNavLink
            title="Changelog"
            href="/changelog"
            Icon={(props) => <LightningIcon {...props} />}
            active={router.asPath.startsWith("/changelog")}
            component={Link}
            RightElement={
              <RightElement data-cy="slicemachine-version">
                {changelog.sliceMachine.currentVersion &&
                  `v${changelog.sliceMachine.currentVersion}`}
              </RightElement>
            }
          />
        </SideNavListItem>
      </SideNavList>
    </SideNav>
  );
};

export default Navigation;
