// src/components/currency-converter/index.tsx

import {
  component$,
  Resource,
  useResource$,
  useSignal,
  $,
} from "@builder.io/qwik";
import * as v from "valibot";
import { ExchangeRateResponseSchema } from "./Shemas";

// Types pour l'API
interface ExchangeRateResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  time_eol_unix: number;
  base_code: string;
  rates: Record<string, number>;
}

export default component$(() => {
  // Signal pour stocker les taux de change
  const exchangeRates = useSignal<ExchangeRateResponse | null>(null);

  // Signal pour le montant à convertir
  const amount = useSignal<number>(1000);

  // Signal pour la devise source (par défaut COP)
  const fromCurrency = useSignal<string>("COP");

  // Signal pour la devise cible
  const toCurrency = useSignal<string>("USD");

  // Ressource pour charger les taux de change
  const ratesResource = useResource$(async () => {
    // track permet de surveiller les dépendances si nécessaire
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/COP");
      const data = v.parse(ExchangeRateResponseSchema, await response.json());

      if (data.result === "success") {
        exchangeRates.value = data;
        return data;
      }
      throw new Error("Erreur lors du chargement des taux");
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  });

  // Fonction pour convertir le montant
  const convertCurrency = $(
    (amount: number, from: string, to: string): number => {
      if (!exchangeRates.value?.rates) return 0;

      const rates = exchangeRates.value.rates;

      // Si la devise de base est COP
      if (from === "COP") {
        return amount * (rates[to] || 0);
      }

      // Conversion via COP comme base
      const copAmount = from === "COP" ? amount : amount / (rates[from] || 1);
      return to === "COP" ? copAmount : copAmount * (rates[to] || 0);
    },
  );

  return (
    <div class="currency-converter">
      <h2>Convertisseur de devises (COP)</h2>

      {/* Indicateur de chargement */}
      <Resource
        value={ratesResource}
        onPending={() => (
          <div class="loading">Chargement des taux de change...</div>
        )}
        onRejected={(error) => (
          <div class="error">
            Erreur: {error.message}
            <button type="button" onClick$={() => ratesResource.retry()}>Réessayer</button>
          </div>
        )}
        onResolved={(data) => (
          <div class="converter-form">
            <div class="rates-info">
              <p>Dernière mise à jour: {data.time_last_update_utc}</p>
              <p>Prochaine mise à jour: {data.time_next_update_utc}</p>
            </div>

            <div class="input-group">
              <label htmlFor="amount-input">Montant:</label>
              <input id="amount-input" type="number" bind:value={amount} min="0" step="0.01" />
            </div>

            <div class="input-group">
              <label htmlFor="from-currency-select">De:</label>
              <select id="from-currency-select" bind:value={fromCurrency}>
                <option value="COP">COP - Peso colombien</option>
                <option value="USD">USD - Dollar américain</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Livre sterling</option>
                {/* Ajouter d'autres devises selon les besoins */}
              </select>
            </div>

            <div class="input-group">
              <label htmlFor="to-currency-select">Vers:</label>
              <select id="to-currency-select" bind:value={toCurrency}>
                <option value="USD">USD - Dollar américain</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Livre sterling</option>
                <option value="COP">COP - Peso colombien</option>
                {/* Ajouter d'autres devises selon les besoins */}
              </select>
            </div>

            <div class="result">
              <h3>Résultat:</h3>
              <p class="converted-amount">
                {amount.value.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {fromCurrency.value} ={" "}
                {convertCurrency(
                  amount.value,
                  fromCurrency.value,
                  toCurrency.value,
                ).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {toCurrency.value}
              </p>
            </div>

            {/* Tableau des taux */}
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
                  {Object.entries(data.rates)
                    .filter(([code]) =>
                      [
                        "USD",
                        "EUR",
                        "GBP",
                        "JPY",
                        "CAD",
                        "AUD",
                        "CHF",
                      ].includes(code),
                    )
                    .map(([code, rate]) => (
                      <tr key={code}>
                        <td>{code}</td>
                        <td>{rate.toFixed(6)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      />
    </div>
  );
});
