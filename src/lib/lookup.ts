import puppeteer, { Browser } from "puppeteer";
import { Resource } from "sst";

const TwoCaptcha = require("@2captcha/captcha-solver");
const solver = new TwoCaptcha.Solver(Resource.TwoCaptchaApiKey.value);

const cleaned = (text) =>
  text
    .replace(/[\t\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const lookup = async (vehicleNo: string) => {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();

    const page = await browser.newPage();

    const lookupUrl = Resource.LookupUrl.value;
    await page.goto(lookupUrl, { waitUntil: "networkidle0" });

    await page.type("input[name='vehicleNo']", vehicleNo);
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

    const model = await page.$eval(
      ".dt-payment-dtls div.col-xs-5 div > p",
      (element) => element.textContent,
    );

    const expiryDate = await page.$eval(
      "p.vrlDT-content-p",
      (element) => element.textContent,
    );

    return {
      vehicleNo,
      model: cleaned(model),
      expiryDate: cleaned(expiryDate),
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
