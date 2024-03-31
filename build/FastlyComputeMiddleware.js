export async function Strict_Transport_Security(...[request, env, next]) {
    // console.log(2);
    const response = await next();
    const headers = new Headers(response.headers);
    headers.append("Strict-Transport-Security", "max-age=31536000");
    // console.log(ctx.response.body);
    // 必须把响应的主体转换为Uint8Array才行
    const body = response.body && (await bodyToBuffer(response.body));
    // headers.delete("content-length");
    const res = new Response(body, {
        status: response.status,
        headers,
    });
    return res;
}
export async function bodyToBuffer(body) {
    return new Uint8Array(await new Response(body).arrayBuffer());
}
