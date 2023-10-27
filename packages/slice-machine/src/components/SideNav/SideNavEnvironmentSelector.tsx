import {
  Box,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import type { FC } from "react";

import LogoIcon from "@src/icons/LogoIcon";

import {
  DropdownMenuGroupContent,
  DropdownMenuGroupItem,
  DropdownMenuGroupLabel,
} from "../DropdownMenuGroup/DropdownMenuGroup";

import * as styles from "./SideNavEnvironmentSelector.css";

type EnvironmentDotProps = {
  type: EnvironmentDropdownMenuItemProps["type"];
};

const EnvironmentDot: FC<EnvironmentDotProps> = (props) => {
  const { type } = props;

  return (
    <svg viewBox="0 0 16 16" className={styles.dot[type]}>
      <circle cx="8" cy="8" r="6" fill="currentColor" fill-rule="evenodd" />
    </svg>
  );
};

type EnvironmentDropdownMenuItemProps = {
  name: Environment["name"];
  type: Environment["type"];
  domain: Environment["domain"];
  isActive?: boolean;
};

const EnvironmentDropdownMenuItem: FC<EnvironmentDropdownMenuItemProps> = (
  props,
) => {
  const { name, type, domain, isActive } = props;

  return (
    <DropdownMenuGroupItem
      startIcon={<EnvironmentDot type={type} />}
      endIcon={Boolean(isActive) ? <Icon name="check" /> : undefined}
      onSelect={() => {
        console.log(`Clicked ${name} (${domain})`);
      }}
    >
      {name}
    </DropdownMenuGroupItem>
  );
};

type Environment = {
  name: string;
  type: "prod" | "stage" | "dev";
  domain: string;
};

type EnvironmentDropdownMenuProps = {
  environments: SideNavEnvironmentSelectorProps["environments"];
};

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const { environments } = props;

  const productionEnvironment = environments.find(
    (environment) => environment.type === "prod",
  );
  const devEnvironments = environments.filter(
    (environment) => environment.type === "dev",
  );
  const restEnvironments = environments.filter(
    (environment) =>
      environment !== productionEnvironment &&
      !devEnvironments.includes(environment),
  );

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger>
        <Button startIcon="unfoldMore" variant="secondary" />
      </DropdownMenuTrigger>
      <DropdownMenuGroupContent align="end">
        <DropdownMenuGroupLabel>Regular Environments</DropdownMenuGroupLabel>
        {productionEnvironment ? (
          <EnvironmentDropdownMenuItem
            name={productionEnvironment?.name}
            type={productionEnvironment?.type}
            domain={productionEnvironment?.domain}
            isActive
          />
        ) : null}
        {restEnvironments.map((environment) => (
          <EnvironmentDropdownMenuItem
            key={environment.domain}
            name={environment.name}
            type={environment.type}
            domain={environment.domain}
          />
        ))}
        {devEnvironments.length > 0 ? (
          <>
            <DropdownMenuGroupLabel>
              Personal Environments
            </DropdownMenuGroupLabel>
            {devEnvironments.map((environment) => (
              <EnvironmentDropdownMenuItem
                key={environment.domain}
                name={environment.name}
                type={environment.type}
                domain={environment.domain}
              />
            ))}
          </>
        ) : null}
      </DropdownMenuGroupContent>
    </DropdownMenu>
  );
};

type SideNavEnvironmentSelectorProps = {
  environments: Environment[];
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const { environments } = props;

  return (
    <Box>
      <LogoIcon className={styles.logo} />
      <EnvironmentDropdownMenu environments={environments} />
    </Box>
  );
};
