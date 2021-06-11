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

      const doc = await this.$prismic.api[caller[0]](...caller[1]);

      this.slices = undefined;
      if (doc) {
        if (this.slicesKey) {
          // If slicesKey is specified then use slicesKey...
          if (this.slicesKey in doc.data && Array.isArray(doc.data[this.slicesKey])) {
            this.slices = doc.data[this.slicesKey];
          } else {
            console.error("[SliceZone/fetch] Cannot find slice zone at specified key `%s`\n\nCheck the document below to make sure you provided the right key:", this.slicesKey, doc.data);
          }
        } else {
          // ...else try to find default slice zone
          for (const key of ["body", "slices"]) {
            if (key in doc.data && Array.isArray(doc.data[key])) {
              this.slices = doc.data[key] 
              break;
            }
          }

          // If slice zone is still not found
          if (!this.slices) {
            console.error("[SliceZone/fetch] Cannot find slice zone in document\n\nCheck the document below to make sure your slice zone is here or provide the `slices-key` props:\n\n<slice-zone ... slices-key=\"mySliceZone\" />\n", doc.data);
          }
        }
      } else {
        throw doc;
      }

      if (!this.slices) {
        this.slices = [];
      }
      
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
