const camelizeRE = /-(\w)/g;
const pascalize = str => {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
};

const NotFound = {
  props: {
    slice: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
  render(h) {
    if (process.env.NODE_ENV === "development") {
      return h(
        "div",
        {
          style: "border: 1px solid #111"
        },
        [
          h("h3", `Unknown slice "${pascalize(this.slice.slice_type)}"`),
          h("p", JSON.stringify(this.slice))
        ]
      );
    }
    return h("div");
  }
};

export default {
  name: "SliceZone",
  props: {
    components: {
      required: false,
      default() {
        return {};
      }
    },
    debug: {
      required: false,
      type: Boolean,
      default: false
    },
    slices: {
      required: true
    },
    resolver: {
      required: true,
      type: Function,
      description:
        "Resolver takes slice information and returns a dynamic import"
    },
    wrapper: {
      required: false,
      type: String,
      default: "div",
      description: "Wrapper tag (div, section, main...)"
    },
    NotFound: {
      type: Function,
      required: false,
      default() {
        return NotFound;
      }
    }
  },
  computed: {
    computedImports: ({ components, resolver, slices, NotFound, debug }) => {
      const invert = p =>
        new Promise((resolve, reject) => p.then(reject, resolve));
      const firstOf = ps => invert(Promise.all(ps.map(invert)));
      const names = (slices || []).map(e => pascalize(e.slice_type));

      const resolve = payload => {
        if (!resolver) {
          const err =
            'SliceZone expects a "resolver" function to properly index components';
          if (process.env.NODE_ENV === "development" && !debug) {
            throw new Error(err);
          }
          return Promise.resolve(NotFound);
        }
        return resolver(payload);
      };

      return (slices || []).map((_, i) => () => {
        const resolved = components[names[i]]
          ? Promise.resolve(components[names[i]])
          : resolve({ sliceName: names[i], index: i });
        const resolvedArr = Array.isArray(resolved) ? resolved : [resolved];
        return firstOf(resolvedArr).catch(() => NotFound);
      });
    },
    computedSlices: ({ slices, computedImports }) => {
      return (slices || []).map((slice, i) => ({
        import: computedImports[i],
        data: {
          props: { slice },
          key: slice.id
        },
        name: pascalize(slice.slice_type)
      }));
    }
  },
  render(h) {
    const scopedSlots = {};
    const slotNames = Object.keys(this.$scopedSlots);
    for (const name of slotNames) {
      const [sliceName, sliceSlot] = name.split(".");
      // skip if not parsed correctly
      if (!sliceName) continue;
      scopedSlots[sliceName] = scopedSlots[sliceName] || {};
      // TODO: dev warning if found duplicate entries for the same slot
      scopedSlots[sliceName][sliceSlot || "default"] = this.$scopedSlots[name];
    }

    return h(
      this.wrapper,
      {},
      this.computedSlices.map(e => {
        return h(
          e.import,
          {
            ...e.data,
            scopedSlots: scopedSlots[e.name]
          },
          []
        );
      })
    );
  }
};
