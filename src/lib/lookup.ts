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
        ? "/tmp/localChromium/chromium/mac_arm-1383986/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
        : await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const lookupUrl = Resource.LookupUrl.value;
    await page.goto(lookupUrl, { waitUntil: "networkidle0" });

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
        pageurl: lookupUrl,
        googlekey: siteKey,
        version: "v3",
        min_score: 0.4,
        action,
      });

      if (result) {
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
      console.error(e);
      await solver.badReport(e);
    } finally {
      const balance = await solver.balance();
      console.log("2Captcha Balance", balance);
    }

    await Promise.all([
      page.click("#btnNext"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    await page.waitForSelector(".dt-payment-dtls");

    let model: string, expiryDate: string;
    model = await page.$eval(
      ".dt-payment-dtls div.col-xs-5 div > p",
      (element) => element.textContent,
    );
    expiryDate = await page.$eval(
      "p.vrlDT-content-p",
      (element) => element.textContent,
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
