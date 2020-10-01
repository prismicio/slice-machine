const { bootstrap } = require('../../api');
const response = require('../../__stubs__/library-fetch-vue-essential-slices.json')

describe('bootstrap', () => {
  it('should work', async () => {
    const req = { query: {}};
    const res = {
      json: jest.fn(),
      send: jest.fn(),
      error: jest.fn(),
    };

    jest.mock('node-fetch');
    const fetch = require('node-fetch');
    fetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response)
    });

    global.console.error = jest.fn();

    await bootstrap(req, res);
    
    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();
    expect(res.error).not.toBeCalled();
    expect(res.send).not.toBeCalled();
    expect(global.console.error).not.toBeCalled();
    
    jest.unmock('node-fetch');
  })

  // to-do: test other arguments, and errors;
});