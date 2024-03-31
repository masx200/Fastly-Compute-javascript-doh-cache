export type FastlyComputeMiddleware = (req: Request, client: {
  address: string;
}, next: () => Promise<Response>) => Promise<Response> | Response;
