import {
  Box,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  InvisibleButton,
  Text,
} from "@prismicio/editor-ui";
import { Environment } from "@slicemachine/manager/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { FC } from "react";
import clsx from "clsx";

import LogoIcon from "@src/icons/LogoIcon";

import * as styles from "./SideNavEnvironmentSelector.css";
import { LoginIcon } from "@src/icons/LoginIcon";

type SideNavEnvironmentSelectorProps = {
  variant?: "default" | "offline" | "unauthorized" | "unauthenticated";
  environments?: Environment[];
  activeEnvironment?: Environment;
  onSelect?: (environment: Environment) => void | Promise<void>;
  onLogInClick?: () => void;
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const {
    variant = "default",
    environments = [],
    activeEnvironment,
    onSelect,
    onLogInClick,
  } = props;

  const isProductionEnvironmentActive = activeEnvironment?.kind === "prod";

  return (
    <Box alignItems="center" gap={16}>
      <Box position="relative">
        <LogoIcon className={styles.logo} />
        {environments.length > 1 && (
          <EnvironmentDot
            kind={activeEnvironment?.kind ?? "prod"}
            asStatus={true}
            className={styles.activeEnvironmentDot}
          />
        )}
      </Box>
      <Box
        flexGrow={1}
        flexDirection="column"
        overflow="hidden"
        alignItems="flex-start"
      >
        {variant === "default" || variant === "unauthenticated" ? (
          <Text component="span" variant="small" color="grey11">
            Environment
          </Text>
        ) : undefined}

        {variant === "unauthenticated" ? (
          <InvisibleButton buttonText="Login required" onClick={onLogInClick} />
        ) : undefined}

        {variant === "default" ? (
          <Text
            component="span"
            className={styles.activeEnvironmentName}
            data-cy="active-environment-name"
          >
            {isProductionEnvironmentActive || activeEnvironment === undefined
              ? "Production"
              : activeEnvironment?.name}
          </Text>
        ) : undefined}
      </Box>
      <Box flexShrink={0}>
        {variant === "unauthenticated" ? (
          <IconButton
            icon={<LoginIcon className={styles.loginIcon} />}
            onClick={onLogInClick}
            data-cy="environment-login-icon-button"
          />
        ) : undefined}

        {environments.length > 1 ? (
          <EnvironmentDropdownMenu
            environments={environments}
            activeEnvironment={activeEnvironment}
            onSelect={onSelect}
          />
        ) : undefined}
      </Box>
    </Box>
  );
};

type EnvironmentDropdownMenuProps = Pick<
  SideNavEnvironmentSelectorProps,
  "environments" | "activeEnvironment" | "onSelect"
>;

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const { environments = [], activeEnvironment, onSelect } = props;

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger disabled={environments.length < 2}>
        <IconButton icon="unfoldMore" data-cy="environment-dropdown-button" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" minWidth={256}>
        {/*
          TODO: Add this line when Dev envs are supported
          <DropdownMenuLabel>Regular Environments</DropdownMenuLabel>
        */}
        {environments.map((environment) =>
          environment.kind !== "dev" ? (
            <EnvironmentDropdownMenuItem
              key={environment.domain}
              environment={environment}
              onSelect={onSelect}
              isActive={environment.domain === activeEnvironment?.domain}
            />
          ) : (
            <>
              <DropdownMenuLabel>Personal Environment</DropdownMenuLabel>
              <EnvironmentDropdownMenuItem
                key={environment.domain}
                environment={environment}
                onSelect={onSelect}
                isActive={environment.domain === activeEnvironment?.domain}
              />
            </>
          ),
        )}
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
  const { kind, asStatus = false, className } = props;

  const humanReadableKind = humanReadableKindMap[kind];

  return (
    <div
      className={clsx(styles.environmentDot[kind], className)}
      role={asStatus ? "status" : undefined}
    >
      {asStatus ? (
        <VisuallyHidden.Root>
          {humanReadableKind} environment
        </VisuallyHidden.Root>
      ) : null}
    </div>
  );
};
