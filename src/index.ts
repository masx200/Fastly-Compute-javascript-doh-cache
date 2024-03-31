/// <reference types="@fastly/js-compute" />

import { includeBytes } from "fastly:experimental";
import { Strict_Transport_Security } from "./FastlyComputeMiddleware";
import { getDOH_ENDPOINT } from "./getDOH_ENDPOINT";

// import * as cachecontrol from "@tusbar/cache-control";
// import { env } from "fastly:env";
//const welcomePage = includeBytes("./src/welcome-to-compute.html");
// import { includeBytes } from "fastly:experimental";
async function handler(event: FetchEvent) {
  // Get the request from the client.
  const req = event.request;
  //@ts-ignore
  const { client: { address } } = event;
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
  const beresp = await handlerLogger(req, { address }, async () => {
    return Strict_Transport_Security(req, { address }, async () => {
      return fetchMiddleWare(req, { address });
    });
  });
  beresp.headers.append(`Alt-Svc`, `h2=":443"; ma=188600`);
  beresp.headers.append(`Alt-Svc`, `h3=":443"; ma=188600`);
  return beresp;
}

addEventListener(
  "fetch",
  //@ts-ignore
  (event: FetchEvent) => event.respondWith(handler(event)),
);
export async function handlerLogger(
  req: Request,
  client: { address: string },
  next: () => Promise<Response>,
): Promise<Response> {
  const { url, headers, method } = req;
  // const response_headers = {
  //   "Strict-Transport-Security": "max-age=31536000",
  //   "content-type": "application/json",
  // };
  // const status = 200;
  // const data = {
  //   client,
  //   // connInfo,
  //   request: {
  //     url,
  //     method,
  //     headers: Object.fromEntries(headers),
  //   },
  //   //  response: { status: status, headers: response_headers },
  // };

  // const body = JSON.stringify(data);
  // console.log("request", data);
  const response = await next();
  response.headers.append(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains",
  );
  // console.log(response, { url, method });

  console.log(
    JSON.stringify(
      {
        client,
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
export function base64Encode(byteArray: ArrayBuffer): string {
  const buffer = new Uint8Array(byteArray);
  const binaryString = buffer.reduce(
    (str, byte) => str + String.fromCharCode(byte),
    "",
  );
  const encoded = btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return encoded;
}
const welcome = includeBytes("./src/welcome.html");
async function fetchMiddleWare(
  request: Request,
  env: { address: string },
): Promise<Response> {
  console.log(
    JSON.stringify(
      {
        request: {
          method: request.method,
          url: request.url,
          Headers: Object.fromEntries(request.headers),
        },
      },
      null,
      2,
    ),
  );
  const url = new URL(request.url);
  const nextUrl = new URL(request.url);
  if (nextUrl.pathname === "/") {
    return new Response(welcome, {
      headers: {
        "content-type": "text/html",
      },
    });
  }
  if (url.pathname !== "/dns-query") {
    return new Response("not found", { status: 404 });
  }
  if (request.method === "POST") {
    return handleRequest(request, env);
  }
  if (request.method !== "GET") {
    return new Response("method not allowed", { status: 405 });
  }
  return handleGet(env, url, request);
}

async function handleGet(
  client: { address: string },
  url: URL,
  request: Request,
) {
  const upurl = new URL(`${
    await getDOH_ENDPOINT() ??
      "https://doh.pub/dns-query"
  }`);
  upurl.search = url.search;
  const headers = new Headers(request.headers);
  headers.append(
    "Forwarded",
    `proto=${new URL(url).protocol.slice(0, -1)};host=${
      new URL(url).hostname
    };by=${url.host};for=${client.address}`,
  );
  const getRequest = new Request(upurl.href, {
    method: "GET",
    body: null,
    headers: headers,
  });
  console.log(
    JSON.stringify(
      {
        request: {
          method: getRequest.method,
          url: getRequest.url,
          Headers: Object.fromEntries(getRequest.headers),
        },
      },
      null,
      2,
    ),
  );
  // Fetch response from origin server.
  return await fetch(getRequest, {
    // cf: {
    //   cacheEverything: true,
    // },
  });
}

/**
 * 处理DNS请求的函数。
 * @param request 原始的请求对象，需要是一个POST请求，其中包含未编码的DNS查询。
 * @param env 包含环境配置的对象，例如DOH_ENDPOINT（DNS over HTTPS 终端）的URL。
 * @returns 返回一个Promise，该Promise解析为从原始服务器获取的响应。
 */
async function handleRequest(request: Request, client: { address: string }) {
  // Base64 encode request body.
  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return new Response("bad request", { status: 400 });
  }
  const encodedBody = base64Encode(body);

  // Create a request URL with encoded body as query parameter.
  const url = new URL(`${
    await getDOH_ENDPOINT() ??
      "https://doh.pub/dns-query"
  }`);
  url.searchParams.append("dns", encodedBody);

  if (!url.href.startsWith("https://")) {
    throw Error(`The DOH_ENDPOINT must be a HTTPS URL.`);
  }
  const headers = new Headers(request.headers);
  headers.append(
    "Forwarded",
    `proto=${new URL(request.url).protocol.slice(0, -1)};host=${
      new URL(request.url).hostname
    };by=${new URL(request.url).hostname};for=${client.address}`,
  );
  // Create a GET request from the original POST request.
  const getRequest = new Request(url.href, {
    method: "GET",
    body: null,
    headers: headers,
  });
  console.log(
    JSON.stringify(
      {
        request: {
          method: getRequest.method,
          url: getRequest.url,
          Headers: Object.fromEntries(getRequest.headers),
        },
      },
      null,
      2,
    ),
  );
  // Fetch response from origin server.
  return await fetch(getRequest, {
    // cf: {
    //   cacheEverything: true,
    // },
  });
}
