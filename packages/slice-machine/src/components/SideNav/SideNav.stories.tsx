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
  SideNavListTitle,
  UpdateInfo,
  SideNavRepository,
  RightElement,
} from "./SideNav";

type Story = StoryObj<typeof meta>;

const meta = {
  component: SideNav,
  argTypes: { children: { control: { disable: true } } },
  parameters: {
    docs: { story: { height: 256, inline: false } },
    layout: "fullscreen",
  },
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
              title="Changes active"
              href="/changes-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">4</RightElement>}
              active
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavLink
              title="Changes not active"
              href="/changes-not-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">4</RightElement>}
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavLink
              title="Changes active"
              href="/changes-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">+9</RightElement>}
              active
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavLink
              title="Changes not active"
              href="/changes-not-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">+9</RightElement>}
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
              RightElement={<RightElement>v1.0.0</RightElement>}
            />
          </SideNavListItem>
        </SideNavList>
      </>
    ),
    style: { minHeight: "100vh", width: "320px" },
  },
} satisfies Story;
