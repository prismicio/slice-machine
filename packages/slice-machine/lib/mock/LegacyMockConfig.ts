import * as t from "io-ts";
import { chain } from "fp-ts/Either";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/function";

import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { Block } from "@prismicio/types-internal/lib/documents/widgets/nestable/StructuredTextContent/Block";
import {
  NestableWidgetMockConfig,
  ColorMockConfig,
  TextMockConfig,
  TimestampMockConfig,
  NumberMockConfig,
  DateMockConfig,
  EmbedMockConfig,
  GeoPointMockConfig,
  BooleanMockConfig,
  SelectMockConfig,
  ImageMockConfig,
  LinkMockConfig,
  ExternalLinkConfig,
  MediaLinkConfig,
  RichTextMockConfig,
} from "@prismicio/mocks";
import { EmbedContent } from "@prismicio/types-internal/lib/documents/widgets/nestable/EmbedContent";

export const NonEmptyText = new t.Type<
  string | undefined,
  string | undefined,
  unknown
>(
  "nonEmptyStringOrUndefined",
  (u): u is string => typeof u === "string" || u === undefined,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      chain((s) => {
        if (s.length > 0) {
          return t.success(s);
        } else {
          return t.success(undefined);
        }
      })
    ),
  (s) => s
);

export const ImageLegacyMockConfig = t.exact(
  t.partial({
    content: NonEmptyText,
  })
);
export type ImageLegacyMockConfig = t.TypeOf<typeof ImageLegacyMockConfig>;

export const RichTextLegacyMockConfig = t.exact(
  t.partial({
    content: t.array(t.unknown),
    config: t.type({
      patternType: t.union([
        t.literal("PARAGRAPH"),
        t.literal("HEADING"),
        t.literal("STORY"),
      ]),
      blocks: t.number,
    }),
  })
);
export type RichTextLegacyMockConfig = t.TypeOf<
  typeof RichTextLegacyMockConfig
>;

export const LinkLegacyMockConfig = t.exact(
  t.partial({
    content: t.unknown,
  })
);
export type LinkLegacyMockConfig = t.TypeOf<typeof LinkLegacyMockConfig>;
//////////

export const SelectLegacyMockConfig = t.exact(
  t.partial({
    content: NonEmptyText,
    options: t.array(NonEmptyText),
    default_value: NonEmptyText,
  })
);
export type SelectLegacyMockConfig = t.TypeOf<typeof SelectLegacyMockConfig>;

export const BooleanLegacyMockConfig = t.exact(
  t.partial({
    content: t.boolean,
  })
);
export type BooleanLegacyMockConfig = t.TypeOf<typeof BooleanLegacyMockConfig>;

export const DateLegacyMockConfig = t.exact(
  t.partial({
    content: NonEmptyText,
  })
);
export type DateLegacyMockConfig = t.TypeOf<typeof DateLegacyMockConfig>;

export const EmbedLegacyMockConfig = t.exact(
  t.partial({
    content: t.unknown,
  })
);
export type EmbedLegacyMockConfig = t.TypeOf<typeof EmbedLegacyMockConfig>;

export const GeoPointLegacyMockConfig = t.exact(
  t.partial({
    content: t.type({
      latitude: t.number,
      longitude: t.number,
    }),
  })
);
export type GeoPointLegacyMockConfig = t.TypeOf<
  typeof GeoPointLegacyMockConfig
>;

export const TextLegacyMockConfig = t.exact(
  t.partial({
    content: NonEmptyText,
  })
);
export type TextLegacyMockConfig = t.TypeOf<typeof TextLegacyMockConfig>;

export const NumberLegacyMockConfig = t.exact(
  t.partial({
    content: t.number,
  })
);
export type NumberLegacyMockConfig = t.TypeOf<typeof NumberLegacyMockConfig>;

export const TimestampLegacyMockConfig = t.exact(
  t.partial({
    content: NonEmptyText,
  })
);
export type TimestampLegacyMockConfig = t.TypeOf<
  typeof TimestampLegacyMockConfig
>;

export const ColorContent = new t.Type<string, string, unknown>(
  "ColorConfig",
  (u): u is string => typeof u === "string",
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      chain((s) => {
        const isValid = s.indexOf("#") === 0 && s.length === 7;
        if (!isValid) t.failure(u, c);
        return t.success(s);
      })
    ),
  (color) => color
);
export const ColorLegacyMockConfig = t.exact(
  t.partial({
    content: ColorContent,
  })
);
export type ColorLegacyMockConfig = t.TypeOf<typeof ColorLegacyMockConfig>;

