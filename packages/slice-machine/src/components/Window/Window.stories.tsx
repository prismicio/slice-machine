import type { Meta, StoryObj } from "@storybook/react";

import {
  Window,
  WindowFrame,
  WindowTabs,
  WindowTabsList,
  WindowTabsTrigger,
  WindowTabsContent,
  WindowFrameDots,
  WindowTabsListContainer,
  AddButton,
} from "./Window";

const meta: Meta<typeof Window> = {
  component: Window,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    children: (
      <>
        <WindowFrame>
          <WindowFrameDots />
        </WindowFrame>
        <WindowTabs defaultValue="main">
          <WindowTabsListContainer>
            <WindowTabsList>
              <WindowTabsTrigger value="main">Main</WindowTabsTrigger>
              <WindowTabsTrigger value="seo">SEO</WindowTabsTrigger>
              <WindowTabsTrigger value="extra">Extra tab</WindowTabsTrigger>
            </WindowTabsList>

            <AddButton />
          </WindowTabsListContainer>

          <WindowTabsContent value="main">Content for Main</WindowTabsContent>
          <WindowTabsContent value="seo">Content for seo</WindowTabsContent>
          <WindowTabsContent value="extra">
            Content for extra tab
          </WindowTabsContent>
        </WindowTabs>
      </>
    ),
  },
};

export const WindowWithOutFrame: Story = {
  args: {
    children: (
      <WindowTabs defaultValue="main">
        <WindowTabsList>
          <WindowTabsTrigger value="main">Main</WindowTabsTrigger>
          <WindowTabsTrigger value="seo">SEO</WindowTabsTrigger>
          <WindowTabsTrigger value="extra">Extra tab</WindowTabsTrigger>
        </WindowTabsList>
        <WindowTabsContent value="main">Content for Main</WindowTabsContent>
        <WindowTabsContent value="seo">Content for seo</WindowTabsContent>
        <WindowTabsContent value="extra">
          Content for extra tab
        </WindowTabsContent>
      </WindowTabs>
    ),
  },
};

export const WindowWithTabsWithLLongNames: Story = {
  args: {
    children: (
      <>
        <WindowFrame>
          <WindowFrameDots />
        </WindowFrame>
        <WindowTabs defaultValue="main">
          <WindowTabsList>
            <WindowTabsTrigger value="main">Main Page</WindowTabsTrigger>
            <WindowTabsTrigger value="seo">SEO and meta data</WindowTabsTrigger>
            <WindowTabsTrigger value="tab1">
              Tab with a long name
            </WindowTabsTrigger>
            <WindowTabsTrigger value="tab2">
              Tab with an even longer name
            </WindowTabsTrigger>
          </WindowTabsList>
          <WindowTabsContent value="main">Content for Main</WindowTabsContent>
          <WindowTabsContent value="seo">Content for seo</WindowTabsContent>

          <WindowTabsContent value="tab1">
            Content for a tab with long name
          </WindowTabsContent>

          <WindowTabsContent value="tab2">
            Content for a tab with an even longer name
          </WindowTabsContent>
        </WindowTabs>
      </>
    ),
  },
};

export const WindowWithLotsOfTabs: Story = {
  args: {
    children: (
      <>
        <WindowFrame>
          <WindowFrameDots />
        </WindowFrame>
        <WindowTabs defaultValue="main">
          <WindowTabsList>
            <WindowTabsTrigger value="main">Main</WindowTabsTrigger>
            <WindowTabsTrigger value="seo">SEO</WindowTabsTrigger>
            <WindowTabsTrigger value="tab1">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab2">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab3">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab4">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab5">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab6">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab7">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab8">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab9">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab10">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab11">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab12">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab13">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab14">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab15">tab</WindowTabsTrigger>
            <WindowTabsTrigger value="tab16">tab</WindowTabsTrigger>
          </WindowTabsList>
          <WindowTabsContent value="main">Content for Main</WindowTabsContent>
          <WindowTabsContent value="seo">Content for seo</WindowTabsContent>

          <WindowTabsContent value="tab1">tab</WindowTabsContent>

          <WindowTabsContent value="tab2">Tab</WindowTabsContent>
          <WindowTabsContent value="tab3">Tab</WindowTabsContent>
          <WindowTabsContent value="tab4">Tab</WindowTabsContent>
          <WindowTabsContent value="tab5">Tab</WindowTabsContent>
          <WindowTabsContent value="tab6">Tab</WindowTabsContent>
          <WindowTabsContent value="tab7">Tab</WindowTabsContent>
          <WindowTabsContent value="tab8">Tab</WindowTabsContent>
          <WindowTabsContent value="tab9">Tab</WindowTabsContent>
          <WindowTabsContent value="tab10">Tab</WindowTabsContent>
          <WindowTabsContent value="tab11">Tab</WindowTabsContent>
          <WindowTabsContent value="tab12">Tab</WindowTabsContent>
          <WindowTabsContent value="tab13">Tab</WindowTabsContent>
          <WindowTabsContent value="tab14">Tab</WindowTabsContent>
          <WindowTabsContent value="tab15">Tab</WindowTabsContent>
          <WindowTabsContent value="tab16">Tab</WindowTabsContent>
        </WindowTabs>
      </>
    ),
  },
};
