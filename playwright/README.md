# E2E Playwright tests

## Setup

- Run install script

_Install browsers and OS dependencies for Playwright._

```bash
yarn test:e2e:install
```

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

## Best practices

1. Always use the "Page Object Model" for Locators

In the context of web development and testing, the Page Object Model (POM) is a design pattern that encourages abstraction of web pages and components. This means that each web page or component should be represented as a class, and the various elements on the page or component should be defined as methods within this class.
These classes should be written in the "pages" folder.

This approach has several benefits:

- Maintainability: By encapsulating the page structure and possible interactions with a page or component in one place, any changes to the page or component only need to be made once.
- Readability: Tests become more readable and easier to understand.
- Reusability: You can reuse code across different test cases.

**Warning**: Never use a locator directly in a test file. Always use the Page Object Model design pattern for that.
 
2. Always try to do an exact matching with locators

In order to be sure of what you are targeting, always use the `exact` option when possible.

Example:

```ts
this.customTypesLink = this.menu.getByRole("link", {
  name: "Custom types",
  exact: true,
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

5. Write your own best practice for the team here...

## Useful links

- [Official documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [VS Code extension](https://playwright.dev/docs/getting-started-vscode)
- [Test configuration](https://playwright.dev/docs/api/class-testconfig)