export function buildFieldMockConfig(
  type: WidgetTypes,
  fieldMockConfig?: unknown
): NestableWidgetMockConfig | undefined {
  if (!fieldMockConfig) return;

  switch (type) {
    case WidgetTypes.Color: {
      return fold(
        () => {
          console.warn(`couldn't parse the color mock config.`);
          return undefined;
        },
        (config: ColorLegacyMockConfig): ColorMockConfig => {
          return {
            value: config.content,
          };
        }
      )(ColorLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Text: {
      return fold(
        () => {
          console.warn(`couldn't parse the text mock config.`);
          return undefined;
        },
        (config: TextLegacyMockConfig): TextMockConfig => {
          return {
            value: config.content,
          };
        }
      )(TextLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Timestamp: {
      return fold(
        () => {
          console.warn(`couldn't parse the timestamp mock config.`);
          return undefined;
        },
        (config: TimestampLegacyMockConfig): TimestampMockConfig => {
          return {
            value: config.content ? new Date(config.content) : undefined,
          };
        }
      )(TimestampLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Number: {
      return fold(
        () => {
          console.warn(`couldn't parse the number mock config.`);
          return undefined;
        },
        (config: NumberLegacyMockConfig): NumberMockConfig => {
          return {
            value: config.content,
          };
        }
      )(NumberLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Date: {
      return fold(
        () => {
          console.warn(`couldn't parse the Date mock config.`);
          return undefined;
        },
        (config: DateLegacyMockConfig): DateMockConfig => {
          return {
            value: config.content ? new Date(config.content) : undefined,
          };
        }
      )(DateLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.GeoPoint: {
      return fold(
        () => {
          console.warn(`couldn't parse the GeoPoint mock config.`);
          return undefined;
        },
        (config: GeoPointLegacyMockConfig): GeoPointMockConfig => {
          return {
            value: config.content,
          };
        }
      )(GeoPointLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Embed: {
      return fold(
        () => {
          console.warn(`couldn't parse the Embed mock config.`);
          return undefined;
        },
        (config: EmbedLegacyMockConfig): EmbedMockConfig => {
          const value = (() => {
            if (!config) return;
            const url = config.content
              ? (config.content as { url: string }).url
              : undefined;
            const oembed = config.content
              ? (config.content as { oembed: EmbedContent }).oembed
              : undefined;
            if (url && oembed) return oembed;
            return;
          })();
          return { value };
        }
      )(EmbedLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.BooleanField: {
      return fold(
        () => {
          console.warn(`couldn't parse the Boolean mock config.`);
          return undefined;
        },
        (config: BooleanLegacyMockConfig): BooleanMockConfig => {
          return {
            value: config.content,
          };
        }
      )(BooleanLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Select: {
      return fold(
        () => {
          console.warn(`couldn't parse the Select mock config.`);
          return undefined;
        },
        (config: SelectLegacyMockConfig): SelectMockConfig => {
          return {
            value: config.content,
          };
        }
      )(SelectLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Link: {
      return fold(
        () => {
          console.warn(`couldn't parse the Link mock config.`);
          return undefined;
        },
        (config: LinkLegacyMockConfig): LinkMockConfig => {
          return {
            value:
              typeof config.content === "object"
                ? ({ value: config.content } as MediaLinkConfig)
                : ({ value: config.content } as ExternalLinkConfig),
          };
        }
      )(LinkLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.Image: {
      return fold(
        () => {
          console.warn(`couldn't parse the Image mock config.`);
          return undefined;
        },
        (config: ImageLegacyMockConfig): ImageMockConfig => {
          return {
            value: config.content,
          };
        }
      )(ImageLegacyMockConfig.decode(fieldMockConfig));
    }
    case WidgetTypes.RichText: {
      return fold(
        () => {
          console.warn(`couldn't parse the RichText mock config.`);
          return undefined;
        },
        (config: RichTextLegacyMockConfig): RichTextMockConfig => {
          return {
            value: config.content as Array<Block>,
            nbBlocks: config.config?.blocks,
            pattern: config.config?.patternType,
          };
        }
      )(RichTextLegacyMockConfig.decode(fieldMockConfig));
    }
    default:
      console.warn(
        `[slice-machine] Could not read mock config for type "${type}": not supported.`
      );
      return;
  }
}

export function buildFieldsMockConfig(
  fieldsModels: Record<string, { type: string }>,
  fieldsMockConfig?: Record<string, unknown>
): Record<string, NestableWidgetMockConfig> {
  return Object.entries(fieldsModels || {}).reduce<
    Record<string, NestableWidgetMockConfig>
  >((acc, [fieldKey, { type }]) => {
    const fieldLegacyMockConfig = buildFieldMockConfig(
      type as WidgetTypes,
      fieldsMockConfig?.[fieldKey]
    );
    const field = fieldLegacyMockConfig
      ? { [fieldKey]: fieldLegacyMockConfig }
      : {};
    return {
      ...acc,
      ...field,
    };
  }, {});
}
