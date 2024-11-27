import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { Resource } from "sst";
import { Solver } from "@2captcha/captcha-solver";
import { normaliseWhitespace } from "@/utils/normaliseWhitespace";

const solver = new Solver(Resource.TwoCaptchaApiKey.value);

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
      dumpio: true,
    });

    const page = await browser.newPage();
    page.on("request", (req) => {
      console.log("Request:", req.url(), req.postData());
    });
    page.on("response", (res) => {
      console.log("Response:", res.url(), res.status());
    });

    const lookupServiceUrl = Resource.LookupServiceUrl.value;
    await page.goto(lookupServiceUrl, { waitUntil: "networkidle0" });

    await page.type("input[name='vehicleNo']", vehicleNumber);
    await page.click("input[name='agreeTC']");

    // Solve reCAPTCHA
    const siteKey = await page.$eval(".g-recaptcha", (el) =>
      el.getAttribute("data-sitekey"),
    );
    const action = await page.$eval(".g-recaptcha", (el) =>
      el.getAttribute("data-action"),
    );

    try {
      console.log("Solving reCaptcha");
      const result = await solver.recaptcha({
        enterprise: 1,
        pageurl: lookupServiceUrl,
        googlekey: siteKey,
        version: "v3",
        min_score: 0.4,
        action,
      });

      if (!result.data) {
        throw new Error("Failed to solve reCAPTCHA");
      }

      if (result) {
        console.log("reCaptcha Result:", result);
        await solver.goodReport(result.id);
        console.log("reCaptcha solved successfully.");
      }

      await page.evaluate((captchaResponse) => {
        let input = document.querySelector(
          "input[name='g-recaptcha-response']",
        );
        if (!input) {
          input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", "g-recaptcha-response");
          document.querySelector("form")?.appendChild(input);
        }

        (input as HTMLInputElement).value = captchaResponse;
        (window as any).grecaptchaResponse = captchaResponse;
      }, result.data);
    } catch (e) {
      await solver.badReport(e);
      console.error(e);
    } finally {
      const balance = await solver.balance();
      console.log("2Captcha Balance", balance);
    }

    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        console.log("Form action:", form.action);
        console.log("Form data:", new FormData(form));
      }
    });

    await Promise.all([
      page.click("#btnNext"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    const error = await page.$eval(
      ".dt-error-msg-list",
      ({ textContent }) => textContent,
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
    console.error("Error during lookup:", e);
    throw e;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
