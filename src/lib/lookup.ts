import puppeteer, { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { Resource } from "sst";
import { Solver } from "@2captcha/captcha-solver";
import { findRecaptchaClients } from "@/utils/findRecaptchaClients";
import { normaliseWhitespace } from "@/utils/normaliseWhitespace";

const solver = new Solver(Resource.TwoCaptchaApiKey.value);

const solveV2Recaptcha = async (client: any, lookupServiceUrl: string) => {
  console.log("Solving ReCaptcha V2...");

  try {
    const result = await solver.recaptcha({
      enterprise: 0,
      pageurl: lookupServiceUrl,
      googlekey: client.sitekey,
      version: "v2",
      min_score: undefined,
      action: undefined,
    });

    if (!result.data) {
      await solver.badReport(result.id);
      throw new Error("Failed to solve reCAPTCHA V2");
    }

    await solver.goodReport(result.id);
    console.log("Successfully solved ReCaptcha V2.");

    return result.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const solveV3Recaptcha = async (client: any, lookupServiceUrl: string) => {
  console.log("Solving ReCaptcha V3 Enterprise...");

  try {
    const result = await solver.recaptcha({
      enterprise: 1,
      pageurl: lookupServiceUrl,
      googlekey: client.sitekey,
      version: "v3",
      min_score: 0.4,
      action: "submit",
    });

    if (!result.data) {
      await solver.badReport(result.id);
      throw new Error("Failed to solve reCAPTCHA V3");
    }

    await solver.goodReport(result.id);
    console.log("Successfully solved ReCaptcha V3 Enterprise.");

    return result.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const handleRecaptcha = async (page: Page, lookupServiceUrl: string) => {
  const clients = await page.evaluate(findRecaptchaClients);
  const v2Client = clients.find((c) => c.version === "V2");
  const v3Client = clients.find((c) => c.version === "V3");

  if (!v2Client || !v3Client) {
    throw new Error("Both V2 and V3 recaptcha clients are required");
  }

  try {
    const [v2Token, v3Token] = await Promise.all([
      solveV2Recaptcha(v2Client, lookupServiceUrl),
      solveV3Recaptcha(v3Client, lookupServiceUrl),
    ]);

    await page.evaluate((token) => {
      let input = document.querySelector("input[name='g-recaptcha-response']");
      if (!input) {
        input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "g-recaptcha-response");
        document.querySelector("form")?.appendChild(input);
      }

      (input as HTMLInputElement).value = token;
      (window as any).grecaptchaResponse = token;
    }, v3Token);

    await page.evaluate((token) => {
      (window as any).recaptchaSubmit(token);
    }, v2Token);
  } catch (e) {
    throw e;
  }
};

/**
 * Looks up vehicle information by plate number
 *
 * @param vehicleNumber - License plate number to look up
 * @returns Vehicle information if found, undefined otherwise
 * @throws Error if lookup fails after all retries
 */
export const lookup = async (vehicleNumber: string) => {
  let browser: Browser | null = null;

  process.env.PUPPETEER_CACHE_DIR = "/tmp/.puppeteer";

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.SST_DEV
        ? "/tmp/localChromium/chrome/mac_arm-131.0.6778.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
        : await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const lookupServiceUrl = Resource.LookupServiceUrl.value;
    await page.goto(lookupServiceUrl, { waitUntil: "networkidle0" });

    await page.type("input[name='vehicleNo']", vehicleNumber);
    await page.click("input[name='agreeTC']");

    try {
      await handleRecaptcha(page, lookupServiceUrl);
    } finally {
      const balance = await solver.balance();
      console.log("2Captcha Balance", balance);
    }

    await Promise.all([
      page.click("#btnNext"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    const error = await page.$eval(".dt-error-msg-list", ({ textContent }) =>
      textContent.trim(),
    );
    console.log(error);

    await page.waitForSelector(".dt-payment-dtls");

    let model: string, expiryDate: string;
    model = await page.$eval(
      ".dt-payment-dtls div.col-xs-5 div > p",
      ({ textContent }) => textContent,
    );
    expiryDate = await page.$eval(
      "p.vrlDT-content-p",
      ({ textContent }) => textContent,
    );

    if (!model || !expiryDate) return;

    return {
      vehicleNumber,
      vehicleModel: normaliseWhitespace(model),
      roadTaxExpiry: normaliseWhitespace(expiryDate),
    };
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
