import places from "./places";
import { createDefaultHandleMockContentFunction } from "../../../../../utils";

export const initialValues = null;

export const handleMockConfig = () => {
  const randomPlace = places[Math.floor(Math.random() * places.length)];
  return randomPlace.points;
};

export const handleMockContent = createDefaultHandleMockContentFunction(
  { handleMockConfig },
  "GeoPoint",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (v) => v && v.latitude && v.longitude
);
