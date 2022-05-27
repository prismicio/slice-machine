export function FetchMock(
  expectedUrl: string,
  status: number = 200,
  defaultValue: Record<string, unknown> = {}
) {
  global.fetch = jest.fn((url: RequestInfo | URL) => {
    return url === expectedUrl
      ? Promise.resolve({
          status: status,
          json: () => Promise.resolve(defaultValue),
        })
      : Promise.resolve({
          status: 500,
          json: () => Promise.resolve(defaultValue),
        });
  }) as any;
}
