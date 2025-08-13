import {
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  ErrorBoundary as EditorUiErrorBoundary,
  Text,
} from "@prismicio/editor-ui";
import {
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import {
  type ComponentPropsWithoutRef,
  type FC,
  PropsWithChildren,
  useCallback,
  useRef,
} from "react";

import { ReloadLogoutButton } from "@/features/auth/LogoutButton";
import { useAuthStatus } from "@/hooks/useAuthStatus";

type DefaultErrorBoundaryProps = Pick<
  // TODO(DT-1979): Export the `ErrorBoundaryProps` type from `@prismicio/editor-ui`.
  ComponentPropsWithoutRef<typeof EditorUiErrorBoundary>,
  "children" | "renderError"
>;

export const DefaultErrorBoundary: FC<DefaultErrorBoundaryProps> = (props) => {
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

export function AppStateErrorBoundary(props: PropsWithChildren) {
  return (
    <EditorUiErrorBoundary
      renderError={(error) => {
        return (
          <Box
            position="absolute"
            top={64}
            width="100%"
            justifyContent="center"
            flexDirection="column"
          >
            <BlankSlate>
              <BlankSlateIcon
                lineColor="tomato11"
                backgroundColor="tomato3"
                name="alert"
              />
              <BlankSlateTitle>Failed to load Slice Machine</BlankSlateTitle>
              <RenderErrorDescription error={error} />
            </BlankSlate>
          </Box>
        );
      }}
    >
      {props.children}
    </EditorUiErrorBoundary>
  );
}

function RenderErrorDescription(args: { error: unknown }) {
  const { error } = args;

  if (isUnauthorizedError(error)) {
    return (
      <Box flexDirection="column" gap={16} margin={{ top: 8 }}>
        <Box flexDirection="column" gap={8} alignItems="center">
          <Text variant="h3" align="center">
            It seems like you don't have access to this repository
          </Text>
          <Text align="center">
            Check that the repository name is correct, then contact your
            repository administrator.
          </Text>
        </Box>
        <ReloadLogoutButton sx={{ alignSelf: "center" }} />
      </Box>
    );
  }

  return <BlankSlateDescription>{JSON.stringify(error)}</BlankSlateDescription>;
}
