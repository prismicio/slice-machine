import {
  Box,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  Text,
} from "@prismicio/editor-ui";
import { Environment } from "@slicemachine/manager/client";
import type { FC } from "react";
import clsx from "clsx";

import LogoIcon from "@src/icons/LogoIcon";

import * as styles from "./SideNavEnvironmentSelector.css";

type SideNavEnvironmentSelectorProps = {
  variant?: "default" | "unauthorized";
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
        {activeEnvironment !== undefined && (
          <EnvironmentDot
            kind={activeEnvironment.kind}
            className={styles.activeEnvironmentDot}
          />
        )}
      </Box>
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        <Text component="span" variant="small" color="grey11">
          Environment
        </Text>
        {variant === "unauthorized" ? (
          <Text component="span" className={styles.actionRequiredLabel}>
            Login required
          </Text>
        ) : activeEnvironment === undefined ? (
          <Text component="span" className={styles.actionRequiredLabel}>
            Select environment
          </Text>
        ) : (
          <Text component="span" className={styles.activeEnvironmentName}>
            {isProductionEnvironmentActive
              ? "Production"
              : activeEnvironment?.name}
          </Text>
        )}
      </Box>
      <Box flexShrink={0}>
        {variant === "unauthorized" ? (
          <IconButton icon="arrowForward" onClick={onLogInClick} />
        ) : (
          <EnvironmentDropdownMenu
            environments={environments}
            activeEnvironment={activeEnvironment}
            onSelect={onSelect}
          />
        )}
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
      <DropdownMenuTrigger>
        <IconButton icon="unfoldMore" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Regular Environments</DropdownMenuLabel>
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

type EnvironmentDotProps = {
  kind: Environment["kind"];
  className?: string;
};

const EnvironmentDot: FC<EnvironmentDotProps> = (props) => {
  const { kind, className } = props;

  return <div className={clsx(styles.environmentDot[kind], className)} />;
};
