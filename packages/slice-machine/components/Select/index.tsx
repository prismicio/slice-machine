// This component is a shim for `react-select`.
//
// The shim will only be included when NODE_ENV === "test". It will be removed
// in production and development builds.
//
// Reason for the shim: `react-select`'s CJS bundle is transpiled using Babel
// and uses the `exports.default` syntax to define its default export. Rollup,
// used by Vitest, treats `exports.default` as a named export called "default".
// SWC, used by Next.js, treats it as a native default export.
//
// We do not have much control over how modules are handled internally, so we
// must adapt around this behavior.

import _Select from "react-select";

let Select = _Select;

if (process.env.NODE_ENV === "test") {
  if (!("default" in _Select)) {
    throw new Error(
      "The <Select> component detected the test environment, hosted by Vitest. Vitest requires using `react-select`'s `default` named export (different from its default export). The `default` named export was not found, however. We are halting as a result."
    );
  }

  // `react-select` has default and named exports. It does not exist normally.
  // @ts-expect-error TS(2339) FIXME: Property 'default' does not exist on type 'StateMa... Remove this comment to see the full error message
  Select = _Select.default;
}

export default Select;
