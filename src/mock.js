import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

const handlers = [
  http.get("/api/hello", () => {
    return HttpResponse.json({
      message: "Hello from msw!",
    });
  }),
];

export const worker = setupWorker(...handlers);
