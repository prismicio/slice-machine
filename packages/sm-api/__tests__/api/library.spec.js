const { library } = require('../../api');
const response = require('../../__stubs__/library-fetch-vue-essential-slices.json');

describe('library', () => {
  it('should fetch vue-essential-slices', async () => {
    jest.mock('node-fetch');
    const fetch = require('node-fetch')

    fetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response)
    });

    const event = { queryStringParameters: { lib: 'vue-essential-slices' } };

    const result = await library(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(body).toMatchSnapshot();

    jest.unmock('node-fetch');
  });

  // to-do: test errors
});
