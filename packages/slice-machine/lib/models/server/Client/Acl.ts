export interface AclCreateResult {
  values: {
    url: string;
    fields: Record<string, string>;
  };
  imgixEndpoint: string;
  message?: string;
  Message?: string;
  error?: string;
}
