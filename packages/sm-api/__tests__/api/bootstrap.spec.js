const { bootstrap } = require('../../api');
const response = require('../../__stubs__/library-fetch-vue-essential-slices.json')

describe('bootstrap', () => {
  it('should work', async () => {
    const event = { queryStringParameters: {}};

    jest.mock('node-fetch');
    const fetch = require('node-fetch');
    fetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response)
    });

    global.console.error = jest.fn();

    const result = await bootstrap(event);

    const body = JSON.parse(result.body)
    
    expect(result.statusCode).toBe(200);
    expect(body).toMatchSnapshot();
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(global.console.error).not.toBeCalled();
    
    jest.unmock('node-fetch');
  })

  // to-do: test other arguments, and errors;
});