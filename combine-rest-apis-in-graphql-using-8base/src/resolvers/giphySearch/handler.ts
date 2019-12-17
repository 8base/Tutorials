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
 *    giphySearch:
 *      ...
 * 
 * Data that is sent to this function can be accessed on the event argument at:
 *  event.data[KEY_NAME]
 *
 * To invoke this function locally, run:
 *  8base invoke-local giphySearch -p src/resolvers/giphySearch/mocks/request.json
 */
import axios from 'axios';

const transformKey = (obj, path, newKey) => {
  if (path.length === 1) {
    obj[newKey] = obj[path]
    delete obj[path];
    return
  }
  return transformKey(obj[path[0]], path.slice(1), newKey)
}

export default async (event: any, ctx: any) : Promise<any> => {
  const { 
    search, 
    limit,
    lang = 'en',
    offset = 20,
    rating = 'G',
  } = event.data;

  let resp;

  try {
    resp = await axios.get([
      'https://api.giphy.com/v1/gifs/search?',
      `api_key=${process.env.GIPHY_API_TOKEN}&`,
      `q=${search}&`,
      `limit=${limit}&`,
      `offset=${offset}&`,
      `rating=${rating}&`,
      `lang=${lang}`].join('')
    )
  } catch(e) {
    console.log('Error: ', e);

    return {
      error: [e]
    }
  }

  resp.data.data.forEach(image => transformKey(image, ['images', '480w_still'], 'four80_w_still'))

  console.log({
    pagination: resp.data.pagination,
    analytics: resp.data.analytics,
    count: resp.data.length,
    results: resp.data
  })

  return {
    data: {
      pagination: resp.data.pagination,
      count: resp.data.data.length,
      results: resp.data.data
    }
  };
};