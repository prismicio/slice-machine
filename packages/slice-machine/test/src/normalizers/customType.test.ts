// @ts-expect-error TS(2307) FIXME: Cannot find module '@slicemachine/core/build/model... Remove this comment to see the full error message
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@lib/models/common/normalizers/customType";

describe("Normalizer - CustomType", () => {
  describe("normalizeFrontendCustomTypes", () => {
    it("returns an object with the ids as key", () => {
      const localCustomTypes: CustomTypeSM[] = [
        {
          id: "id1",
          label: "lama",
          repeatable: false,
          status: true,
          tabs: [
            {
              key: "Main",
              value: [],
            },
          ],
        },
        {
          id: "id2",
          label: "lama",
          repeatable: false,
          status: true,
          tabs: [
            {
              key: "Main",
              value: [],
            },
          ],
        },
      ];
      const remoteCustomTypes: CustomTypeSM[] = [
        {
          id: "id1",
          label: "lama",
          repeatable: false,
          status: true,
          tabs: [
            {
              key: "Main",
              value: [],
            },
          ],
        },
        {
          id: "id2",
          label: "lama",
          repeatable: false,
          status: true,
          tabs: [
            {
              key: "Main",
              value: [],
            },
          ],
        },
      ];

      expect(
        normalizeFrontendCustomTypes(localCustomTypes, remoteCustomTypes)
      ).toEqual({
        id1: {
          local: {
            id: "id1",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
          remote: {
            id: "id1",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
        },
        id2: {
          local: {
            id: "id2",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
          remote: {
            id: "id2",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
        },
      });
    });

    it("does not set remote to undefined if not present", () => {
      const localCustomTypes: CustomTypeSM[] = [
        {
          id: "id1",
          label: "lama",
          repeatable: false,
          status: true,
          tabs: [
            {
              key: "Main",
              value: [],
            },
          ],
        },
      ];

      const normalizedCustomTypes = normalizeFrontendCustomTypes(
        localCustomTypes,
        []
      );

      expect(Object.values(normalizedCustomTypes["id1"]).length).toEqual(1);
      expect(Object.values(normalizedCustomTypes["id1"])).not.toEqual(
        expect.arrayContaining([undefined])
      );
    });
  });

  describe("normalizeFrontendCustomType", () => {
    it("returns an object with the id as key", () => {
      const localCustomType: CustomTypeSM = {
        id: "id1",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const remoteCustomType: CustomTypeSM = {
        id: "id1",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      expect(
        normalizeFrontendCustomType(localCustomType, remoteCustomType)
      ).toEqual({
        id1: {
          local: {
            id: "id1",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
          remote: {
            id: "id1",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
        },
      });
    });

    it("does not set remote to undefined if not present", () => {
      const localCustomType: CustomTypeSM = {
        id: "id1",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const normalizedCustomType = normalizeFrontendCustomType(localCustomType);

      expect(Object.values(normalizedCustomType["id1"]).length).toEqual(1);
      expect(Object.values(normalizedCustomType["id1"])).not.toEqual(
        expect.arrayContaining([undefined])
      );
    });
  });
});
