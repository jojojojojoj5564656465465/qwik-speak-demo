import {
  $,
  component$,
  Resource,
  useResource$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import * as v from "valibot";
import {
  type Amount,
  type Currency,
  CurrencyConverterInputSchema,
  type ExchangeRateResponse,
  ExchangeRateResponseSchema,
} from "./Shemas";

export default component$(() => {
  const exchangeRates = useSignal<ExchangeRateResponse | null>(null);

  const amount = useSignal<Amount>(1000);

  const fromCurrency = useSignal<Currency>("COP");

  const toCurrency = useSignal<Currency>("USD");

  const validationError = useSignal<string | null>(null);

  useTask$(({ track }) => {
    track(() => [amount.value, fromCurrency.value, toCurrency.value]);

    const result = v.safeParse(CurrencyConverterInputSchema, {
      amount: amount.value,
      fromCurrency: fromCurrency.value,
      toCurrency: toCurrency.value,
    });

    if (result.success) {
      validationError.value = null;
    } else {
      validationError.value = result.issues.map((i) => i.message).join(", ");
    }
  });

  const ratesResource = useResource$(async () => {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/COP");
      const json: unknown = await response.json();
      const result = v.safeParse(ExchangeRateResponseSchema, json);

      if (!result.success) {
        console.error(result.issues);
        throw new Error("API invalide");
      }

      const data = result.output;
      exchangeRates.value = data;
      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  });

  const formatNumber = $(
    (value: Amount | number) =>
      Number(value).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  );

  const convertCurrency = $(
    (amount: Amount, from: Currency, to: Currency): number => {
      if (!exchangeRates.value?.rates) return 0;
      if (from === to) return amount;

      const rates = exchangeRates.value.rates;
      const amountInCOP = from === "COP" ? amount : amount / rates[from];

      return to === "COP" ? amountInCOP : amountInCOP * rates[to];
    },
  );

  return (
    <div class="currency-converter">
      <h2>Convertisseur de devises (COP)</h2>

      <Resource
        value={ratesResource}
        onPending={() => (
          <div class="loading">Chargement des taux de change...</div>
        )}
        onRejected={(error) => (
          <div class="error">
            Erreur: {error.message}
            <button type="button" onClick$={() => ratesResource.retry()}>
              Réessayer
            </button>
          </div>
        )}
        onResolved={(data) => {
          const convertedAmount = convertCurrency(
            amount.value,
            fromCurrency.value,
            toCurrency.value,
          );

          return (
            <div class="converter-form">
              <div class="rates-info">
                <p>Dernière mise à jour: {data.time_last_update_utc}</p>
                <p>Prochaine mise à jour: {data.time_next_update_utc}</p>
              </div>

              {validationError.value && (
                <div class="error">{validationError.value}</div>
              )}

              <div class="input-group">
                <label for="amount-input">Montant:</label>
                <input
                  id="amount-input"
                  type="number"
                  bind:value={amount}
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="input-group">
                <label for="from-currency-select">De:</label>
                <select id="from-currency-select" bind:value={fromCurrency}>
                  <option value="COP">COP - Peso colombien</option>
                  <option value="USD">USD - Dollar américain</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div class="input-group">
                <label for="to-currency-select">Vers:</label>
                <select id="to-currency-select" bind:value={toCurrency}>
                  <option value="USD">USD - Dollar américain</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="COP">COP - Peso colombien</option>
                </select>
              </div>

              <div class="result">
                <h3>Résultat:</h3>
                <p class="converted-amount">
                  {formatNumber(amount.value)} {fromCurrency.value} ={" "}
                  {formatNumber(convertedAmount)} {toCurrency.value}
                </p>
              </div>

              <div class="rates-table">
                <h3>Taux de change disponibles:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Devise</th>
                      <th>Taux (1 COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.rates).map(([code, rate]) => (
                      <tr key={code}>
                        <td>{code}</td>
                        <td>{rate.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});
