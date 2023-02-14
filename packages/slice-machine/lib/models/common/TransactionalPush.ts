export type PushChangesPayload = {
  confirmDeleteDocuments: boolean;
};

export type InvalidCustomTypeResponse = {
  type: "INVALID_CUSTOM_TYPES";
  details: {
    customTypes: { id: string }[];
  };
};
