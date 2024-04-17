import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";

type ModelContextValue =
  | { type?: never; model?: never }
  | { type: "customType"; model: CustomType }
  | { type: "slice"; model: ComponentUI };

const ModelContext = createContext<ModelContextValue>({});

type ModelProviderProps = PropsWithChildren<
  | { type?: never; model?: never }
  | { type: "customType"; model: CustomType }
  | { type: "slice"; model: ComponentUI }
>;

export function ModelProvider(props: ModelProviderProps) {
  const { children, type, model } = props;

  const contextValue = useMemo<ModelContextValue>(
    () => ({ type, model }) as ModelContextValue,
    [type, model],
  );

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
