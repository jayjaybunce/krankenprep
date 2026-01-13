import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export class KrankenPrepBackend extends Container {
  defaultPort = 8080; // pass requests to port 8080 in the container
  sleepAfter = "2h"; // only sleep a container if it hasn't gotten requests in 2 hours
}

export default {
  async fetch(request: any, env: any) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/")) {
      // note: "getRandom" to be replaced with latency-aware routing in the near future
      const containerInstance = await getRandom(env.KRANKENPREP_BACKEND, INSTANCE_COUNT);
      await containerInstance.start();
      return containerInstance.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};