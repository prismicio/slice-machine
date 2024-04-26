import {
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  ProgressCircle,
  Text,
  Tooltip,
  useMediaQuery,
} from "@prismicio/editor-ui";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { Environment } from "@slicemachine/manager/client";
import { clsx } from "clsx";
import type { FC, ReactNode } from "react";

import { LoginIcon } from "@/icons/LoginIcon";
import { LogoIcon } from "@/icons/LogoIcon";

import styles from "./SideNavEnvironmentSelector.module.css";

type SideNavEnvironmentSelectorProps = {
  activeEnvironment?: Environment;
  disabled?: boolean;
  environments?: Environment[];
  loading?: boolean;
  variant?: "default" | "offline" | "unauthorized" | "unauthenticated";
  onLogInClick?: () => void;
  onSelect?: (environment: Environment) => void | Promise<void>;
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const {
    activeEnvironment,
    disabled = false,
    environments = [],
    loading = false,
    variant = "default",
    onLogInClick,
    onSelect,
  } = props;

  const collapsed = useMediaQuery({ max: "medium" });

  const isProductionEnvironmentActive = activeEnvironment?.kind === "prod";

  return (
    <Box alignItems="center" gap={16}>
      <Box position="relative">
        {collapsed && environments.length > 1 ? (
          <EnvironmentDropdownMenu
            activeEnvironment={activeEnvironment}
            disabled={disabled || loading}
            environments={environments}
            onSelect={onSelect}
            trigger={<LogoIcon className={styles.logo} />}
          />
        ) : (
          <LogoIcon className={styles.logo} />
        )}
        {environments.length > 1 && (
          <EnvironmentDot
            kind={activeEnvironment?.kind ?? "prod"}
            asStatus={true}
            className={styles.activeEnvironmentDot}
            data-testid="active-environment-dot"
          />
        )}
      </Box>
      {!collapsed && (
        <>
          <Box
            flexGrow={1}
            flexDirection="column"
            overflow="hidden"
            alignItems="flex-start"
          >
            {variant === "default" ? (
              <Text component="span" variant="small" color="grey11">
                Environment
              </Text>
            ) : undefined}

            {variant === "unauthenticated" ? (
              <Button invisible onClick={onLogInClick}>
                Login required
              </Button>
            ) : undefined}

            {variant === "offline" ? (
              <Text component="span" variant="bold">
                Offline
              </Text>
            ) : undefined}

            {variant === "default" ? (
              <Text
                component="span"
                className={styles.activeEnvironmentName}
                data-testid="active-environment-name"
              >
                {isProductionEnvironmentActive ||
                activeEnvironment === undefined
                  ? "Production"
                  : activeEnvironment?.name}
              </Text>
            ) : undefined}
          </Box>
          <Box flexShrink={0}>
            {variant === "unauthenticated" ? (
              <Tooltip content="Log in" side="right">
                <IconButton
                  icon={<LoginIcon className={styles.loginIcon} />}
                  onClick={onLogInClick}
                  hiddenLabel="Log in to enable environments"
                />
              </Tooltip>
            ) : undefined}

            {environments.length > 1 ? (
              <EnvironmentDropdownMenu
                activeEnvironment={activeEnvironment}
                disabled={disabled}
                environments={environments}
                onSelect={onSelect}
                trigger={
                  <IconButton
                    icon={loading ? <ProgressCircle /> : "unfoldMore"}
                    hiddenLabel="Select environment"
                  />
                }
              />
            ) : undefined}
          </Box>
        </>
      )}
    </Box>
  );
};

type EnvironmentDropdownMenuProps = Pick<
  SideNavEnvironmentSelectorProps,
  "activeEnvironment" | "onSelect"
> & {
  disabled: boolean;
  environments: Environment[];
  trigger: ReactNode;
};

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const { activeEnvironment, disabled, environments, onSelect, trigger } =
    props;

  const nonPersonalEnvironments = environments.filter(
    (environment) => environment.kind !== "dev",
  );
  const personalEnvironment = environments.find(
    (environment) => environment.kind === "dev",
  );

  return (
    <DropdownMenu modal>
      <Tooltip
        content="Select environment"
        side="right"
        stableMount
        visible={!disabled}
      >
        <DropdownMenuTrigger disabled={disabled}>{trigger}</DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" minWidth={256}>
        {personalEnvironment ? (
          <DropdownMenuLabel>Regular Environments</DropdownMenuLabel>
        ) : undefined}
        {nonPersonalEnvironments.map((environment) => (
          <EnvironmentDropdownMenuItem
            key={environment.domain}
            environment={environment}
            onSelect={onSelect}
            isActive={environment.domain === activeEnvironment?.domain}
          />
        ))}

        {personalEnvironment ? (
          <>
            <DropdownMenuLabel>Personal Environment</DropdownMenuLabel>
            <EnvironmentDropdownMenuItem
              key={personalEnvironment.domain}
              environment={personalEnvironment}
              onSelect={onSelect}
              isActive={
                personalEnvironment.domain === activeEnvironment?.domain
              }
            />
          </>
        ) : undefined}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type EnvironmentDropdownMenuItemProps = {
  environment: Environment;
  isActive?: boolean;
} & Pick<SideNavEnvironmentSelectorProps, "onSelect">;

const EnvironmentDropdownMenuItem: FC<EnvironmentDropdownMenuItemProps> = (
  props,
) => {
  const { environment, onSelect, isActive } = props;
  const isProductionEnvironment = environment.kind === "prod";

  return (
    <DropdownMenuItem
      startIcon={
        <EnvironmentDot
          kind={environment.kind}
          className={styles.menuItemEnvironmentDot}
        />
      }
      endIcon={Boolean(isActive) ? <Icon name="check" /> : undefined}
      onSelect={() => void onSelect?.(environment)}
    >
      {isProductionEnvironment ? "Production" : environment.name}
    </DropdownMenuItem>
  );
};

const humanReadableKindMap = {
  prod: "Production",
  stage: "Staging",
  dev: "Development",
} as const;

type EnvironmentDotProps = {
  kind: Environment["kind"];
  asStatus?: boolean;
  className?: string;
};

const EnvironmentDot: FC<EnvironmentDotProps> = (props) => {
  const { kind, asStatus = false, className, ...otherProps } = props;

  const humanReadableKind = humanReadableKindMap[kind];

  return (
    <div
      className={clsx(styles[`environmentDot-${kind}`], className)}
      role={asStatus ? "status" : undefined}
      {...otherProps}
    >
      {asStatus ? (
        <VisuallyHidden.Root>
          {humanReadableKind} environment
        </VisuallyHidden.Root>
      ) : null}
    </div>
  );
};
