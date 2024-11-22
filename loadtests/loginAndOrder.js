import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response


 
  sleep(1.5)
  const vars = {};

  // Login
  response = http.put(
    'https://pizza-service.ethankaloi-cs329.com/api/auth',
    '{"email":"ekaloi123@gmail.com","password":"PaPvRV4s3yYqUQA"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        dnt: '1',
        origin: 'https://pizza.ethankaloi-cs329.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
    console.log(response.body);
    fail('Login was *not* 200');
  }

 const token = jsonpath.query(response.json(), '$.token')[0];
 if (!token) {
  fail('Token was not retrieved from the response');
}
vars['token1'] = token;


  sleep(2.1)

  response = http.get('https://pizza-service.ethankaloi-cs329.com/api/order/menu', {
    headers: {
      accept: '*/*',
      authorization: `Bearer ${vars['token1']}`,
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      dnt: '1',
      'if-none-match': 'W/"1fc-cgG/aqJmHhElGCplQPSmgl2Gwk0"',
      origin: 'https://pizza.ethankaloi-cs329.com',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })


  response = http.get('https://pizza-service.ethankaloi-cs329.com/api/franchise', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      dnt: '1',
      'if-none-match': 'W/"40-EPPawbPn0KtYVCL5qBynMCqA1xo"',
      origin: 'https://pizza.ethankaloi-cs329.com',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })

  sleep(1)

  response = http.post(
    'https://pizza-service.ethankaloi-cs329.com/api/order',
    '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
    {
      headers: {
        accept: '*/*',
        authorization: `Bearer ${vars['token1']}`,
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        dnt: '1',
        origin: 'https://pizza.ethankaloi-cs329.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
    console.log(response.body);
    fail('Order was *not* 200');
  }


  sleep(1.5)


vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0];
const payload = {
    jwt: vars['jwt'] // Ensure this is a properly encoded JWT
};

response = http.post(
  'https://pizza-factory.cs329.click/api/order/verify',
  JSON.stringify(payload),
  {
    headers: {
      accept: '*/*',
       authorization: `Bearer ${vars['token1']}`,
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      dnt: '1',
      origin: 'https://pizza.ethankaloi-cs329.com',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
    },
  }
)
console.log(response);

}