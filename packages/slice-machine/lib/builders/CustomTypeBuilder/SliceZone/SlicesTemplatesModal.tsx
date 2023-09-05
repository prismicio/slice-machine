import { FC } from "react";
import { Text } from "theme-ui";

import { SliceTemplate } from "@src/features/slicesTemplates/useSlicesTemplates";
import { Slices } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";
import ModalFormCard from "../../../../components/ModalFormCard";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlicesTemplates: SliceTemplate[];
}

export type SliceZoneFormValues = {
  sliceKeys: string[];
};

export const SlicesTemplatesModal: FC<UpdateSliceModalProps> = ({
  isOpen,
  formId,
  close,
  onSubmit,
  availableSlicesTemplates,
}) => {
  const slicesComingSoon: ComponentUI[] = [
    {
      extension: "",
      fileName: "",
      from: "",
      href: "",
      pathToSlice: "",
      model: {
        id: "alternate_grid",
        name: "AlternateGrid",
        type: "SharedSlice",
        variations: [
          {
            description: "",
            docURL: "",
            id: "default",
            name: "Default",
            version: "sktwi1xtmkfgx8626",
          },
          {
            description: "",
            docURL: "",
            id: "Other",
            name: "Other",
            version: "sktwi1xtmkfgx8626",
          },
        ],
      },
      screenshots: {
        default: {
          url: "/alternateGrid.png",
        },
      },
    },
    {
      extension: "",
      fileName: "",
      from: "",
      href: "",
      pathToSlice: "",
      model: {
        id: "customer_logos",
        name: "CustomerLogos",
        type: "SharedSlice",
        variations: [
          {
            description: "",
            docURL: "",
            id: "default",
            name: "Default",
            version: "sktwi1xtmkfgx8626",
          },
          {
            description: "",
            docURL: "",
            id: "Other",
            name: "Other",
            version: "sktwi1xtmkfgx8626",
          },
        ],
      },
      screenshots: {
        default: {
          url: "/customerLogos.png",
        },
      },
    },
  ];

  return (
    <ModalFormCard
      buttonLabel="Create"
      isOpen={isOpen}
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        onSubmit(values);
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: "Create slices from examples",
      }}
      validate={(values) => {
        if (values.sliceKeys.length === 0) {
          return {
            sliceKeys: "Please select at least one slice template",
          };
        }
      }}
      actionMessage={({ errors }) =>
        errors.sliceKeys !== undefined ? (
          <Text sx={{ color: "error" }}>{errors.sliceKeys}</Text>
        ) : undefined
      }
    >
      {({ values }) => (
        <UpdateSliceZoneModalList
          values={values}
          placeholderSlices={slicesComingSoon}
          availableSlices={[
            ...availableSlicesTemplates.map(
              (slice): ComponentUI => ({
                extension: "",
                fileName: "",
                from: "",
                href: "",
                pathToSlice: "",
                model: Slices.toSM(slice.model),
                screenshots: {},
              })
            ),
            ...slicesComingSoon,
          ]}
        />
      )}
    </ModalFormCard>
  );
};
