import type { Meta, StoryObj } from "@storybook/react";

import { LightningIcon } from "@/icons/Lightning";
import { RadarIcon } from "@/icons/RadarIcon";

import { PageLayout, PageLayoutPane } from "../PageLayout";
import {
  RightElement,
  SideNav,
  SideNavCta,
  SideNavList,
  SideNavListItem,
  SideNavListTitle,
  SideNavRepository,
  SideNavSeparator,
  UpdateInfo,
} from "./SideNav";
import { SideNavEnvironmentSelector } from "./SideNavEnvironmentSelector";

type Story = StoryObj<typeof meta>;

const meta = {
  component: SideNav,
  argTypes: { children: { control: { disable: true } } },
  decorators: [
    (Story) => (
      <PageLayout>
        <PageLayoutPane>
          <Story />
        </PageLayoutPane>
      </PageLayout>
    ),
  ],
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
        <SideNavEnvironmentSelector
          environments={[
            {
              name: "Production",
              domain: "example-prismic-repo",
              kind: "prod",
              users: [{ id: "id" }],
            },
            {
              name: "Staging",
              domain: "example-prismic-repo-staging",
              kind: "stage",
              users: [{ id: "id" }],
            },
            {
              name: "Development",
              domain: "example-prismic-repo-development",
              kind: "dev",
              users: [{ id: "id" }],
            },
          ]}
          activeEnvironment={{
            name: "Production",
            domain: "example-prismic-repo",
            kind: "prod",
            users: [{ id: "id" }],
          }}
        />

        <SideNavRepository
          repositoryName="really long repository name"
          repositoryDomain="really-long-repository-name.primsic.io"
          href="https://foo.prismic.io"
        />

        <SideNavList>
          <SideNavListItem>
            <SideNavCta title="Active" href="/active" active Icon={RadarIcon} />
          </SideNavListItem>

          <SideNavListItem>
            <SideNavCta
              title="Not active"
              href="/not-active"
              Icon={RadarIcon}
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavCta
              title="Changes active"
              href="/changes-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">4</RightElement>}
              active
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavCta
              title="Changes not active"
              href="/changes-not-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">4</RightElement>}
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavCta
              title="Changes active"
              href="/changes-active"
              Icon={RadarIcon}
              RightElement={<RightElement type="pill">+9</RightElement>}
              active
            />
          </SideNavListItem>

          <SideNavSeparator />

          <SideNavListItem>
            <SideNavCta
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
            <SideNavCta title="Slices" href="/slices" Icon={RadarIcon} />
          </SideNavListItem>
        </SideNavList>

        <UpdateInfo href="/" />

        <SideNavList position="bottom">
          <SideNavListItem>
            <SideNavCta
              title="Changelog"
              href="/changelog"
              Icon={LightningIcon}
              RightElement={<RightElement>v1.0.0</RightElement>}
            />
          </SideNavListItem>
        </SideNavList>
      </>
    ),
  },
} satisfies Story;
