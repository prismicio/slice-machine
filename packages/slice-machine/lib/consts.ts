// A list of slice names that are reserved for internal uses.
export const RESERVED_SLICE_NAME = ["components"];

export const DEFAULT_VARIATION_ID = "default";
export const changelogPath = "changelog/versions";

export const acceptedImagesTypes = ["png", "jpg", "jpeg"];

export const MockConfigKey = "mockConfig";

// regex for new fields creation to allow _ only as - is breaking graphQl APIs
export const API_ID_REGEX = /^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)*$/;

// regex for validating old fields, accept _ and -
export const API_ID_RETRO_COMPATIBLE_REGEX =
  /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;
