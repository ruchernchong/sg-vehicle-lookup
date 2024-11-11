/// <reference path="./.sst/platform/config.d.ts" />
import { ENV } from "./src/config";

export default $config({
  app(input) {
    return {
      name: "sg-carplate-checksum",
      removal: input?.stage === ENV.PROD ? "retain" : "remove",
      home: "cloudflare",
    };
  },
  async run() {
    const hono = new sst.cloudflare.Worker("Hono", {
      url: true,
      handler: "src/index.ts",
    });

    return {
      api: hono.url,
    };
  },
});
