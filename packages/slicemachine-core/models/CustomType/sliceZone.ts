export enum SliceType {
  SharedSlice = "SharedSlice",
  Slice = "Slice",
}

export interface SharedSlice {
  type: SliceType.SharedSlice;
}

export interface NonSharedSlice {
  type: SliceType.Slice;
}

export interface NonSharedSliceInSliceZone {
  key: string;
  value: {
    type: SliceType.Slice;
    [x: string]: any;
  };
}

export type SliceZoneType = "Slices";
export const sliceZoneType: SliceZoneType = "Slices";

export interface SliceZone {
  type: SliceZoneType;
  fieldset: string;
  config: {
    choices: {
      [x: string]: SharedSlice | NonSharedSlice;
    };
  };
}

export interface SliceZoneAsArray {
  key: string;
  value: ReadonlyArray<{ key: string; value: SharedSlice | NonSharedSlice }>;
}
