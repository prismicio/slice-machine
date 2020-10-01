const { frameworks } = require('../../api');

describe('frameworks', () => {
  it('should work', async () => {
    const req = { query: {} };
    const res = { json : jest.fn() };

    await frameworks(req, res);
    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();
  });

  // to-do: try different input params
});
 