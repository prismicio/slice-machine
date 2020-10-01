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

    const req = { query: { lib: 'vue-essential-slices' } };
    const res = {
      json: jest.fn(),
      send: jest.fn(),
      error: jest.fn(),
    };

    await library(req, res);
    expect(res.error).not.toBeCalled();
    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();

    jest.unmock('node-fetch');
  });

  // to-do: test errors
});
