import nock from 'nock';
import axios from 'axios';
import * as t from 'io-ts';
import { getAndValidateResponse } from '../../src/utils';

describe('Utils - getAndValidateResponse', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should get the ressource and validate the payload', async () => {
    const url = "https://fakeWebsite.com";
    const expectedResult = "Amazing"
    
    nock(url)
      .get("/")
      .reply(200, expectedResult);

    
    await expect(getAndValidateResponse<string>(
      axios.get(url),
      "fakeRessource",
      t.string
    )).resolves.toBe(expectedResult);
  });

  it('should get the ressource but not validate the payload', async () => {
    const url = "https://fakeWebsite.com";
    const expectedResult = "Amazing"
    
    nock(url)
      .get("/")
      .reply(200, expectedResult);

    
    await expect(getAndValidateResponse<number>(
      axios.get(url),
      "fakeRessource",
      t.number
    )).rejects.toContain("Unable to parse");
  });

  it('should fail to the ressource the ressource', async () => {
    const url = "https://fakeWebsite.com";
    
    nock(url)
      .get("/")
      .reply(404);

    
    await expect(getAndValidateResponse<number>(
      axios.get(url),
      "fakeRessource",
      t.number
    )).rejects.toContain("Unable to retrieve");
  });
});