// A list of slice names that are reserved for internal uses.
export const RESERVED_SLICE_NAME = ["components"];

export const acceptedImagesTypes = ["png", "jpg", "jpeg"];

// regex for new fields creation to allow _ only as - is breaking graphQl APIs
export const API_ID_REGEX = /^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)*$/;

// regex for validating old fields, accept _ and -
export const API_ID_RETRO_COMPATIBLE_REGEX =
  /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;

export const PRISMIC_ACADEMY_URL =
  "https://prismic.io/academy/prismic-and-nextjs";

// VIDEOS
export const VIDEO_YOUTUBE_PLAYLIST_LINK =
  "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH";

export const VIDEO_WHAT_ARE_SLICES = "placeholders/What_are_Slices_mrvome";
export const VIDEO_WHAT_ARE_CUSTOM_TYPES = "placeholders/CUSTOM_TYPE__0.5.0";

export const VIDEO_SIMULATOR_TOOLTIP = "SM_HELP_VIDEOS/mock_data";

export const SIMULATOR_WINDOW_ID = "slice-machine-simulator";
