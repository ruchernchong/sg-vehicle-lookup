/// <reference path="./.sst/platform/config.d.ts" />
import { ENV } from "@/config";

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
      },
    };
  },
  async run() {
    const LOOKUP_URL = new sst.Secret("LookupUrl", process.env.LOOKUP_URL);
    const TWO_CAPTCHA_API_KEY = new sst.Secret(
      "TwoCaptchaApiKey",
      process.env.TWO_CAPTCHA_API_KEY,
    );

    new sst.aws.Function("Hono", {
      handler: "src/index.handler",
      link: [LOOKUP_URL, TWO_CAPTCHA_API_KEY],
      timeout: "30 seconds",
      url: true,
    });
  },
});
