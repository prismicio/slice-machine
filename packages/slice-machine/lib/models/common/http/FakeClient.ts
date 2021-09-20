export interface FakeResponse {
  status: number;
  statusText: string;
  fake: boolean;
  json: () => [];
  error?: string;
  text?: () => "";
}

export default class FakeClient {
  private mutate: (
    jsonResponse?: any
  ) => {
    status: number;
    statusText: string;
    fake: boolean;
    err: string;
    json: () => any;
  };

  constructor() {
    this.mutate = (jsonResponse = []) => ({
      status: 403,
      statusText: "Unauthorized",
      fake: true,
      err: "You are not connected to Prismic",
      json() {
        return jsonResponse;
      },
    });
  }

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

  async insertCustomType(): Promise<FakeResponse> {
    return this.mutate({});
  }

  async updateCustomType(): Promise<FakeResponse> {
    return this.mutate({});
  }

  async insertSlice(): Promise<FakeResponse> {
    return this.mutate();
  }

  async updateSlice(): Promise<FakeResponse> {
    return this.mutate();
  }

  images = {
    createAcl: async () => {
      return {
        status: 200,
        json() {
          return {};
        },
      };
    },
    deleteFolder: async () => {
      return { status: 200 };
    },
    post: async () => {
      return { status: 200 };
    },
  };

  isFake() {
    return true;
  }
}
