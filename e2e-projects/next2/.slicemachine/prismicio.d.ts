import type * as prismicT from "@prismicio/types";
import type * as prismic from "@prismicio/client";

type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
};
/** Content for Article documents */
interface ArticleDocumentData {
  /**
   * Title field in _Article_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Title of the article
   * - **API ID Path**: article.title
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  title: prismicT.TitleField;
  /**
   * Publish Date field in _Article_
   *
   * - **Field Type**: Date
   * - **Placeholder**: Date the article was published
   * - **API ID Path**: article.publishDate
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/date
   */
  publishDate: prismicT.DateField;
  /**
   * Featured Image field in _Article_
   *
   * - **Field Type**: Image
   * - **Placeholder**: _None_
   * - **API ID Path**: article.featuredImage
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/image
   */
  featuredImage: prismicT.ImageField<never>;
  /**
   * Slice Zone field in _Article_
   *
   * - **Field Type**: Slice Zone
   * - **Placeholder**: _None_
   * - **API ID Path**: article.slices[]
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/slices
   */
  slices: prismicT.SliceZone<ArticleDocumentDataSlicesSlice>;
}
/** Slice for _Article → Slice Zone_ */
type ArticleDocumentDataSlicesSlice =
  | ImageSlice
  | QuoteSlice
  | TextSlice
  | ContactFormSlice;
/**
 * Article document from Prismic
 *
 * - **API ID**: `article`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ArticleDocument<Lang extends string = string> =
  prismicT.PrismicDocumentWithUID<
    Simplify<ArticleDocumentData>,
    "article",
    Lang
  >;
/** Content for Navigation documents */
interface NavigationDocumentData {
  /**
   * Homepage Label field in _Navigation_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Label for the homepage link
   * - **API ID Path**: navigation.homepageLabel
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  homepageLabel: prismicT.TitleField;
  /**
   * Links field in _Navigation_
   *
   * - **Field Type**: Group
   * - **Placeholder**: _None_
   * - **API ID Path**: navigation.links[]
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/group
   */
  links: prismicT.GroupField<Simplify<NavigationDocumentDataLinksItem>>;
}
/** Item in Navigation → Links */
export interface NavigationDocumentDataLinksItem {
  /**
   * Label field in _Navigation → Links_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Optional - Label for the link
   * - **API ID Path**: navigation.links[].label
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  label: prismicT.TitleField;
  /**
   * Link field in _Navigation → Links_
   *
   * - **Field Type**: Link
   * - **Placeholder**: Link for navigation item
   * - **API ID Path**: navigation.links[].link
   * - **Documentation**:
   *   https://prismic.io/docs/core-concepts/link-content-relationship
   */
  link: prismicT.LinkField;
}
/**
 * Navigation document from Prismic
 *
 * - **API ID**: `navigation`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type NavigationDocument<Lang extends string = string> =
  prismicT.PrismicDocumentWithoutUID<
    Simplify<NavigationDocumentData>,
    "navigation",
    Lang
  >;
/** Content for Page documents */
interface PageDocumentData {
  /**
   * Title field in _Page_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Title for the page
   * - **API ID Path**: page.title
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  title: prismicT.TitleField;
  /**
   * Slice Zone field in _Page_
   *
   * - **Field Type**: Slice Zone
   * - **Placeholder**: _None_
   * - **API ID Path**: page.slices[]
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/slices
   */
  slices: prismicT.SliceZone<PageDocumentDataSlicesSlice>;
}
/** Slice for _Page → Slice Zone_ */
type PageDocumentDataSlicesSlice =
  | ImageSlice
  | QuoteSlice
  | TextSlice
  | ContactFormSlice;
/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> =
  prismicT.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;
