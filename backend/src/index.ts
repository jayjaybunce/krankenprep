export interface Env {
  KRANKENPREP_BACKEND: DurableObjectNamespace;
}

export class KrankenPrepBackend {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    // This class represents the container-backed Durable Object
    // The actual logic runs in your Go container
    return new Response("Container backend", { status: 200 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Get the container instance
    const id = env.KRANKENPREP_BACKEND.idFromName("backend-instance");
    const stub = env.KRANKENPREP_BACKEND.get(id);

    // Forward the request to the container
    return stub.fetch(request);
  },
};
