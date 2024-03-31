import * as cachecontrol from "@tusbar/cache-control";

async function handler(event) {
  // Get the request from the client.
  const req = event.request;

  // Set the host header for backend access
  // Not needed if Overide host configuration of backend is set
  req.headers.set("Host", "httpbin.org");

  let isDebug = req.headers.has("Fastly-Debug");

  const beresp = await fetch(req, {
    backend: "origin_0",
  });

  // Add headers to the response back to the browser
  beresp.headers.set("content-security-policy", "default-src 'self'");
  beresp.headers.set("x-frame-options", "SAMEORIGIN");
  beresp.headers.set("x-xss-protection", "1");
  beresp.headers.set("x-content-type-options", "nosniff");
  beresp.headers.set("referrer-policy", "origin-when-cross-origin");
  beresp.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");

  // Remove headers from the response before sending it back to the browser
  if (!isDebug) {
    beresp.headers.delete("server");
    beresp.headers.delete("x-powered-by");
    beresp.headers.delete("via");
    beresp.headers.delete("x-served-by");
    beresp.headers.delete("x-cache");
    beresp.headers.delete("x-cache-hits");
    beresp.headers.delete("x-timer");
  }

  let cacheControlObj = cachecontrol.parse(beresp.headers.get("cache-control"));
  if (cacheControlObj["maxAge"] != null) {
    beresp.headers.delete("expires");
  }

  return beresp;
}

addEventListener("fetch", (event) => event.respondWith(handler(event)));
