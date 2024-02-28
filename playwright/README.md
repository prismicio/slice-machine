# E2E Playwright tests

## Setup

- Run install script

_Install browsers and OS dependencies for Playwright._

```bash
yarn test:e2e:install
```

- Install the VS Code extension (optional)

Playwright Test extension was created specifically to accommodate the needs of e2e testing. [Install Playwright Test for VSCode by reading this page](https://playwright.dev/docs/getting-started-vscode). It will help you to debug a problem in tests if needed.

## How to run tests

- Run all tests

_You can run your tests with the playwright test command. Tests run in headless mode by default meaning no browser window will be opened while running the tests and results will be seen in the terminal._

```bash
yarn test:e2e
```

- Run tests in ui mode

_It's highly recommended to run your tests with UI Mode for a better developer experience where you can easily walk through each step of the test and visually see what was happening before, during, and after each step. UI mode also comes with many other features such as the locator picker, watch mode and more._

```bash
yarn test:e2e --ui
```

- Run a single test

_To run a single test file pass in the name of the test file that you want to run._

```bash
yarn test:e2e playwright/tests/slices/slices.spec.ts
```

- Run a single test in headed mode

_To run your tests in headed mode use the `--headed` flag. It's slower but this will give you the ability to visually see, how Playwright interacts with the website._

```bash
yarn test:e2e playwright/tests/slices/slices.spec.ts --headed
```

See other examples on the [official documentation](https://playwright.dev/docs/running-tests).

## Test reports

The HTML Reporter shows you a full report of your tests allowing you to filter the report by browsers,
passed tests, failed tests, skipped tests and flaky tests.

To open the local test report:

```bash
yarn test:e2e:report
```

To open a downloaded CI test report from anywhere in your computer:

- Copy-paste the content of the download report in a `playwright-report` folder within `playwright` folder
- Execute the same command as above

## Creating tests

### `test()`

Use `test()` to create a test. Optionally call `test.use()` to specify options to use in a single test file or a `test.describe()` group.
With `test.use()`, you can configure if you want an onboarded test. Default is onboarded.

Example for user not onboarded:

```ts
test.use({ loggedIn: true, onboarded: false });

test("I can ...", async ({ sliceBuilderPage, slicesListPage }) => {
  // Test content
});
```

You can also override default storage values:

Example (redux):
```ts
test.use({
  onboarded: false,
  reduxStorage: {
    lastSyncChange: new Date().getTime(),
  },
});

test("I can ...", async ({ sliceBuilderPage, slicesListPage }) => {
  // Test content
});
```

Example (new way):
```ts
test.use({
  onboarded: false,
  storage: {
    isInAppGuideOpen: true,
  },
});

test("I can ...", async ({ sliceBuilderPage, slicesListPage }) => {
  // Test content
});
```

### Mocking with `procedures.mock`

Use the `procedures` fixture to mock manager procedure responses:

```ts
test("I can ...", async ({ procedures }) => {
  await procedures.mock("getState", ({ data }) => {
    return {
      ...data,
      customTypes: [],
    };
  });
});
```

`data` contains the unmocked procedure's response. You can use it in your mocked response.

If you don't need the unmocked procedure's data or don't want the manager to execute the procedure at all, you can disable the unmocked procedure with the `execute` option:

```ts
test(
  "I can ...",
  async ({ procedures }) => {
    await procedures.mock("project.checkIsTypeScript", () => false);
  },
  { execute: false },
);
```

If you only want the procedure to be mocked a set number of times, set the `times` option to the number of times you want it to be mocked:

```ts
test("I can ...", async ({ procedures }) => {
  await procedures.mock(
    "getState",
    ({ data }) => {
      return {
        ...data,
        customTypes: [],
      };
    },
    { times: 1 },
  );
});
```

You may stack `procedure.mock` calls as many times and anywhere you want. The most recent mock for a procedure will be used first.

```ts
test("I can ...", async ({ procedures }) => {
  await procedures.mock("project.checkIsTypeScript", () => false);
  // `project.checkIsTypeScript` will return `false`

  // Perform actions...

  await procedures.mock("project.checkIsTypeScript", () => true);
  // `project.checkIsTypeScript` will now return `true`
});
```

> [!CAUTION]
> Only mock when it's necessary because the state of Slice Machine or the remote repository can change.
>
> We want to ensure tests can be launched on any state of Slice Machine and any state of repository. Mocking will help you do that.
>
> In theory, we want to avoid mocking while doing e2e tests. Smoke tests don't have any mocking but standalone tests can when it's necessary. It improves the DX and reduce the necessary setup that we can have for Smoke tests.

## Best practices

### Always use the "Page Object Model" for Locators

In the context of web development and testing, the Page Object Model (POM) is a design pattern that encourages abstraction of web pages and components. This means that each web page or component should be represented as a class, and the various elements on the page or component should be defined as methods within this class.
These classes should be written in the "pages" folder.

This approach has several benefits:

- Maintainability: By encapsulating the page structure and possible interactions with a page or component in one place, any changes to the page or component only need to be made once.
- Readability: Tests become more readable and easier to understand.
- Reusability: You can reuse code across different test cases.

> [!WARNING]
> Never use a locator directly in a test file (getBy...). Always use the Page Object Model design pattern for that.

### Always try to do an exact matching with locators

In order to be sure of what you are targeting, always use the `exact` option when possible.
Use `true` when you want an exact matching.

Examples:

```ts
this.customTypesLink = this.menu.getByRole("link", {
  name: "Custom types",
  exact: true,
});
```

```ts
this.customTypesLink = this.menu.getByText("Custom types", {
  exact: true,
});
```

Use `false` when you deliberately don't want an exact matching.

Examples:

```ts
this.customTypesLink = this.menu.getByRole("link", {
  name: "Custom types",
  exact: false,
});
```

```ts
this.customTypesLink = this.menu.getByText("Custom types", {
  exact: false,
});
```

### Prefer using `.toBeVisible()` when testing the presence of elements

`.toBeVisible()` ensures the element is present and visible to users. Explicitly checking for visibility prevents a false-positive test where the element is in the DOM, but cannot be seen or interacted by the user.

If the element is purposely hidden, use `.not.toBeVisible()`.

### Don't use `.locator()`

Out goal is to prevent testing implementation details such as:

```ts
this.appVersion = this.menu.locator('a[href="/changelog"] > div:nth-child(2)');
```

Instead, for example you can use `getByTestId`:

```ts
this.appVersion = this.menu.getByTestId("slicemachine-version");
```

### Ensure tests don't depend on a specific state of Slice Machine

Our e2e tests should not break whatever the current state of Slice Machine is. Having existing data or not, staging or production, etc.

### Always create tests from the user perspective

When creating tests it's important to test what users can see and do.
Start the test name with "I" so you prevent yourself testing implementation details.

Example:

```ts
test("I can create a slice", async () => {
  // Test content
});
```

### Always check that at least one locator is visible before checking if another locator is not visible

Directly checking that a locator is not visible is not correct if the page is currently loading. The loading blank page will not contain your locator and it will always pass.

Example (bad):

```ts
test("I cannot see the updates available warning", async ({
  pageTypesTablePage,
}) => {
  await pageTypesTablePage.goto();
  await expect(pageTypesTablePage.menu.updatesAvailableTitle).not.toBeVisible();
});
```

Example (good):

```ts
test("I cannot see the updates available warning", async ({
  pageTypesTablePage,
}) => {
  await pageTypesTablePage.goto();
  await expect(pageTypesTablePage.menu.appVersion).toBeVisible();
  await expect(pageTypesTablePage.menu.updatesAvailableTitle).not.toBeVisible();
});
```

> [!NOTE]
> Include the check within the goto function so you don't need to do it manually every time.

### Write your own best practice for the team here...

## Useful links

- [Official documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [VS Code extension](https://playwright.dev/docs/getting-started-vscode)
- [Test configuration](https://playwright.dev/docs/api/class-testconfig)
