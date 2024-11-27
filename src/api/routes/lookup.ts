import { Hono } from "hono";
import { lookup } from "@/lib/lookup";
import { Client, Receiver } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN });

const lookupRoutes = new Hono();

lookupRoutes.post("/", async (c) => {
  const update = await c.req.json();

  const response = await qstash.publishJSON({
    url: `${process.env.BACKGROUND_JOB_URL}/lookup/process`,
    body: update,
    retries: 0,
  });

  console.log(response);

  return c.json(response);
});

lookupRoutes.post("/process", async (c) => {
  const hours = new Date().getHours();

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  const signature = c.req.header("upstash-signature");
  const body = await c.req.text();

  const isValid = await receiver.verify({
    body,
    signature,
  });

  if (!isValid) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const { chatId, vehicleNo } = JSON.parse(body);

  if (hours >= 0 && hours < 6) {
    return c.json({
      message: "Service unavailable between 12 AM and 6 AM SGT.",
    });
  }

  try {
    const result = await lookup(vehicleNo);
    console.log(result);

    if (!result) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `No vehicle details found for ${vehicleNo}`,
          }),
        },
      );

      return c.json({ message: "No vehicle details found." });
    }

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: JSON.stringify(result, null, 2),
        }),
      },
    );

    return c.json({
      message: "Vehicle lookup is successful.",
      data: result,
    });
  } catch (e) {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Error occurred while looking up vehicle details for ${vehicleNo}`,
        }),
      },
    );
    return c.json({ message: e.message }, 500);
  }
});

export { lookupRoutes };
