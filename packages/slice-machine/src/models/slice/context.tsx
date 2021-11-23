import React, { useReducer } from "react";
import { useRouter } from "next/router";
import type { Models } from "@slicemachine/core";
import { LibrariesContext } from "../libraries/context";
import { useContext } from "react";
import SliceStore from "./store";
import { reducer } from "./reducer";

import SliceState from "@lib/models/ui/SliceState";
import Slice from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";

type ContextProps = {
  Model: ComponentUI;
  store: SliceStore;
  variation: Models.VariationAsArray;
};
export const SliceContext = React.createContext<Partial<ContextProps>>({});

/**
 * remoteSlicesState
 * fsSlicesState
 */

export function useModelReducer({
  slice,
  remoteSlice,
  mockConfig,
}: {
  slice: ComponentUI;
  remoteSlice?: Models.SliceAsObject;
  mockConfig: any;
}): [SliceState, SliceStore] {
  const { model, ...rest } = slice;

  const variations = Slice.toArray(model).variations;
  const initialState: SliceState = {
    jsonModel: model,
    ...rest,
    variations,
    mockConfig,
    initialMockConfig: mockConfig,
    remoteVariations: remoteSlice ? Slice.toArray(remoteSlice).variations : [],
    initialPreviewUrls: rest.infos.previewUrls,
    initialVariations: variations,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const store = new SliceStore(dispatch);

  return [state, store];
}

type SliceProviderProps = {
  value: any;
  variation: Models.VariationAsArray;
};

const SliceProvider: React.FunctionComponent<SliceProviderProps> = ({
  children,
  value,
  variation,
}) => {
  const [Model, store] = value;
  return (
    <SliceContext.Provider value={{ Model, store, variation }}>
      {typeof children === "function" ? children(value) : children}
    </SliceContext.Provider>
  );
};

export const SliceHandler = ({ children }: { children: any }) => {
  const router = useRouter();
  const libraries = useContext(LibrariesContext);

  if (!router.query || !router.query.lib || !router.query.sliceName) {
    return children;
  }

  const libParam: string = (() => {
    const l = router.query.lib;
    if (l instanceof Array) return l[0];
    else return l;
  })();

  const lib = libraries.find((l) => l?.name === libParam.replace(/--/g, "/"));
  if (!lib) {
    router.replace("/");
    return null;
  }

  const slice = lib.components.find(
    ([state]) => state.infos.sliceName === router.query.sliceName
  );

  if (!slice) {
    router.replace("/");
    return null;
  }

  const variationParam: string | undefined = (() => {
    const l = router.query.variation;
    if (l instanceof Array) return l[0];
    else return l;
  })();
  const variation = (() => {
    if (variationParam) {
      const maybeVariation = SliceState.variation(slice[0], variationParam);
      if (!maybeVariation) return SliceState.variation(slice[0]);
      else return maybeVariation;
    } else {
      return SliceState.variation(slice[0]);
    }
  })();
  if (!variation) {
    router.replace("/");
    return null;
  }

  // variation not in the URL but a default variation was found
  if (!variationParam) {
    router.replace(`/${lib.name}/${slice[0].infos.sliceName}/${variation.id}`);
  }

  return (
    <SliceProvider value={slice} variation={variation}>
      {children}
    </SliceProvider>
  );
};

export default SliceProvider;
