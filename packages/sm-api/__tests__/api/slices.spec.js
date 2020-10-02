
describe('slices', () => {
  it('should work', async () => {
    const event = { queryStringParameters: { /* lib, library, framework = 'nuxt' */ } };

    jest.mock('../../common/mongo', () => ({
      collections: {
        libraries: () => ({
          toArray: () => require('../../__stubs__/libraries-mongo-libraries.json'),
        }),
      },
    }));
    
    const { slices } = require('../../api');

    const result = await slices(event);

    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(body).toMatchSnapshot();
  })
});
