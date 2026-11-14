# ATR Lot Sizer

Position sizing for forex pairs, metals, oil and indices. Choose a risk percentage, type in an instrument's ATR, and get the largest lot that keeps the stop-out inside your risk.

- **Forex tab:** 11 pairs, 1.5 × ATR stop and 0.5% risk by default. Pip values are converted to USD with five reference prices you enter.
- **Metals, oil & indices tab:** XAUUSD, XAGUSD, XPTUSD, XPDUSD, Oil (WTI), US500 and US100, 1.25 × ATR stop and 0.7% risk by default. Contract value and lot step are editable per instrument.
- Lot sizes round down to the lot step. If one lot step already risks more than your limit, the row says so.
- Works offline once loaded, and can be installed as an app and pinned to the taskbar.
- Entries are saved in the browser only. Nothing is sent anywhere.

The ATR, price and contract values shown on first load are examples. Replace them before relying on the output.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for the calculations
npm run lint
npm run build
```

Requires Node 20.9 or newer.

## Put it on GitHub

```bash
git init
git add .
git commit -m "ATR Lot Sizer"
git branch -M main
git remote add origin https://github.com/<your-username>/atr-lot-sizer.git
git push -u origin main
```

Create the empty repository on GitHub first, without a README or licence, so the push is clean.

## Deploy on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, then import the `atr-lot-sizer` repository.
3. Leave the settings as they are (Framework Preset: Next.js) and press **Deploy**.

Every push to `main` redeploys automatically. No environment variables are needed.

## Install it as a desktop app

Open the deployed URL in Edge or Chrome.

- **Edge:** three dots → **Apps** → **Install this site as an app**.
- **Chrome:** the install icon in the address bar, or three dots → **Cast, save and share** → **Install page as app**.

Then right-click the app's icon on the taskbar and choose **Pin to taskbar**.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/lib/instruments.ts` | The pair and instrument lists, with example ATRs and contract values. Add or remove instruments here. |
| `src/lib/calc.ts` | The sizing maths, as pure functions. |
| `src/lib/calc.test.ts` | Tests with worked examples. |
| `src/lib/state.ts`, `store.ts` | Saved settings and the browser storage store. |
| `src/components/` | The interface. |
| `src/app/manifest.ts`, `public/sw.js`, `public/icons/` | Install and offline support. |

## How the sizing works

```
Risk                    = Balance × Risk %
Stop                    = ATR multiplier × ATR
Loss per 1.00 lot       = Stop × value of one unit of stop distance per lot
Lot size                = Risk ÷ Loss per 1.00 lot, rounded down to the lot step
```

For forex the stop is in pips and the value per pip comes from the quote currency: 10 USD on USD-quoted pairs, otherwise 10 units of the quote currency (1,000 for JPY) converted to USD. For metals, oil and indices the stop is in price units and the value is the contract value, which is the dollars 1.00 lot gains or loses when the price moves by 1.00. In MT5 you can find it by dividing a symbol's **Tick value** by its **Tick size** in the Specification.

## Disclaimer

This is a risk calculator, not financial advice. Contract sizes, lot steps and symbol names differ between brokers, so check each symbol's specification before trading.
