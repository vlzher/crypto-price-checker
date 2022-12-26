const API_KEY =
  "4afb0518d5d1953fbc80d99670295d1a256c42d4432852c4b27e0ef762272587";

const coins = new Map();

const loadCoins = () => {
  if (coins.size === 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?` +
      new URLSearchParams({
        fsyms: [...coins.keys()].join(","),
        tsyms: "USD",
        api_key: API_KEY,
      })
  )
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrices).forEach(([currency, price]) => {
        const handlers = coins.get(currency) ?? [];
        const correctedPrice =
          price > 1 ? price.toFixed(2) : price.toPrecision(2);
        handlers.forEach((f) => f(correctedPrice));
      });
    });
};

export const subscribeToCoin = (coin, cb) => {
  const subscribers = coins.get(coin.toUpperCase()) || [];
  coins.set(coin.toUpperCase(), [...subscribers, cb]);
};

export const unsubscribeFromCoin = (coin) => {
  coins.delete(coin.toUpperCase());
};

export const getAvailableCoins = async () => {
  return await fetch(
    "https://min-api.cryptocompare.com/data/blockchain/list?" +
      new URLSearchParams({ api_key: API_KEY })
  )
    .then((response) => response.json())
    .then((data) => Object.keys(data.Data));
};

setInterval(loadCoins, 5000);
