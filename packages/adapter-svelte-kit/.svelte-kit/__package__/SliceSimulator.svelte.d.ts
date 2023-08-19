/** @typedef {typeof __propDef.props}  SliceSimulatorProps */
/** @typedef {typeof __propDef.events}  SliceSimulatorEvents */
/** @typedef {typeof __propDef.slots}  SliceSimulatorSlots */
export default class SliceSimulator extends SvelteComponentTyped<{
    [x: string]: any;
    zIndex?: number | undefined;
    background?: string | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {
        slices: [] | [import("@prismicio/client").Slice<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>> | import("@prismicio/client").SharedSlice<string, import("@prismicio/client").SharedSliceVariation<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>>>, ...(import("@prismicio/client").Slice<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>> | import("@prismicio/client").SharedSlice<string, import("@prismicio/client").SharedSliceVariation<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>>>)[]];
    };
}> {
}
export type SliceSimulatorProps = typeof __propDef.props;
export type SliceSimulatorEvents = typeof __propDef.events;
export type SliceSimulatorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        zIndex?: number | undefined;
        background?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            slices: [] | [import("@prismicio/client").Slice<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>> | import("@prismicio/client").SharedSlice<string, import("@prismicio/client").SharedSliceVariation<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>>>, ...(import("@prismicio/client").Slice<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>> | import("@prismicio/client").SharedSlice<string, import("@prismicio/client").SharedSliceVariation<string, Record<string, import("@prismicio/client").AnyRegularField>, Record<string, import("@prismicio/client").AnyRegularField>>>)[]];
        };
    };
};
export {};
