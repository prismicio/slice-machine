import { SliceSimulator } from "@slicemachine/adapter-next/SliceSimulator";
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";
// import state from "../.slicemachine/libraries-state.json";

const state = {
  slices: {
    components: {
      contact_form: {
        library: "slices",
        id: "contact_form",
        name: "ContactForm",
        description: "ContactForm",
        model: {
          id: "contact_form",
          type: "SharedSlice",
          name: "ContactForm",
          description: "ContactForm",
          variations: [
            {
              id: "default",
              name: "Default",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "ContactForm",
              primary: {},
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          ],
        },
        mocks: {
          default: {
            variation: "default",
            name: "Default",
            slice_type: "contact_form",
            items: [],
            primary: {},
          },
        },
        meta: {
          fileName: "index",
          extension: "js",
        },
        screenshotPaths: {
          default: {
            path: "/Users/angeloashmore/projects/prismic/nextjs-starter-prismic-blog/.slicemachine/assets/slices/ContactForm/default/preview.png",
            width: 800,
            height: 517,
          },
        },
      },
      image: {
        library: "slices",
        id: "image",
        name: "Image",
        description: "Image",
        model: {
          id: "image",
          type: "SharedSlice",
          name: "Image",
          description: "Image",
          variations: [
            {
              id: "default",
              name: "Default",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "Image",
              primary: {
                image: {
                  type: "Image",
                  config: {
                    label: "Image",
                    constraint: {},
                    thumbnails: [],
                  },
                },
                caption: {
                  type: "StructuredText",
                  config: {
                    label: "Caption",
                    placeholder: "Optional - Caption under the image",
                    allowTargetBlank: true,
                    single: "paragraph,em,strong",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
            {
              id: "wide",
              name: "Wide",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "Image",
              primary: {
                image: {
                  type: "Image",
                  config: {
                    label: "Image",
                    constraint: {},
                    thumbnails: [],
                  },
                },
                caption: {
                  type: "StructuredText",
                  config: {
                    label: "Caption",
                    placeholder: "Optional - Caption under the image",
                    allowTargetBlank: true,
                    single: "paragraph,em,strong",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          ],
        },
        mocks: {
          default: {
            variation: "default",
            name: "Default",
            slice_type: "image",
            items: [],
            primary: {
              image: {
                dimensions: {
                  width: 900,
                  height: 500,
                },
                alt: "Placeholder image",
                copyright: null,
                url: "https://images.prismic.io/nextjs-starter-prismic-blog/bbde7d62-670b-4592-b76c-4047d0cf1635_jake-melara-Yh6K2eTr_FY-unsplash.jpg?w=900&h=500&fit=crop",
              },
              caption: [
                {
                  type: "paragraph",
                  text: "Commodo magna dolor est aute in enim do in minim excepteur pariatur duis culpa dolor. Fugiat non ipsum cupidatat proident velit aute Lorem cillum reprehenderit Lorem occaecat esse cillum. Aute aliqua dolor ad elit et.",
                  spans: [],
                },
              ],
            },
          },
          wide: {
            variation: "wide",
            name: "Wide",
            slice_type: "image",
            items: [],
            primary: {
              image: {
                dimensions: {
                  width: 900,
                  height: 500,
                },
                alt: "Placeholder image",
                copyright: null,
                url: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=900&h=500&fit=crop",
              },
              caption: [
                {
                  type: "paragraph",
                  text: "Elit sunt cillum deserunt in qui culpa anim veniam amet dolore consectetur pariatur magna dolor ex.",
                  spans: [],
                },
              ],
            },
          },
        },
        meta: {
          fileName: "index",
          extension: "js",
        },
        screenshotPaths: {
          default: {
            path: "/Users/angeloashmore/projects/prismic/nextjs-starter-prismic-blog/.slicemachine/assets/slices/Image/default/preview.png",
            width: 800,
            height: 586,
          },
          wide: {
            path: "/Users/angeloashmore/projects/prismic/nextjs-starter-prismic-blog/.slicemachine/assets/slices/Image/wide/preview.png",
            width: 800,
            height: 538,
          },
        },
      },
      quote: {
        library: "slices",
        id: "quote",
        name: "Quote",
        description: "Quote",
        model: {
          id: "quote",
          type: "SharedSlice",
          name: "Quote",
          description: "Quote",
          variations: [
            {
              id: "default",
              name: "Default",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "Quote",
              primary: {
                quote: {
                  type: "StructuredText",
                  config: {
                    label: "Quote",
                    placeholder: "Quote without quotation marks",
                    allowTargetBlank: true,
                    single: "heading2",
                  },
                },
                source: {
                  type: "Text",
                  config: {
                    label: "Source",
                    placeholder: "Source of the quote",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          ],
        },
        mocks: {
          default: {
            variation: "default",
            name: "Default",
            slice_type: "quote",
            items: [],
            primary: {
              quote: [
                {
                  type: "heading2",
                  text: "Harness world-class applications",
                  spans: [],
                },
              ],
              source: "productize granular blockchains",
            },
          },
        },
        meta: {
          fileName: "index",
          extension: "js",
        },
        screenshotPaths: {
          default: {
            path: "/Users/angeloashmore/projects/prismic/nextjs-starter-prismic-blog/.slicemachine/assets/slices/Quote/default/preview.png",
            width: 800,
            height: 178,
          },
        },
      },
      text: {
        library: "slices",
        id: "text",
        name: "Text",
        description: "Text",
        model: {
          id: "text",
          type: "SharedSlice",
          name: "Text",
          description: "Text",
          variations: [
            {
              id: "default",
              name: "Default",
              docURL: "...",
              version: "sktwi1xtmkfgx8626",
              description: "Text",
              primary: {
                text: {
                  type: "StructuredText",
                  config: {
                    label: "Text",
                    placeholder: "Text with rich formatting",
                    allowTargetBlank: true,
                    multi:
                      "paragraph,preformatted,heading1,heading2,heading3,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
                  },
                },
              },
              items: {},
              imageUrl:
                "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            },
          ],
        },
        mocks: {
          default: {
            variation: "default",
            name: "Default",
            slice_type: "text",
            items: [],
            primary: {
              text: [
                {
                  type: "paragraph",
                  text: "Nostrud non tempor anim officia ad mollit minim ut culpa enim magna. Esse qui labore consectetur amet mollit tempor non reprehenderit ex occaecat aliquip sunt quis veniam. Veniam amet ad occaecat ipsum exercitation consequat dolore fugiat ad minim consequat voluptate.",
                  spans: [],
                },
                {
                  type: "paragraph",
                  text: "Sit non laborum excepteur. Commodo dolore sint proident excepteur veniam aute ullamco ullamco laboris labore velit nostrud id. Ea quis incididunt adipisicing est aute commodo proident.",
                  spans: [],
                },
                {
                  type: "paragraph",
                  text: "Occaecat commodo sint fugiat magna labore mollit irure exercitation aute ipsum velit irure. Cillum culpa ea veniam.",
                  spans: [],
                },
                {
                  type: "paragraph",
                  text: "Excepteur et pariatur excepteur id laborum ad consectetur.",
                  spans: [],
                },
              ],
            },
          },
        },
        meta: {
          fileName: "index",
          extension: "js",
        },
        screenshotPaths: {
          default: {
            path: "/Users/angeloashmore/projects/prismic/nextjs-starter-prismic-blog/.slicemachine/assets/slices/Text/default/preview.png",
            width: 800,
            height: 489,
          },
        },
      },
    },
  },
};

const SliceSimulatorPage = () => {
  return (
    <SliceSimulator
      sliceZone={({ slices }) => (
        <SliceZone slices={slices} components={components} />
      )}
      state={state}
    />
  );
};

export default SliceSimulatorPage;
