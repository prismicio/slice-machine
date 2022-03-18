import { UID } from "@prismicio/types-internal/lib/customtypes/widgets";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import {
  CustomTypeSM,
  TabSM,
} from "@slicemachine/core/build/src/models/CustomType";
import { GroupSM } from "@slicemachine/core/build/src/models/Group";

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = "MODIFIED",
  Synced = "SYNCED",
}

type PoolOfFields = ReadonlyArray<{
  key: string;
  value: NestableWidget | UID | GroupSM;
}>;

export interface CustomTypeState {
  current: CustomTypeSM;
  initialCustomType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;
  poolOfFieldsToCheck: PoolOfFields;
  isTouched?: boolean;
  __status?: CustomTypeStatus;
}

export const CustomTypeState = {
  tab(state: CustomTypeState, tabId?: string): TabSM | undefined {
    if (state.current.tabs.length) {
      if (tabId) return state.current.tabs.find((v) => v.key === tabId);
      return state.current.tabs[0];
    }
  },

  updateTab(state: CustomTypeState, tabId: string) {
    return (mutate: (v: TabSM) => TabSM): CustomTypeState => {
      const tabs = state.current.tabs.map((v) => {
        if (v.key === tabId) return mutate(v);
        else return v;
      });

      return {
        ...state,
        current: {
          ...state.current,
          tabs,
        },
      };
    };
  },
  deleteTab(state: CustomTypeState, tabId: string): CustomTypeState {
    const tabs = state.current.tabs.filter((v) => v.key !== tabId);
    return {
      ...state,
      current: {
        ...state.current,
        tabs,
      },
    };
  },
  getPool(tabs: Array<TabSM>): PoolOfFields {
    return tabs.reduce<PoolOfFields>((acc: PoolOfFields, curr: TabSM) => {
      return [...acc, ...curr.value];
    }, []);
  },
};
