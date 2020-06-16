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
 *    randomUserResolver:
 *      ...
 * 
 * Data that is sent to this function can be accessed on the event argument at:
 *  event.data[KEY_NAME]
 *
 * To invoke this function locally, run:
 *  8base invoke-local randomUserResolver -p src/resolvers/randomUserResolver/mocks/request.json
 */
import axios from 'axios';

export default async (event: any, ctx: any) : Promise<any> => {
  const { nationality } = event.data;

  let resp;

  try {
    resp = await axios.get(`https://randomuser.me/api/?nat=${nationality}`)
  } catch(e) {
    console.error(e)
    return;
  }

  let {
    id,
    login,
    location,
    registered,
    ...randomUserAttrs
  } = resp.data.results[0]

  return {
    data: randomUserAttrs
  };
};