import { ErrorBoundary } from "@prismicio/editor-ui";
import { Suspense, type FC } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import VideoItem from "@components/Navigation/VideoItem";
import { LightningIcon } from "@src/icons/Lightning";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import {
  SideNavSeparator,
  SideNavLink,
  SideNavListItem,
  SideNavLogo,
  SideNavList,
  UpdateInfo,
  RightElement,
  SideNav,
  SideNavRepository,
} from "@src/components/SideNav/SideNav";
import { FolderIcon } from "@src/icons/FolderIcon";
import { userHasSeenTutorialsToolTip } from "@src/modules/userContext";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  getApiEndpoint,
  getChangelog,
  getRepoName,
} from "@src/modules/environment";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { ChangesListItem } from "./ChangesListItem";

const Navigation: FC = () => {
  const { changelog, repoName, apiEndpoint, hasSeenTutorialsToolTip } =
    useSelector((store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      repoName: getRepoName(store),
      apiEndpoint: getApiEndpoint(store),
      hasSeenTutorialsToolTip: userHasSeenTutorialsToolTip(store),
    }));
  const router = useRouter();
  const currentPath = router.asPath;
  const repoDomain = new URL(apiEndpoint).hostname.replace(".cdn", "");
  const repoAddress = apiEndpoint.replace(".cdn.", ".").replace("/api/v2", "");
  const latestVersion =
    changelog.sliceMachine.versions.length > 0
      ? changelog.sliceMachine.versions[0]
      : null;
  const { setUpdatesViewed, setSeenTutorialsToolTip } =
    useSliceMachineActions();

  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const href = event.currentTarget.getAttribute("href");
    if (href !== null && href) void router.push(href);
  };

  const handleChangeLogNavigationFromUpdateBox = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    setUpdatesViewed({
      latest: latestVersion && latestVersion.versionNumber,
      latestNonBreaking: changelog.sliceMachine.latestNonBreakingVersion,
    });
    handleNavigation(event);
  };

  return (
    <SideNav>
      <SideNavLogo />

      <SideNavRepository
        repositoryName={repoName}
        repositoryDomain={repoDomain}
        href={repoAddress}
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
              currentPath
            )}
            onClick={handleNavigation}
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
              currentPath
            )}
            onClick={handleNavigation}
            Icon={CUSTOM_TYPES_CONFIG.custom.Icon}
          />
        </SideNavListItem>

        <SideNavSeparator />

        <ChangesListItem handleNavigation={handleNavigation} />

        <SideNavSeparator />

        <SideNavListItem>
          <SideNavLink
            title="Slices"
            href="/slices"
            Icon={FolderIcon}
            active={currentPath.startsWith("/slices")}
            onClick={handleNavigation}
          />
        </SideNavListItem>
      </SideNavList>

      {(changelog.sliceMachine.updateAvailable ||
        changelog.adapter.updateAvailable) && (
        <UpdateInfo
          href="/changelog"
          onClick={handleChangeLogNavigationFromUpdateBox}
        />
      )}

      <SideNavList position="bottom">
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
            active={currentPath.startsWith("/changelog")}
            onClick={handleNavigation}
            RightElement={
              <RightElement>
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
