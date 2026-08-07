import * as v from "valibot";
export const ExchangeRateResponseSchema = v.object({
  result: v.string(),

  provider: v.string(),
  documentation: v.string(),
  terms_of_use: v.string(),

  time_last_update_unix: v.number(),
  time_last_update_utc: v.string(),

  time_next_update_unix: v.number(),

  time_next_update_utc: v.string(),

  time_eol_unix: v.number(),

  base_code: v.string(),

  rates: v.object({
    COP: v.number(),
    USD: v.number(),
    EUR: v.number(),
    GBP: v.number(),
    CAD: v.number(),
    AUD: v.number(),
    CHF: v.number(),
    JPY: v.number(),
  }),
});

export type ExchangeRateResponse = v.InferOutput<typeof ExchangeRateResponseSchema>;