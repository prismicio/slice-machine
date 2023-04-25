import { FieldType } from "@prismicio/types-internal/lib/customtypes";
import { IconType } from "react-icons";
import { AnyObjectSchema } from "yup";
import { TabField } from "@lib/models/common/CustomType";
export interface Widget<F extends TabField, S extends AnyObjectSchema> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
export type AnyWidget = Widget<any, any>;
