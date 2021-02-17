const { frameworks } = require('../../api');

describe('frameworks', () => {
  it('should work', async () => {
    const event = {};

    const result = await frameworks(event);
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(body).toMatchSnapshot()
  });

  // to-do: try different input params
});
 