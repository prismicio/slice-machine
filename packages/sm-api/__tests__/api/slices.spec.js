
describe('slices', () => {
  it('should work', async () => {
    const req = { query: { /* lib, library, framework = 'nuxt' */ } };
    const res = {
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.mock('../../common/mongo', () => ({
      collections: {
        libraries: () => ({
          toArray: () => require('../../__stubs__/libraries-mongo-libraries.json'),
        }),
      },
    }));
    
    const { slices } = require('../../api');

    await slices(req, res);

    expect(res.send).not.toBeCalled();
    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();
  })
});
