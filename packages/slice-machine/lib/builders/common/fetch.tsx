export interface FetchParams {
  method: "POST" | "GET";
  body?: string | FormData;
  headers?: {
    [key: string]: string;
  };
}

export interface DataParams {
  onLoad?: object;
  onResponse?: object;
}

export interface FetchInput {
  url: string;
  params?: FetchParams;
  setData(data: object): void;
  data?: DataParams;
  successMessage?: string;
  errorMessage?: string;
  onSuccess(jsResponse: object | string): void;
}

export const fetchApi = ({
  url,
  params = { method: "GET" },
  setData,
  data = {},
  successMessage,
  errorMessage,
  onSuccess,
}: FetchInput): Promise<void> => {
  setData({
    loading: true,
    done: false,
    error: null,
    status: null,
    ...(data.onLoad ? data.onLoad : {}),
  });

  return fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...params,
  }).then(async (res) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const jsonResponse = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { err, reason, warning, status } = jsonResponse;
    if (res.status > 209) {
      return setData({
        loading: false,
        done: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: err,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: errorMessage || reason,
        ...(data.onResponse ? data.onResponse : {}),
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!warning,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: warning || successMessage || reason,
      ...(data.onResponse ? data.onResponse : {}),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    onSuccess(jsonResponse);
  });
};
