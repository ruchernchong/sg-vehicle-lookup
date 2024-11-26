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
    const LOOKUP_SERVICE_URL = new sst.Secret(
      "LookupServiceUrl",
      process.env.LOOKUP_SERVICE_URL,
    );
    const TWO_CAPTCHA_API_KEY = new sst.Secret(
      "TwoCaptchaApiKey",
      process.env.TWO_CAPTCHA_API_KEY,
    );

    const hono = new sst.aws.Function("Hono", {
      handler: "src/index.handler",
      link: [LOOKUP_SERVICE_URL, TWO_CAPTCHA_API_KEY],
      environment: {
        TZ: "Asia/Singapore",
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        QSTASH_TOKEN: process.env.QSTASH_TOKEN,
        QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
        QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
        BACKGROUND_JOB_URL: process.env.BACKGROUND_JOB_URL,
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
