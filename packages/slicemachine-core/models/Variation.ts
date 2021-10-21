import { Field } from "./CustomType/fields";

export enum WidgetsArea {
  Primary = "primary",
  Items = "items",
}

export interface Variation<F extends AsArray | AsObject> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly docURL: string;
  readonly version: string;
  readonly display?: string;
  readonly primary: F;
  readonly items: F;
}

export type AsArray = ReadonlyArray<{ key: string; value: Field }>;

export type AsObject = { [key: string]: Field };