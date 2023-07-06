import { type NextRouter, useRouter } from "next/router";
import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

type RouteChange = { source: Route; destination: Route };

export type Route = Pick<NextRouter, "asPath" | "query">;

const RouteChangeContext = createContext<RouteChange | undefined>(undefined);

export const RouteChangeProvider: FC<PropsWithChildren> = (props) => (
  <RouteChangeContext.Provider {...props} value={_useRouteChange()} />
);

function _useRouteChange(): RouteChange {
  const { asPath, query } = useRouter();
  const route = { asPath, query };
  const [prevRoute, setPrevRoute] = useState(route);
  const [routeChange, setRouteChange] = useState({
    source: route,
    destination: route,
  });
  if (route.asPath !== prevRoute.asPath || route.query !== prevRoute.query) {
    setPrevRoute(route);
    setRouteChange({ source: prevRoute, destination: route });
  }
  return routeChange;
}

export function useRouteChange(): RouteChange {
  const routeChange = useContext(RouteChangeContext);
  if (routeChange === undefined)
    throw new Error(
      "useRouteChange must be used within a RouteChangeProvider."
    );
  return routeChange;
}
