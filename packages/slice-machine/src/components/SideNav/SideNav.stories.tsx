import type { Meta, StoryObj } from "@storybook/react";

import { RadarIcon } from "@src/icons/RadarIcon";
import { LightningIcon } from "@src/icons/Lightning";

import {
  SideNav,
  SideNavLogo,
  SideNavList,
  SideNavListItem,
  SideNavLink,
  SideNavSeparator,
  ChangesIndicator,
  SideNavListTitle,
  UpdateInfo,
  SideNavRepository,
} from "./SideNav";

type Story = StoryObj<typeof meta>;

const meta = {
  component: SideNav,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SideNav>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <SideNavLogo />

        <SideNavRepository
          repositoryName="really long repository name"
          repositoryDomain="really-long-repository-name.primsic.io"
          href="https://foo.prismic.io"
        />

        <SideNavList>
          <SideNavListItem>
            <SideNavLink
              title="Active"
              href="/active"
              active
              Icon={RadarIcon}
            />
          </SideNavListItem>

          <SideNavListItem>
            <SideNavLink
              title="Not active"
              href="/not-active"
              Icon={RadarIcon}
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavLink
              title="Right element active"
              href="/right-element-active"
              Icon={RadarIcon}
              RightElement={<ChangesIndicator numberOfChanges={4} />}
              active
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavLink
              title="Right element not active"
              href="/right-element-not-active"
              Icon={RadarIcon}
              RightElement={<ChangesIndicator numberOfChanges={4} />}
            />
          </SideNavListItem>

          <SideNavSeparator />
        </SideNavList>

        <SideNavListTitle>Slice Library</SideNavListTitle>

        <SideNavList>
          <SideNavListItem>
            <SideNavLink title="Slices" href="/slices" Icon={RadarIcon} />
          </SideNavListItem>
        </SideNavList>

        <UpdateInfo href="/" onClick={() => void 0} />

        <SideNavList position="bottom">
          <SideNavListItem>
            <SideNavLink
              title="Changelog"
              href="/changelog"
              Icon={LightningIcon}
              onClick={() => void 0}
            />
          </SideNavListItem>
        </SideNavList>
      </>
    ),
  },
} satisfies Story;
