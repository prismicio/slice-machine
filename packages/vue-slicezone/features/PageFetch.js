import SliceZone from "./SliceZone";
import FetchState from "../components/FetchState";

const multiQueryTypes = ["repeat", "repeatable", "multi"];

export default {
  name: "PageFetch",
  components: {
    SliceZone,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    // Add props from SliceZone except "type" and "slices" ones
    ...Object.entries(SliceZone.props).reduce((acc, [key, value]) => {
      if (["type", "slices"].indexOf(key) === -1) {
        return {
          ...acc,
          [key]: value,
        };
      }
      return acc;
    }, {}),
  },
  data() {
    return {
      slices: [],
    };
  },
  computed: {
    apiParams({ params, lang }) {
      return params || { lang };
    },
  },
  async fetch() {
    try {
      const caller =
        multiQueryTypes.indexOf(this.queryType) !== -1
          ? ["getByUID", [this.type, this.uid, this.apiParams]]
          : ["getSingle", [this.type, this.apiParams]];
      const res = await this.$prismic.api[caller[0]](...caller[1]);
      this.slices = res ? res.data[this.body] : [];
    } catch (e) {
      console.error("[SliceZone/fetch]", e);
      this.slices = [];
    }
  },
  render(h) {
    if (
      this.$fetchState &&
      (this.$fetchState.pending || this.$fetchState.error)
    ) {
      return h(FetchState, { props: { error: this.$fetchState.error } });
    } else {
      return h(SliceZone, {
        scopedSlots: this.$scopedSlots,
        props: { ...this.$props, slices: this.slices },
      });
    }
  },
};
