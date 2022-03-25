import faker from "faker";
import * as Widgets from "./misc/widgets";
import { Tab } from "@lib/models/common/CustomType/tab";

import { handleFields } from "./misc/handlers";

import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { GroupSM } from "@slicemachine/core/build/models/Group";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

interface Mock {
  id: string;
  uid: string | null;
  type: string;
  data: { [key: string]: unknown };
}

const fieldsHandler = handleFields(Widgets);

const groupHandler = (group: GroupSM, mockConfig: CustomTypeMockConfig) => {
  const items = [];
  const entries = group.config?.fields;
  for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
    items.push(fieldsHandler(entries, mockConfig));
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return items;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const sliceZoneHandler = () => {};

const createEmptyMock = (type: string) => ({
  id: faker.datatype.uuid(),
  uid: null,
  type,
  data: {},
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function MockCustomType(
  model: CustomTypeSM,
  mockConfig: CustomTypeMockConfig
) {
  const customTypeMock: Mock = createEmptyMock(model.id);
  const maybeUid = model.tabs.reduce((acc, curr) => {
    const maybeWidgetUid = Object.entries(curr.value).find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access
      ([_, e]) => e.value.type === "UID"
    );
    if (!acc && maybeWidgetUid) {
      return curr;
    }
    return acc;
  });

  if (maybeUid) {
    customTypeMock.uid = Widgets.UID.handleMockConfig();
  }

  for (const [, tab] of Object.entries(model.tabs)) {
    const { fields, groups, sliceZone } = Tab.organiseFields(tab);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockedFields = fieldsHandler(fields as [], mockConfig);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    customTypeMock.data = {
      ...customTypeMock.data,
      ...mockedFields,
    };
    groups.forEach((group) => {
      const { key, value } = group;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
      const groupMockConfig = CustomTypeMockConfig.getFieldMockConfig(
        mockConfig,
        key
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const groupFields = groupHandler(value, groupMockConfig);
      customTypeMock.data[key] = groupFields;
    });

    if (sliceZone) {
      sliceZoneHandler();
    }
  }
  return customTypeMock;
}
