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
    ...(data.onLoad ? data.onLoad : {}),
  });

  return fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...params,
  }).then(async (res) => {
    const jsonResponse = await res.json();
    const { err, reason, warning } = jsonResponse;
    if (res.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: err,
        message: errorMessage || reason,
        ...(data.onResponse ? data.onResponse : {}),
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!warning,
      message: warning || successMessage || reason,
      ...(data.onResponse ? data.onResponse : {}),
    });
    onSuccess(jsonResponse);
  });
};
