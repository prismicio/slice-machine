import {ArrayTabs, CustomType, ObjectTabs} from "@models/common/CustomType";
import {Field} from "@models/common/CustomType/fields";

export type PoolOfFields = ReadonlyArray<{ key: string; value: Field }>;

export type CustomTypeStoreType = {
    model: CustomType<ArrayTabs>;
    initialModel: CustomType<ArrayTabs>;
    remoteModel: CustomType<ObjectTabs> | null;
    poolOfFieldsToCheck: PoolOfFields;
    mockConfig: any;
    initialMockConfig: any;
} | null;
