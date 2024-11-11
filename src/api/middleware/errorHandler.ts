import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json(
    {
      error: {
        message: err.message,
        type: err.name,
        status: 400,
      },
    },
    400,
  );
};
