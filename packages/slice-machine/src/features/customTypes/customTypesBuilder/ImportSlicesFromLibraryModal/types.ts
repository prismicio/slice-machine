import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { z } from "zod";

export type Framework = "next" | "nuxt" | "sveltekit";

export const AdapterSchema = z.enum([
  "@slicemachine/adapter-next",
  "@slicemachine/adapter-nuxt",
  "@slicemachine/adapter-nuxt2",
  "@slicemachine/adapter-sveltekit",
]);

export type Adapter = z.infer<typeof AdapterSchema>;

export type SliceImport = {
  image: File;
  model: SharedSlice;
  thumbnailUrl?: string;
  files?: SliceFile[];
  componentContents?: string;
  mocks?: SharedSliceContent[];
  screenshots?: Record<string, File>;
};

export type SliceFile = {
  path: string;
  contents: string | File;
  isBinary: boolean;
};

export type NewSlice = {
  image: File;
  model: SharedSlice;
  langSmithUrl?: string;
  files?: SliceFile[];
  componentContents?: string;
  mocks?: SharedSliceContent[];
  screenshots?: Record<string, File>;
};

export type DialogTab = "local" | "library";

export type CommonDialogProps = {
  location: "custom_type" | "page_type";
  typeName: string;
  onClose: () => void;
};

export type CommonDialogContentProps = CommonDialogProps & {
  onSelectTab: (tab: DialogTab) => void;
  selected: boolean;
};

export type GitIntegration = {
  id: string;
  repositories: GitHubRepository[];
};

export type GitHubRepository = {
  name: string;
  fullName: string;
};

export type RepositorySelection = {
  integrationId: string;
} & GitHubRepository;
