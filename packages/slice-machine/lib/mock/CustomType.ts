import {
  DocumentMock,
} from "@prismicio/mocks";
import { CustomTypes, CustomTypeSM } from "@lib/models/common/CustomType";
import { Document } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export default function MockCustomType(
  model: CustomTypeSM,
  sharedSlices: Record<string, SharedSlice>
): Partial<Document> {
  const prismicModel = CustomTypes.fromSM(model);

  return DocumentMock.generate(prismicModel, sharedSlices);
}
