import { type FC } from "react";
import { BaseStyles } from "theme-ui";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import VideoItem from "@components/AppLayout/Navigation/VideoItem";
import { useNetwork } from "@src/hooks/useNetwork";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { LightningIcon } from "@src/icons/Lightning";
import { RadarIcon } from "@src/icons/RadarIcon";
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

const Navigation: FC = () => {
  const { changelog, repoName, apiEndpoint, hasSeenTutorialsToolTip } =
    useSelector((store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      repoName: getRepoName(store),
      apiEndpoint: getApiEndpoint(store),
      hasSeenTutorialsToolTip: userHasSeenTutorialsToolTip(store),
    }));
  const isOnline = useNetwork();
  const { unSyncedSlices, unSyncedCustomTypes } = useUnSyncChanges();
  const router = useRouter();
  const currentPath = router.asPath;
  const repoDomain = new URL(apiEndpoint).hostname.replace(".cdn", "");
  const repoAddress = apiEndpoint.replace(".cdn.", ".").replace("/api/v2", "");
  const latestVersion =
    changelog.versions.length > 0 ? changelog.versions[0] : null;
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;
  const formattedNumberOfChanges = numberOfChanges > 9 ? "+9" : numberOfChanges;
  const displayNumberOfChanges = numberOfChanges !== 0 && isOnline;
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
      latestNonBreaking: changelog.latestNonBreakingVersion,
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
            title="Page types"
            href="/"
            active={
              currentPath === "/" || currentPath.startsWith("/page-types")
            }
            onClick={handleNavigation}
            Icon={CUSTOM_TYPES_CONFIG.page.Icon}
          />
        </SideNavListItem>

        <SideNavListItem>
          <SideNavLink
            title="Custom types"
            href="/custom-types"
            active={currentPath.startsWith("/custom-types")}
            onClick={handleNavigation}
            Icon={CUSTOM_TYPES_CONFIG.custom.Icon}
          />
        </SideNavListItem>

        <SideNavSeparator />

        <SideNavListItem>
          <SideNavLink
            title="Changes"
            href="/changes"
            active={currentPath.startsWith("/changes")}
            onClick={handleNavigation}
            Icon={RadarIcon}
            RightElement={
              displayNumberOfChanges && (
                <RightElement type="pill" data-cy="changes-number">
                  {formattedNumberOfChanges}
                </RightElement>
              )
            }
          />
        </SideNavListItem>

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

      {changelog.updateAvailable && (
        <UpdateInfo
          href="/changelog"
          onClick={handleChangeLogNavigationFromUpdateBox}
        />
      )}

      <SideNavList position="bottom">
        <BaseStyles>
          <VideoItem
            hasSeenTutorialsToolTip={hasSeenTutorialsToolTip}
            onClose={setSeenTutorialsToolTip}
          />
        </BaseStyles>

        <SideNavListItem>
          <SideNavLink
            title="Changelog"
            href="/changelog"
            Icon={(props) => <LightningIcon {...props} />}
            active={currentPath.startsWith("/changelog")}
            onClick={handleNavigation}
            RightElement={
              <RightElement>v{changelog.currentVersion}</RightElement>
            }
          />
        </SideNavListItem>
      </SideNavList>
    </SideNav>
  );
};

export default Navigation;
