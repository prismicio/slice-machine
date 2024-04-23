import { ErrorBoundary as EditorUiErrorBoundary } from "@prismicio/editor-ui";
import {
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import {
  type ComponentPropsWithoutRef,
  type FC,
  useCallback,
  useRef,
} from "react";

import { useAuthStatus } from "@/hooks/useAuthStatus";

type ErrorBoundaryProps = Pick<
  // TODO(DT-1979): Export the `ErrorBoundaryProps` type from `@prismicio/editor-ui`.
  ComponentPropsWithoutRef<typeof EditorUiErrorBoundary>,
  "children" | "renderError"
>;

export const ErrorBoundary: FC<ErrorBoundaryProps> = (props) => {
  const errorRef = useRef<unknown>();
  const authStatus = useAuthStatus();
  return (
    <EditorUiErrorBoundary
      {...props}
      onError={(error) => {
        errorRef.current = error;
      }}
      ref={useCallback(
        (errorBoundary: EditorUiErrorBoundary | null) => {
          if (errorBoundary === null) return;
          const error = errorRef.current;
          if (isUnauthenticatedError(error) || isUnauthorizedError(error)) {
            errorRef.current = undefined;
            errorBoundary.reset();
          }
        },
        /* eslint-disable-next-line react-hooks/exhaustive-deps --
         * Whenever `authStatus` changes, we want to `reset` the `errorBoundary`
         * if an authentication or authorization error has been caught.
         **/
        [authStatus],
      )}
    />
  );
};
