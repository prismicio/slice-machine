import {ArrayTabs, CustomType} from "@models/common/CustomType";
import {PoolOfFields} from "@src/modules/customType/stateHelpers";

export type CustomTypeStoreType = {
    model: CustomType<ArrayTabs>,
    poolOfFieldsToCheck: PoolOfFields
    mockConfig: any
} | null;
