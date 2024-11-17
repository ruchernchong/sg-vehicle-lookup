/// <reference path="./.sst/platform/config.d.ts" />

import { ENV } from "@/config";

const DOMAIN_NAME = "sgcarplatechecksum.app";

const DOMAIN = {
  dev: { name: `dev.api.${DOMAIN_NAME}` },
  staging: { name: `staging.api.${DOMAIN_NAME}` },
  prod: { name: `api.${DOMAIN_NAME}` },
};

export default $config({
  app(input) {
    return {
      name: "sg-vehicle-lookup",
      removal: input?.stage === ENV.PROD ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        },
        cloudflare: true,
      },
    };
  },
  async run() {
    const LOOKUP_URL = new sst.Secret("LookupUrl", process.env.LOOKUP_URL);
    const TWO_CAPTCHA_API_KEY = new sst.Secret(
      "TwoCaptchaApiKey",
      process.env.TWO_CAPTCHA_API_KEY,
    );

    const hono = new sst.aws.Function("Hono", {
      handler: "src/index.handler",
      link: [LOOKUP_URL, TWO_CAPTCHA_API_KEY],
      environment: {
        TZ: "Asia/Singapore",
      },
      memory: "4096 MB",
      timeout: "1 minute",
      url: true,
      nodejs: {
        install: ["@sparticuz/chromium"],
      },
    });

    new sst.aws.Router("SGVehicleLookupApi", {
      domain: {
        ...DOMAIN[$app.stage],
        dns: sst.cloudflare.dns(),
      },
      routes: {
        "/*": hono.url,
      },
    });
  },
});
