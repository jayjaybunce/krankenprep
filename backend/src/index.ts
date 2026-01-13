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
      await containerInstance.start({
        envVars: {
          DESCOPE_PROJECT_ID: env.DESCOPE_PROJECT_ID,
          DESCOPE_MANAGEMENT_KEY: env.DESCOPE_MANAGEMENT_KEY,
          WCL_CLIENT_ID: env.WCL_CLIENT_ID,
          WCL_SECRET: env.WCL_SECRET,
          DB_HOST: env.DB_HOST,
          DB_PORT: env.DB_PORT,
          DB_USER: env.DB_USER,
          DB_PASSWORD: env.DB_PASSWORD,
          DB_NAME: env.DB_NAME,
        },
      });
      return containerInstance.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};