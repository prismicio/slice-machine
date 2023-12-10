# E2E Playwright tests

## Setup

- Run install script

_Install browsers and OS dependencies for Playwright._

```bash
yarn test:e2e:install
```

- Create a `.env.local` file

Copy-paste `playwright/.env.local.example` in `playwright/.env.local` and update `EMAIL` and `PASSWORD` values.

Having both Wroom and Prismic values will help you run Slice Machine in dev or prod mode without having to take care of the correct email or password.
Wroom or Prismic values will be used depending on the Prismic URL.

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

```bash
npx playwright show-report name-of-my-extracted-playwright-report
```

## Creating tests

### `test.run()`

Use `test.run()` to create a test. `run` function take an optional object parameter `options` that let you configure how you want to run the test.
You can configure if you want a logged in test and also an onboarded test.
Default is not logged in and onboarded.

Example for a logged in user not onboarded:

```ts
test.run({ loggedIn: true, onboarded: false })("I can ...", 
  async ({ sliceBuilderPage, slicesListPage }) => {
    // Test content
  });
```

Warning: Only use `loggedIn: true` when it's necessary for your test, it increases local test time (not in CI) by some seconds (≃ 3 secs).

### Mocking with `mockManagerProcedures`

Use `mockManagerProcedures` function when you need to mock a manager procedure response.
With the way playwright intercept requests you need to give an array of procedures to mock. 
You will have the possibility to return fake data on top of the existing one.
If you don't need to return data and / or let the manager execute the procedure at all, you can disable it with `execute` property, it will return an empty object to the UI.

Example:
```ts
await mockManagerProcedures({
  page: changesPage.page,
  procedures: [
    {
      path: "getState",
      data: (data) => ({
        ...data,
        libraries: emptyLibraries,
        customTypes: [],
        remoteCustomTypes: [],
        remoteSlices: [],
      }),
    },
    {
      path: "prismicRepository.pushChanges",
      execute: false,
    },
  ],
});
```

Warning: Only mock when it's necessary because the state of Slice Machine or the remote repository can change. 
We want to ensure test can be launched on any state of Slice Machine and any state of repository. Mocking will help you do that.
In theory, we want to avoid mocking while doing e2e tests. Smoke tests don't have any mocking but standalone tests can when it's necessary. It improves the DX and reduce the necessary setup that we can have for Smoke tests.

## Best practices

1. Always use the "Page Object Model" for Locators

In the context of web development and testing, the Page Object Model (POM) is a design pattern that encourages abstraction of web pages and components. This means that each web page or component should be represented as a class, and the various elements on the page or component should be defined as methods within this class.
These classes should be written in the "pages" folder.

This approach has several benefits:

- Maintainability: By encapsulating the page structure and possible interactions with a page or component in one place, any changes to the page or component only need to be made once.
- Readability: Tests become more readable and easier to understand.
- Reusability: You can reuse code across different test cases.

**Warning**: Never use a locator directly in a test file (getBy...). Always use the Page Object Model design pattern for that.
 
2. Always try to do an exact matching with locators

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

3. Don't use `.locator()`

Out goal is to prevent testing implementation details such as:

```ts
this.appVersion = this.menu.locator(
  'a[href="/changelog"] > div:nth-child(2)',
);
```

Instead, for example you can use `getByTestId`:

```ts
this.appVersion = this.menu.getByTestId("slicemachine-version");
```

4. Ensure tests don't depend on a specific state of Slice Machine  

Our e2e tests should not break whatever the current state of Slice Machine is. Having existing data or not, staging or production, etc.

5. Always create tests from the user perspective

When creating tests it's important to test what users can see and do.
Start the test name with "I" so you prevent yourself testing implementation details.

Example:

```ts
test.run()("I can create a slice", async () => {
  // Test content
});
```

6. Write your own best practice for the team here...

## Useful links

- [Official documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [VS Code extension](https://playwright.dev/docs/getting-started-vscode)
- [Test configuration](https://playwright.dev/docs/api/class-testconfig)
