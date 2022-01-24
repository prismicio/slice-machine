export interface FakeResponse {
  status: number;
  statusText: string;
  fake: boolean;
  json: () => [];
  error?: string;
  text?: () => "";
}

export default class FakeClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mutate: (jsonResponse?: any) => {
    status: number;
    statusText: string;
    fake: boolean;
    err: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: () => any;
  };

  constructor() {
    this.mutate = (jsonResponse = []) => ({
      status: 403,
      statusText: "Unauthorized",
      fake: true,
      err: "You are not connected to Prismic",
      json() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return jsonResponse;
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSlice(): Promise<FakeResponse> {
    return {
      status: 200,
      statusText: "ok",
      fake: true,
      json() {
        return [];
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getCustomTypes(): Promise<FakeResponse> {
    return {
      status: 200,
      statusText: "ok",
      fake: true,
      json() {
        return [];
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async insertCustomType(): Promise<FakeResponse> {
    return this.mutate({});
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateCustomType(): Promise<FakeResponse> {
    return this.mutate({});
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async insertSlice(): Promise<FakeResponse> {
    return this.mutate();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateSlice(): Promise<FakeResponse> {
    return this.mutate();
  }

  images = {
    // eslint-disable-next-line @typescript-eslint/require-await
    createAcl: async () => {
      return {
        status: 200,
        json() {
          return {};
        },
      };
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    deleteFolder: async () => {
      return { status: 200 };
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    post: async () => {
      return { status: 200 };
    },
  };

  isFake() {
    return true;
  }
}
