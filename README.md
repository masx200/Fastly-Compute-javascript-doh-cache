# Empty Starter Kit for JavaScript

[![Deploy to Fastly](https://deploy.edgecompute.app/button)](https://deploy.edgecompute.app/deploy)

An empty application template for the Fastly Compute environment which returns a
200 OK response.

**For more details about other starter kits for Compute, see the
[Fastly developer hub](https://developer.fastly.com/solutions/starters)**

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting
security-related issues.

# 启动服务

`npm run dev`

# 设置上游服务器的地址

在resources的secret-stores里面设置名称为"Fastly-Compute-javascript-doh-cache"的`secret stores`里面的"DOH_ENDPOINT"为"https://doh.pub/dns-query"

访问"http://127.0.0.1:7676/dns-query"使用doh服务
