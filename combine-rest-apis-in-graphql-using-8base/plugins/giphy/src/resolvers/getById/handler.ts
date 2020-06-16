/**
 * This file was generated using 8base CLI.
 * 
 * To learn more about writing custom GraphQL resolver functions, visit
 * the 8base documentation at:
 * 
 * https://docs.8base.com/8base-console/custom-functions/resolvers
 *
 * To update this functions invocation settings, update its configuration block
 * in the projects 8base.yml file:
 *  functions:
 *    getById:
 *      ...
 * 
 * Data that is sent to this function can be accessed on the event argument at:
 *  event.data[KEY_NAME]
 *
 * To invoke this function locally, run:
 *  8base invoke-local getById -p src/resolvers/getById/mocks/request.json
 */
import axios from 'axios';
import transformKey from '../../shared/transformKey';

export default async (event: any, ctx: any) : Promise<any> => {
  const { id } = event.data;

  let resp;

  try {
    resp = await axios.get([
      `https://api.giphy.com/v1/gifs/${id}?`,
      `api_key=${process.env.GIPHY_API_TOKEN}&`
    ].join(''))
  } catch(e) {
    console.log('Error: ', e);

    return {
      error: [e]
    }
  }

  transformKey(resp.data.data, ['images', '480w_still'], 'four80_w_still')

  return {
    data: resp.data.data
  };
};