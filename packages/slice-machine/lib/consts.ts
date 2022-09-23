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

// VIDEOS
export const VIDEO_YOUTUBE_PLAYLIST_LINK =
  "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH";
export const VIDEO_WHAT_ARE_SLICES = "placeholders/What_are_Slices_mrvome";
export const VIDEO_WHAT_ARE_CUSTOM_TYPES =
  "placeholders/What_are_Custom_Types_swrc44";
export const VIDEO_ONBOARDING_BUILD_A_SLICE = "SMONBOARDING/BUILD_SLICE";
export const VIDEO_ONBOARDING_ADD_TO_PAGE = "SMONBOARDING/ADD_TO_PAGE";
export const VIDEO_ONBOARDING_PUSH_CHANGES = "SMONBOARDING/PUSH_CHANGES__0.5.0";
