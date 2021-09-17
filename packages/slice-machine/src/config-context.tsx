import React from "react";

import Environment from "../lib/models/common/Environment";

interface ConfigPayload {
  env?: Environment;
}

export const ConfigContext = React.createContext<ConfigPayload>({});

export default function ConfigContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ConfigPayload;
}) {
  return (
    <ConfigContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </ConfigContext.Provider>
  );
}
