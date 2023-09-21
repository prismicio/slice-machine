// Those contants should be unique to the init script, if they are needed elsewhere then they should be extracted to the manager
export const START_SCRIPT_KEY = "slicemachine";
export const START_SCRIPT_VALUE = "start-slicemachine";
export const GIGET_PROVIDER = "github";
export const GIGET_ORGANIZATION = "prismicio-community";
export const SLICE_MACHINE_INIT_USER_AGENT = "slice-machine-init";
export const SENTRY_EXPRESS_DSN =
	import.meta.env.VITE_SENTRY_EXPRESS_DSN ||
	"https://d3e69d5189266d8d7f60f71ccc9353fc@o146123.ingest.sentry.io/4505917981982720";
