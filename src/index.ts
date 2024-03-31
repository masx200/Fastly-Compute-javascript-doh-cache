// import * as cachecontrol from "@tusbar/cache-control";
// import { env } from "fastly:env";
//const welcomePage = includeBytes("./src/welcome-to-compute.html");
// import { includeBytes } from "fastly:experimental";
async function handler(event: FetchEvent) {
  // Get the request from the client.
  const req = event.request;

  // Set the host header for backend access
  // Not needed if Overide host configuration of backend is set
  // req.headers.set("Host", "httpbin.org");

  // let isDebug = req.headers.has("Fastly-Debug");

  // const beresp = await fetch(req, {
  //   backend: "origin_0",
  // });

  // Add headers to the response back to the browser
  // beresp.headers.set("content-security-policy", "default-src 'self'");
  // beresp.headers.set("x-frame-options", "SAMEORIGIN");
  // beresp.headers.set("x-xss-protection", "1");
  // beresp.headers.set("x-content-type-options", "nosniff");
  // beresp.headers.set("referrer-policy", "origin-when-cross-origin");

  // Remove headers from the response before sending it back to the browser
  // if (!isDebug) {
  //   beresp.headers.delete("server");
  //   beresp.headers.delete("x-powered-by");
  //   beresp.headers.delete("via");
  //   beresp.headers.delete("x-served-by");
  //   beresp.headers.delete("x-cache");
  //   beresp.headers.delete("x-cache-hits");
  //   beresp.headers.delete("x-timer");
  // }

  // let cacheControlObj = cachecontrol.parse(beresp.headers.get("cache-control"));
  // if (cacheControlObj["maxAge"] != null) {
  //   beresp.headers.delete("expires");
  // }
  const beresp = handlerMain(req);
  beresp.headers.append(`Alt-Svc`, `h2=":443"; ma=188600`);
  beresp.headers.append(`Alt-Svc`, `h3=":443"; ma=188600`);
  return beresp;
}

addEventListener(
  "fetch",
  //@ts-ignore
  (event: FetchEvent) => event.respondWith(handler(event)),
);
export function handlerMain(req: Request): Response {
  const { url, headers, method } = req;
  const response_headers = {
    "Strict-Transport-Security": "max-age=31536000",
    "content-type": "application/json",
  };
  const status = 200;
  const data = {
    // connInfo,
    request: {
      url,
      method,
      headers: Object.fromEntries(headers),
    },
    //  response: { status: status, headers: response_headers },
  };

  const body = JSON.stringify(data);
  // console.log("request", data);
  const response = new Response(body, {
    status: status,
    headers: response_headers,
  });
  response.headers.append(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains",
  );
  // console.log(response, { url, method });

  console.log(
    JSON.stringify(
      {
        // connInfo,
        request: { url, method, headers: Object.fromEntries(headers) },
        // response: {
        //     status: response.status,
        //     headers: Object.fromEntries(response.headers),
        // },
      },
      null,
      4,
    ),
  );
  return response;
}
