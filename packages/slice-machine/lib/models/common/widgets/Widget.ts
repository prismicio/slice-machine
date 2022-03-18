import {
  UID,
  WidgetTypes,
} from "@prismicio/types-internal/lib/customtypes/widgets";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { IconType } from "react-icons";
import { AnyObjectSchema } from "yup";
import { GroupSM } from "@slicemachine/core/build/src/models/Group";
export interface Widget<
  F extends NestableWidget | UID | GroupSM,
  S extends AnyObjectSchema
> {
  TYPE_NAME: WidgetTypes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleMockContent?: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleMockConfig?: Function;
  MockConfigForm?: {
    (): JSX.Element;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues: any;
  };
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
  Form?: (props: any) => React.ReactElement;
}

export const DEFAULT_CONFIG = {
  label: "",
  placeholder: "",
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
export type AnyWidget = Widget<any, any>;
