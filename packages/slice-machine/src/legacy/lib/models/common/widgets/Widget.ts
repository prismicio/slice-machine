import { FieldType } from "@prismicio/types-internal/lib/customtypes";
import { GroupFieldType } from "@prismicio/types-internal/lib/customtypes/widgets";
import { IconType } from "react-icons";
import { AnyObjectSchema } from "yup";

import { TabField } from "@/legacy/lib/models/common/CustomType";

interface WidgetBase<F extends TabField, S extends AnyObjectSchema> {
  TYPE_NAME: FieldType;
  create: (label: string) => F;
  Meta: {
    icon: IconType;
    title: string;
    description: string;
  };
  schema: S;
  // eslint-disable-next-line @typescript-eslint/ban-types
  FormFields: {};
  CUSTOM_NAME?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CustomListItem?: (props: any) => React.ReactElement;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  Form?: (props: any) => React.ReactNode;
  prepareInitialValues?: (props: F["config"]) => F["config"];
}

interface GroupWidget<F extends TabField, S extends AnyObjectSchema>
  extends WidgetBase<F, S> {
  TYPE_NAME: typeof GroupFieldType;
  hintItemName: string;
}

interface NonGroupWidget<F extends TabField, S extends AnyObjectSchema>
  extends WidgetBase<F, S> {
  TYPE_NAME: Exclude<FieldType, typeof GroupFieldType>;
}

export type Widget<F extends TabField, S extends AnyObjectSchema> =
  | GroupWidget<F, S>
  | NonGroupWidget<F, S>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
export type AnyWidget = Widget<any, any>;
