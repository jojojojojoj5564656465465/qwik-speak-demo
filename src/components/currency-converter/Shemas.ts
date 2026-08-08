import * as v from "valibot";

export const ExchangeRateResponseSchema = v.strictObject({
  result: v.literal("success"),
  provider: v.pipe(v.string(), v.url()),
  documentation: v.pipe(v.string(), v.url()),
  terms_of_use: v.pipe(v.string(), v.url()),
  time_last_update_unix: v.pipe(v.number(), v.integer()),
  time_last_update_utc: v.pipe(v.string(), v.nonEmpty()),
  time_next_update_unix: v.pipe(v.number(), v.integer()),
  time_next_update_utc: v.pipe(v.string(), v.nonEmpty()),
  time_eol_unix: v.pipe(v.number(), v.integer()),
  base_code: v.literal("COP"),
  rates: v.strictObject({
    USD: v.number(),
    EUR: v.number(),
  }),
});

export type ExchangeRateResponse = v.InferOutput<
  typeof ExchangeRateResponseSchema
>;

export const CurrencySchema = v.picklist(["COP", "USD", "EUR"]);

export type Currency = v.InferOutput<typeof CurrencySchema>;

export const AmountSchema = v.pipe(
  v.number(),
  v.minValue(0, "Amount must be positive"),
);

export type Amount = v.InferOutput<typeof AmountSchema>;

export const CurrencyConverterInputSchema = v.strictObject({
  amount: AmountSchema,
  fromCurrency: CurrencySchema,
  toCurrency: CurrencySchema,
});

export type CurrencyConverterInput = v.InferOutput<
  typeof CurrencyConverterInputSchema
>;
