import { ErrorBoundary as EditorUiErrorBoundary } from "@prismicio/editor-ui";
import {
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import { type ComponentProps, type FC, useCallback, useRef } from "react";

import { useAuthStatus } from "@src/hooks/useAuthStatus";

type ErrorBoundaryProps = Pick<
  EditorUiErrorBoundaryProps,
  "children" | "renderError"
>;
// TODO(DT-1979): Export the `ErrorBoundaryProps` type from `@prismicio/editor-ui`.
type EditorUiErrorBoundaryProps = ComponentProps<typeof EditorUiErrorBoundary>;

export const ErrorBoundary: FC<ErrorBoundaryProps> = (props) => {
  const errorRef = useRef<unknown>();
  const authStatus = useAuthStatus();
  return (
    <EditorUiErrorBoundary
      {...props}
      onError={(error) => {
        if (isUnauthenticatedError(error) || isUnauthorizedError(error)) {
          errorRef.current = error;
        }
      }}
      ref={useCallback(
        (errorBoundary: EditorUiErrorBoundary | null) => {
          if (errorBoundary !== null && errorRef.current !== undefined) {
            errorRef.current = undefined;
            errorBoundary.reset();
          }
        },
        /* eslint-disable-next-line react-hooks/exhaustive-deps --
         * If an authentication or authorization error was caught, we want to
         * `reset` the `errorBoundary` when `authStatus` changes.
         **/
        [authStatus],
      )}
    />
  );
};