/** Content for Settings documents */
interface SettingsDocumentData {
  /**
   * Name field in _Settings_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Name of your blog (e.g. your name)
   * - **API ID Path**: settings.name
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  name: prismicT.TitleField;
  /**
   * Description field in _Settings_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Short description of your blog
   * - **API ID Path**: settings.description
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  description: prismicT.RichTextField;
  /**
   * Profile Picture field in _Settings_
   *
   * - **Field Type**: Image
   * - **Placeholder**: _None_
   * - **API ID Path**: settings.profilePicture
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/image
   */
  profilePicture: prismicT.ImageField<never>;
  /**
   * Newsletter Description field in _Settings_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Text above the sign up form
   * - **API ID Path**: settings.newsletterDescription
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  newsletterDescription: prismicT.RichTextField;
  /**
   * Newsletter Disclaimer field in _Settings_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Small text below sign up form
   * - **API ID Path**: settings.newsletterDisclaimer
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  newsletterDisclaimer: prismicT.RichTextField;
}
/**
 * Settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> =
  prismicT.PrismicDocumentWithoutUID<
    Simplify<SettingsDocumentData>,
    "settings",
    Lang
  >;
export type AllDocumentTypes =
  | ArticleDocument
  | NavigationDocument
  | PageDocument
  | SettingsDocument;
/**
 * Default variation for ContactForm Slice
 *
 * - **API ID**: `default`
 * - **Description**: `ContactForm`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type ContactFormSliceDefault = prismicT.SharedSliceVariation<
  "default",
  Record<string, never>,
  never
>;
/** Slice variation for _ContactForm_ */
type ContactFormSliceVariation = ContactFormSliceDefault;
/**
 * ContactForm Shared Slice
 *
 * - **API ID**: `contact_form`
 * - **Description**: `ContactForm`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type ContactFormSlice = prismicT.SharedSlice<
  "contact_form",
  ContactFormSliceVariation
>;
/** Primary content in Image → Primary */
interface ImageSliceDefaultPrimary {
  /**
   * Image field in _Image → Primary_
   *
   * - **Field Type**: Image
   * - **Placeholder**: _None_
   * - **API ID Path**: image.primary.image
   * - **Documentation**: https://prismic.io/docs/core-concepts/image
   */
  image: prismicT.ImageField<never>;
  /**
   * Caption field in _Image → Primary_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Optional - Caption under the image
   * - **API ID Path**: image.primary.caption
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  caption: prismicT.RichTextField;
}
/**
 * Default variation for Image Slice
 *
 * - **API ID**: `default`
 * - **Description**: `Image`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type ImageSliceDefault = prismicT.SharedSliceVariation<
  "default",
  Simplify<ImageSliceDefaultPrimary>,
  never
>;
/** Primary content in Image → Primary */
interface ImageSliceWidePrimary {
  /**
   * Image field in _Image → Primary_
   *
   * - **Field Type**: Image
   * - **Placeholder**: _None_
   * - **API ID Path**: image.primary.image
   * - **Documentation**: https://prismic.io/docs/core-concepts/image
   */
  image: prismicT.ImageField<never>;
  /**
   * Caption field in _Image → Primary_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Optional - Caption under the image
   * - **API ID Path**: image.primary.caption
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  caption: prismicT.RichTextField;
}
/**
 * Wide variation for Image Slice
 *
 * - **API ID**: `wide`
 * - **Description**: `Image`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type ImageSliceWide = prismicT.SharedSliceVariation<
  "wide",
  Simplify<ImageSliceWidePrimary>,
  never
>;
/** Slice variation for _Image_ */
type ImageSliceVariation = ImageSliceDefault | ImageSliceWide;
/**
 * Image Shared Slice
 *
 * - **API ID**: `image`
 * - **Description**: `Image`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type ImageSlice = prismicT.SharedSlice<"image", ImageSliceVariation>;
/** Primary content in Quote → Primary */
interface QuoteSliceDefaultPrimary {
  /**
   * Quote field in _Quote → Primary_
   *
   * - **Field Type**: Title
   * - **Placeholder**: Quote without quotation marks
   * - **API ID Path**: quote.primary.quote
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  quote: prismicT.TitleField;
  /**
   * Source field in _Quote → Primary_
   *
   * - **Field Type**: Text
   * - **Placeholder**: Source of the quote
   * - **API ID Path**: quote.primary.source
   * - **Documentation**: https://prismic.io/docs/core-concepts/key-text
   */
  source: prismicT.KeyTextField;
}
/**
 * Default variation for Quote Slice
 *
 * - **API ID**: `default`
 * - **Description**: `Quote`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type QuoteSliceDefault = prismicT.SharedSliceVariation<
  "default",
  Simplify<QuoteSliceDefaultPrimary>,
  never
>;
/** Slice variation for _Quote_ */
type QuoteSliceVariation = QuoteSliceDefault;
/**
 * Quote Shared Slice
 *
 * - **API ID**: `quote`
 * - **Description**: `Quote`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type QuoteSlice = prismicT.SharedSlice<"quote", QuoteSliceVariation>;
/** Primary content in Text → Primary */
interface TextSliceDefaultPrimary {
  /**
   * Text field in _Text → Primary_
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: Text with rich formatting
   * - **API ID Path**: text.primary.text
   * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
   */
  text: prismicT.RichTextField;
}
/**
 * Default variation for Text Slice
 *
 * - **API ID**: `default`
 * - **Description**: `Text`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type TextSliceDefault = prismicT.SharedSliceVariation<
  "default",
  Simplify<TextSliceDefaultPrimary>,
  never
>;
/** Slice variation for _Text_ */
type TextSliceVariation = TextSliceDefault;
/**
 * Text Shared Slice
 *
 * - **API ID**: `text`
 * - **Description**: `Text`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 */
export type TextSlice = prismicT.SharedSlice<"text", TextSliceVariation>;
declare module "@prismicio/client" {
  interface CreateClient {
    (
      repositoryNameOrEndpoint: string,
      options?: prismic.ClientConfig
    ): prismic.Client<AllDocumentTypes>;
  }
  namespace Content {
    export type {
      ArticleDocumentData,
      ArticleDocumentDataSlicesSlice,
      ArticleDocument,
      NavigationDocumentData,
      NavigationDocumentDataLinksItem,
      NavigationDocument,
      PageDocumentData,
      PageDocumentDataSlicesSlice,
      PageDocument,
      SettingsDocumentData,
      SettingsDocument,
      AllDocumentTypes,
      ContactFormSliceDefault,
      ContactFormSliceVariation,
      ContactFormSlice,
      ImageSliceDefaultPrimary,
      ImageSliceDefault,
      ImageSliceWidePrimary,
      ImageSliceWide,
      ImageSliceVariation,
      ImageSlice,
      QuoteSliceDefaultPrimary,
      QuoteSliceDefault,
      QuoteSliceVariation,
      QuoteSlice,
      TextSliceDefaultPrimary,
      TextSliceDefault,
      TextSliceVariation,
      TextSlice,
    };
  }
}
