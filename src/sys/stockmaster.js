// credit to alain bryden
// https://github.com/alainbryden/bitburner-scripts

import { check_control_sequence } from "lib/Database";
import { CONTROL_SEQUENCES, PORTS } from "lib/Variables";

let disableShorts = false;
let commission = 100000; // Buy/sell commission. Expected profit must exceed this to buy anything.
let totalProfit = 0.0; // We can keep track of how much we've earned since start.
let lastLog = ""; // We update faster than the stock-market ticks, but we don't log anything unless there's been a change
let allStockSymbols = []; // Stores the set of all symbols collected at start
let mock = false; // If set to true, will "mock" buy/sell but not actually buy/sell anythingorecast
let noisy = false; // If set to true, tprints and announces each time stocks are bought/sold
let dictSourceFiles; // Populated at init, a dictionary of source-files the user has access to, and their level
// Pre-4S configuration (influences how we play the stock market before we have 4S data, after which everything's fool-proof)
let showMarketSummary = false;  // If set to true, will always generate and display the pre-4s forecast table in a separate tail window
let minTickHistory; // This much history must be gathered before we will offer a stock forecast.
let longTermForecastWindowLength; // This much history will be used to determine the historical probability of the stock (so long as no inversions are detected)
let nearTermForecastWindowLength; // This much history will be used to detect recent negative trends and act on them immediately.
// The following pre-4s constants are hard-coded (not configurable via command line) but may require tweaking
const marketCycleLength = 75; // Every this many ticks, all stocks have a 45% chance of "reversing" their probability. Something we must detect and act on quick to not lose profits.
const maxTickHistory = 151; // This much history will be kept for purposes of detemining volatility and perhaps one day pinpointing the market cycle tick
const inversionDetectionTolerance = 0.10; // If the near-term forecast is within this distance of (1 - long-term forecast), consider it a potential "inversion"
const inversionLagTolerance = 5; // An inversion is "trusted" up to this many ticks after the normal nearTermForecastWindowLength expected detection time
// (Note: 33 total stocks * 45% inversion chance each cycle = ~15 expected inversions per cycle)
// The following pre-4s values are set during the lifetime of the program
let marketCycleDetected = false; // We should not make risky purchasing decisions until the stock market cycle is detected. This can take a long time, but we'll be thanked
let detectedCycleTick = 0; // This will be reset to zero once we've detected the market cycle point.
let inversionAgreementThreshold = 6; // If this many stocks are detected as being in an "inversion", consider this the stock market cycle point
const expectedTickTime = 6000;
const catchUpTickTime = 4000;
let lastTick = 0;
let sleepInterval = 1000;

let options;
const argsSchema = [
    ['l', false], // Stop any other running stockmaster.js instances and sell all stocks
    ['liquidate', false], // Long-form alias for the above flag.
    ['mock', false], // If set to true, will "mock" buy/sell but not actually buy/sell anything
    ['noisy', false], // If set to true, tprints and announces each time stocks are bought/soldgetHostnames
    ['disable-shorts', false], // If set to true, will not short any stocks. Will be set depending on having SF8.2 by default.
    ['reserve', null], // A fixed amount of money to not spend
    ['fracB', 0.2], // Fraction of assets to have as liquid before we consider buying more stock
    ['fracH', 0.01], // Fraction of assets to retain as cash in hand when buying
    ['buy-threshold', 0.0001], // Buy only stocks forecasted to earn better than a 0.01% return (1 Basis Point)
    ['sell-threshold', 0], // Sell stocks forecasted to earn less than this return (default 0% - which happens when prob hits 50% or worse)
    ['diversification', 0.34], // Before we have 4S data, we will not hold more than this fraction of our portfolio as a single stock
    ['disableHud', false], // Disable showing stock value in the HUD panel
    ['disable-purchase-tix-api', false], // Disable purchasing the TIX API if you do not already have it.
    // The following settings are related only to tweaking pre-4s stock-market logic
    ['show-pre-4s-forecast', false], // If set to true, will always generate and display the pre-4s forecast (if false, it's only shown while we hold no stocks)
    ['show-market-summary', false], // Same effect as "show-pre-4s-forecast", this market summary has become so informative, it's valuable even with 4s
    ['pre-4s-buy-threshold-probability', 0.15], // Before we have 4S data, only buy stocks whose probability is more than this far away from 0.5, to account for imprecision
    ['pre-4s-buy-threshold-return', 0.0015], // Before we have 4S data, Buy only stocks forecasted to earn better than this return (default 0.25% or 25 Basis Points)
    ['pre-4s-sell-threshold-return', 0.0005], // Before we have 4S data, Sell stocks forecasted to earn less than this return (default 0.15% or 15 Basis Points)
    ['pre-4s-min-tick-history', 21], // This much history must be gathered before we will use pre-4s stock forecasts to make buy/sell decisions. (Default 21)
    ['pre-4s-forecast-window', 51], // This much history will be used to determine the historical probability of the stock (so long as no inversions are detected) (Default 76)
    ['pre-4s-inversion-detection-window', 10], // This much history will be used to detect recent negative trends and act on them immediately. (Default 10)
    ['pre-4s-min-blackout-window', 10], // Do not make any new purchases this many ticks before the detected stock market cycle tick, to avoid buying a position that reverses soon after
    ['pre-4s-minimum-hold-time', 10], // A recently bought position must be held for this long before selling, to avoid rash decisions due to noise after a fresh market cycle. (Default 10)
    ['buy-4s-budget', 0.8], // Maximum corpus value we will sacrifice in order to buy 4S. Setting to 0 will never buy 4s.
];

export function autocomplete(data, args) {
    data.flags(argsSchema);
    return [];
}

/** Requires access to the TIX API. Purchases access to the 4S Mkt Data API as soon as it can 
 * @param {NS} ns */
export async function main(ns) {
    const runOptions = getConfiguration(ns, argsSchema);
    if (!runOptions) return; // Invalid options, or ran in --help mode.

    // If given the "liquidate" command, try to kill any versions of this script trading in stocks
    // NOTE: We must do this immediately before we start resetting / overwriting global state below (which is shared between script instances)
    let player = ns.getPlayer();
    if (runOptions.l || runOptions.liquidate) {
        if (!player.hasTixApiAccess) return log(ns, 'ERROR: Cannot liquidate stocks because we do not have Tix Api Access', true, 'error');
        log(ns, 'INFO: Killing any other stockmaster processes...', false, 'info');
        await runCommand(ns, `ns.ps().filter(proc => proc.filename == '${ns.getScriptName()}' && !proc.args.includes('-l') && !proc.args.includes('--liquidate'))` +
            `.forEach(proc => ns.kill(proc.pid))`, '/Temp/kill-stockmarket-scripts.js');
        log(ns, 'INFO: Checking for and liquidating any stocks...', false, 'info');
        await liquidate(ns); // Sell all stocks
        return;
    } // Otherwise, prevent multiple instances of this script from being started, even with different args.
    if (await instanceCount(ns) > 1) return;

    ns.disableLog("ALL");
    // Extract various options from the args (globals, purchasing decision factors, pre-4s factors)
    options = runOptions; // We don't set the global "options" until we're sure this is the only running instance
    mock = options.mock;
    noisy = options.noisy;
    const fracB = options.fracB;
    const fracH = options.fracH;
    const diversification = options.diversification;
    const disableHud = options.disableHud || options.liquidate || options.mock;
    disableShorts = options['disable-shorts'];
    const pre4sBuyThresholdProbability = options['pre-4s-buy-threshold-probability'];
    const pre4sMinBlackoutWindow = options['pre-4s-min-blackout-window'] || 1;
    const pre4sMinHoldTime = options['pre-4s-minimum-hold-time'] || 0;
    minTickHistory = options['pre-4s-min-tick-history'] || 21;
    nearTermForecastWindowLength = options['pre-4s-inversion-detection-window'] || 10;
    longTermForecastWindowLength = options['pre-4s-forecast-window'] || (marketCycleLength + 1);
    showMarketSummary = options['show-pre-4s-forecast'] || options['show-market-summary'];
    // Other global values must be reset at start lest they be left in memory from a prior run
    lastTick = 0, totalProfit = 0, lastLog = "", marketCycleDetected = false, detectedCycleTick = 0, inversionAgreementThreshold = 6;
    let myStocks = [], allStocks = [];

    if (!player.hasTixApiAccess) { // You cannot use the stockmaster until you have API access
        if (options['disable-purchase-tix-api'])
            return log(ns, "ERROR: You do not have stock market API access, and --disable-purchase-tix-api is set.", true);
        let success = false;
        log(ns, `INFO: You are missing stock market API access. (NOTE: This is granted for free once you have SF8). ` +
            `Waiting until we can have the 5b needed to buy it. (Run with --disable-purchase-tix-api to disable this feature.)`, true);
        do {
            await ns.sleep(sleepInterval);
            try {
                const reserve = options['reserve'] != null ? options['reserve'] : Number(ns.read("reserve.txt") || 0);
                success = await tryGetStockMarketAccess(ns, player = ns.getPlayer(), player.money - reserve);
            } catch (err) {
                log(ns, `WARNING: stockmaster.js Caught (and suppressed) an unexpected error while waiting to buy stock market access:\n` +
                    (typeof err === 'string' ? err : err.message || JSON.stringify(err)), false, 'warning');
            }
        } while (!success);
    }

    dictSourceFiles = await getActiveSourceFiles(ns); // Find out what source files the user has unlocked
    if (!disableShorts && (!(8 in dictSourceFiles) || dictSourceFiles[8] < 2)) {
        log(ns, "INFO: Shorting stocks has been disabled (you have not yet unlocked access to shorting)");
        disableShorts = true;
    }

    if (allStockSymbols.length == 0) allStockSymbols = await getAllStockSymbols(ns);
    allStocks = await initAllStocks(ns);

    let bitnodeMults;
    if (5 in dictSourceFiles) bitnodeMults = await tryGetBitNodeMultipliers(ns);
    // Assume bitnode mults are 1 if user doesn't have this API access yet
    if (!bitnodeMults) bitnodeMults = { FourSigmaMarketDataCost: 1, FourSigmaMarketDataApiCost: 1 };

    if (showMarketSummary) await launchSummaryTail(ns); // Opens a separate script / window to continuously display the Pre4S forecast

    let hudElement = null;
    if (!disableHud) {
        hudElement = initializeHud();
        ns.atExit(() => hudElement.parentElement.parentElement.parentElement.removeChild(hudElement.parentElement.parentElement));
    }

    log(ns, `Welcome! Please note: all stock purchases will initially result in a Net (unrealized) Loss. This is not only due to commission, but because each stock has a 'spread' (difference in buy price and sell price). ` +
        `This script is designed to buy stocks that are most likely to surpass that loss and turn a profit, but it will take a few minutes to see the progress.\n\n` +
        `If you choose to stop the script, make sure you SELL all your stocks (can go 'run ${ns.getScriptName()} --liquidate') to get your money back.\n\nGood luck!\n~ Insight\n\n`)

    while (true) {
        try {
            const playerStats = ns.getPlayer();
            const reserve = options['reserve'] != null ? options['reserve'] : Number(ns.read("reserve.txt") || 0);
            const pre4s = !playerStats.has4SDataTixApi;
            const holdings = await refresh(ns, playerStats.has4SDataTixApi, allStocks, myStocks); // Returns total stock value
            const corpus = holdings + playerStats.money; // Corpus means total stocks + cash
            const maxHoldings = (1 - fracH) * corpus; // The largest value of stock we could hold without violiating fracH (Fraction to keep as cash)
            if (pre4s && !mock && await tryGet4SApi(ns, playerStats, bitnodeMults, corpus * (options['buy-4s-budget'] - fracH) - reserve))
                continue; // Start the loop over if we just bought 4S API access
            // Be more conservative with our decisions if we don't have 4S data
            const thresholdToBuy = pre4s ? options['pre-4s-buy-threshold-return'] : options['buy-threshold'];
            const thresholdToSell = pre4s ? options['pre-4s-sell-threshold-return'] : options['sell-threshold'];
            if (myStocks.length > 0)
                doStatusUpdate(ns, allStocks, myStocks, hudElement);
            else if (hudElement) hudElement.innerText = "$0.000 ";
            if (pre4s && allStocks[0].priceHistory.length < minTickHistory) {
                log(ns, `Building a history of stock prices (${allStocks[0].priceHistory.length}/${minTickHistory})...`);
                await ns.sleep(sleepInterval);
                continue;
            }

            // Sell forecasted-to-underperform shares (worse than some expected return threshold)
            let sales = 0;
            for (let stk of myStocks) {
                if (stk.absReturn() <= thresholdToSell || stk.bullish() && stk.sharesShort > 0 || stk.bearish() && stk.sharesLong > 0) {
                    if (pre4s && stk.ticksHeld < pre4sMinHoldTime) {
                        if (!stk.warnedBadPurchase) log(ns, `WARNING: Thinking of selling ${stk.sym} with ER ${formatBP(stk.absReturn())}, but holding out as it was purchased just ${stk.ticksHeld} ticks ago...`);
                        stk.warnedBadPurchase = true; // Hack to ensure we don't spam this warning
                    } else {
                        sales += await doSellAll(ns, stk);
                        stk.warnedBadPurchase = false;
                    }
                }
            }
            if (sales > 0) continue; // If we sold anything, loop immediately (no need to sleep) and refresh stats immediately before making purchasing decisions.

            // If we haven't gone above a certain liquidity threshold, don't attempt to buy more stock
            // Avoids death-by-a-thousand-commissions before we get super-rich, stocks are capped, and this is no longer an issue
            // BUT may mean we miss striking while the iron is hot while waiting to build up more funds.
            if (playerStats.money / corpus > fracB) {
                // Compute the cash we have to spend (such that spending it all on stock would bring us down to a liquidity of fracH)
                let cash = Math.min(playerStats.money - reserve, maxHoldings - holdings);
                // If we haven't detected the market cycle (or haven't detected it reliably), assume it might be quite soon and restrict bets to those that can turn a profit in the very-near term.
                const estTick = Math.max(detectedCycleTick, marketCycleLength - (!marketCycleDetected ? 10 : inversionAgreementThreshold <= 8 ? 20 : inversionAgreementThreshold <= 10 ? 30 : marketCycleLength));
                // Buy shares with cash remaining in hand if exceeding some buy threshold. Prioritize targets whose expected return will cover the ask/bit spread the soonest
                for (const stk of allStocks.sort(purchaseOrder)) {
                    if (cash <= 0) break; // Break if we are out of money (i.e. from prior purchases)
                    // Do not purchase a stock if it is not forecasted to recover from the ask/bid spread before the next market cycle and potential probability inversion
                    if (stk.blackoutWindow() >= marketCycleLength - estTick) continue;
                    if (pre4s && (Math.max(pre4sMinHoldTime, pre4sMinBlackoutWindow) >= marketCycleLength - estTick)) continue;
                    // Skip if we already own all possible shares in this stock, or if the expected return is below our threshold, or if shorts are disabled and stock is bearish
                    if (stk.ownedShares() == stk.maxShares || stk.absReturn() <= thresholdToBuy || (disableShorts && stk.bearish())) continue;
                    // If pre-4s, do not purchase any stock whose last inversion was too recent, or whose probability is too close to 0.5
                    if (pre4s && (stk.lastInversion < minTickHistory || Math.abs(stk.prob - 0.5) < pre4sBuyThresholdProbability)) continue;

                    // Enforce diversification: Don't hold more than x% of our portfolio as a single stock (as corpus increases, this naturally stops being a limiter)
                    // Inflate our budget / current position value by a factor of stk.spread_pct to avoid repeated micro-buys of a stock due to the buy/ask spread making holdings appear more diversified after purchase
                    let budget = Math.min(cash, maxHoldings * (diversification + stk.spread_pct) - stk.positionValue() * (1.01 + stk.spread_pct))
                    let purchasePrice = stk.bullish() ? stk.ask_price : stk.bid_price; // Depends on whether we will be buying a long or short position
                    let affordableShares = Math.floor((budget - commission) / purchasePrice);
                    let numShares = Math.min(stk.maxShares - stk.ownedShares(), affordableShares);
                    if (numShares <= 0) continue;
                    // Don't buy fewer shares than can beat the comission before the next stock market cycle (after covering the spread), lest the position reverse before we break-even.
                    let ticksBeforeCycleEnd = marketCycleLength - estTick - stk.timeToCoverTheSpread();
                    if (ticksBeforeCycleEnd < 1) continue; // We're cutting it too close to the market cycle, position might reverse before we break-even on commission
                    let estEndOfCycleValue = numShares * purchasePrice * ((stk.absReturn() + 1) ** ticksBeforeCycleEnd - 1); // Expected difference in purchase price and value at next market cycle end
                    let owned = stk.ownedShares() > 0;
                    if (estEndOfCycleValue <= 2 * commission)
                        log(ns, (owned ? '' : `We currently have ${formatNumberShort(stk.ownedShares(), 3, 1)} shares in ${stk.sym} valued at ${formatMoney(stk.positionValue())} ` +
                            `(${(100 * stk.positionValue() / maxHoldings).toFixed(1)}% of corpus, capped at ${(diversification * 100).toFixed(1)}% by --diversification).\n`) +
                            `Despite attractive ER of ${formatBP(stk.absReturn())}, ${owned ? 'more ' : ''}${stk.sym} was not bought. ` +
                            `\nBudget: ${formatMoney(budget)} can only buy ${numShares.toLocaleString('en')} ${owned ? 'more ' : ''}shares @ ${formatMoney(purchasePrice)}. ` +
                            `\nGiven an estimated ${marketCycleLength - estTick} ticks left in market cycle, less ${stk.timeToCoverTheSpread().toFixed(1)} ticks to cover the spread (${(stk.spread_pct * 100).toFixed(2)}%), ` +
                            `remaining ${ticksBeforeCycleEnd.toFixed(1)} ticks would only generate ${formatMoney(estEndOfCycleValue)}, which is less than 2x commission (${formatMoney(2 * commission, 3)})`);
                    else
                        cash -= await doBuy(ns, stk, numShares);
                }
            }
        } catch (err) {
            log(ns, `WARNING: stockmaster.js Caught (and suppressed) an unexpected error in the main loop:\n` +
                (typeof err === 'string' ? err : err.message || JSON.stringify(err)), false, 'warning');
        }
        await ns.sleep(sleepInterval);
    }
}

/** @param {NS} ns
 * Ram-dodging helper to get an array of all stock symbols in the game */
export async function getAllStockSymbols(ns) {
    return await getNsDataThroughFile(ns, 'ns.stock.getSymbols()', '/Temp/stock-symbols.txt');
}

/* A sorting function to put stocks in the order we should prioritize investing in them */
let purchaseOrder = (a, b) => (Math.ceil(a.timeToCoverTheSpread()) - Math.ceil(b.timeToCoverTheSpread())) || (b.absReturn() - a.absReturn());

/* Generic helper for dodging the hefty RAM requirements of stock functions by spawning a temporary script to collect info for us.
 Relies on the global variable 'allStockSymbols' being populated. */
let getStockInfoDict = async (ns, stockFunction) => await getNsDataThroughFile(ns,
    `Object.fromEntries(ns.args.map(sym => [sym, ns.stock.${stockFunction}(sym)]))`, `/Temp/stock-${stockFunction}.txt`, allStockSymbols);

/** @param {NS} ns **/
async function initAllStocks(ns) {
    let dictMaxShares = await getStockInfoDict(ns, 'getMaxShares'); // Only need to get this once, it never changes
    return allStockSymbols.map(s => ({
        sym: s,
        maxShares: dictMaxShares[s], // Value never changes once retrieved
        expectedReturn: function () { // How much holdings are expected to appreciate (or depreciate) in the future
            // To add conservatism to pre-4s estimates, we reduce the probability by 1 standard deviation without crossing the midpoint
            let normalizedProb = (this.prob - 0.5);
            let conservativeProb = normalizedProb < 0 ? Math.min(0, normalizedProb + this.probStdDev) : Math.max(0, normalizedProb - this.probStdDev);
            return this.vol * conservativeProb;
        },
        absReturn: function () { return Math.abs(this.expectedReturn()); }, // Appropriate to use when can just as well buy a short position as a long position
        bullish: function () { return this.prob > 0.5 },
        bearish: function () { return !this.bullish(); },
        ownedShares: function () { return this.sharesLong + this.sharesShort; },
        owned: function () { return this.ownedShares() > 0; },
        positionValueLong: function () { return this.sharesLong * this.bid_price; },
        positionValueShort: function () { return this.sharesShort * (2 * this.boughtPriceShort - this.ask_price); }, // Shorts work a bit weird
        positionValue: function () { return this.positionValueLong() + this.positionValueShort(); },
        // How many stock market ticks must occur at the current expected return before we regain the value lost by the spread between buy and sell prices.
        // This can be derived by taking the compound interest formula (future = current * (1 + expected_return) ^ n) and solving for n
        timeToCoverTheSpread: function () { return Math.log(this.ask_price / this.bid_price) / Math.log(1 + this.absReturn()); },
        // We should not buy this stock within this many ticks of a Market cycle, or we risk being forced to sell due to a probability inversion, and losing money due to the spread
        blackoutWindow: function () { return Math.ceil(this.timeToCoverTheSpread()); },
        // Pre-4s properties used for forecasting
        priceHistory: [],
        lastInversion: 0,
    }));
}

/** @param {NS} ns **/
async function refresh(ns, has4s, allStocks, myStocks) {
    await check_control_sequence(ns);
        
    while (ns.peek(PORTS.control) === CONTROL_SEQUENCES.LIQUIDATE_CAPITAL) {
        await ns.asleep(10);
    }

    let holdings = 0;

    // Dodge hefty RAM requirements by spawning a sequence of temporary scripts to collect info for us one function at a time
    const dictAskPrices = await getStockInfoDict(ns, 'getAskPrice');
    const dictBidPrices = await getStockInfoDict(ns, 'getBidPrice');
    const dictVolatilities = !has4s ? null : await getStockInfoDict(ns, 'getVolatility');
    const dictForecasts = !has4s ? null : await getStockInfoDict(ns, 'getForecast');
    const dictPositions = mock ? null : await getStockInfoDict(ns, 'getPosition');
    const ticked = allStocks.some(stk => stk.ask_price != dictAskPrices[stk.sym]); // If any price has changed since our last update, the stock market has "ticked"

    if (ticked) {
        if (Date.now() - lastTick < expectedTickTime - sleepInterval) {
            if (Date.now() - lastTick < catchUpTickTime - sleepInterval) {
                let changedPrices = allStocks.filter(stk => stk.ask_price != dictAskPrices[stk.sym]);
                log(ns, `WARNING: Detected a stock market tick after only ${formatDuration(Date.now() - lastTick)}, but expected ~${formatDuration(expectedTickTime)}. ` +
                    (changedPrices.length >= 33 ? '(All stocks updated)' : `The following ${changedPrices.length} stock prices changed: ${changedPrices.map(stk =>
                        `${stk.sym} ${formatMoney(stk.ask_price)} -> ${formatMoney(dictAskPrices[stk.sym])}`).join(", ")}`), false, 'warning');
            } else
                log(ns, `INFO: Detected a rapid stock market tick (${formatDuration(Date.now() - lastTick)}), likely to make up for lag / offline time.`)
        }
        lastTick = Date.now()
    }

    myStocks.length = 0;
    for (const stk of allStocks) {
        const sym = stk.sym;
        stk.ask_price = dictAskPrices[sym]; // The amount we would pay if we bought the stock (higher than 'price')
        stk.bid_price = dictBidPrices[sym]; // The amount we would recieve if we sold the stock (lower than 'price')
        stk.spread = stk.ask_price - stk.bid_price;
        stk.spread_pct = stk.spread / stk.ask_price; // The percentage of value we lose just by buying the stock
        stk.price = (stk.ask_price + stk.bid_price) / 2; // = ns.stock.getPrice(sym);
        stk.vol = has4s ? dictVolatilities[sym] : stk.vol;
        stk.prob = has4s ? dictForecasts[sym] : stk.prob;
        stk.probStdDev = has4s ? 0 : stk.probStdDev; // Standard deviation around the est. probability
        // Update our current portfolio of owned stock
        let [priorLong, priorShort] = [stk.sharesLong, stk.sharesShort];
        stk.position = mock ? null : dictPositions[sym];
        stk.sharesLong = mock ? (stk.sharesLong || 0) : stk.position[0];
        stk.boughtPrice = mock ? (stk.boughtPrice || 0) : stk.position[1];
        stk.sharesShort = mock ? (stk.shares_short || 0) : stk.position[2];
        stk.boughtPriceShort = mock ? (stk.boughtPrice_short || 0) : stk.position[3];
        holdings += stk.positionValue();
        if (stk.owned()) myStocks.push(stk); else stk.ticksHeld = 0;
        if (ticked) // Increment ticksHeld, or reset it if we have no position in this stock or reversed our position last tick.
            stk.ticksHeld = !stk.owned() || (priorLong > 0 && stk.sharesLong == 0) || (priorShort > 0 && stk.sharesShort == 0) ? 0 : 1 + (stk.ticksHeld || 0);
    }
    if (ticked) await updateForecast(ns, allStocks, has4s); // Logic below only required on market tick
    return holdings;
}

// Historical probability can be inferred from the number of times the stock was recently observed increasing over the total number of observations
const forecast = history => history.reduce((ups, price, idx) => idx == 0 ? 0 : (history[idx - 1] > price ? ups + 1 : ups), 0) / (history.length - 1);
// An "inversion" can be detected if two probabilities are far enough apart and are within "tolerance" of p1 being equal to 1-p2
const tol2 = inversionDetectionTolerance / 2;
const detectInversion = (p1, p2) => ((p1 >= 0.5 + tol2) && (p2 <= 0.5 - tol2) && p2 <= (1 - p1) + inversionDetectionTolerance)
        /* Reverse Condition: */ || ((p1 <= 0.5 - tol2) && (p2 >= 0.5 + tol2) && p2 >= (1 - p1) - inversionDetectionTolerance);

/** @param {NS} ns **/
async function updateForecast(ns, allStocks, has4s) {
    const currentHistory = allStocks[0].priceHistory.length;
    const prepSummary = showMarketSummary || mock || (!has4s && (currentHistory < minTickHistory || allStocks.filter(stk => stk.owned()).length == 0)); // Decide whether to display the market summary table.
    const inversionsDetected = []; // Keep track of individual stocks whose probability has inverted (45% chance of happening each "cycle")
    detectedCycleTick = (detectedCycleTick + 1) % marketCycleLength; // Keep track of stock market cycle (which occurs every 75 ticks)
    for (const stk of allStocks) {
        stk.priceHistory.unshift(stk.price);
        if (stk.priceHistory.length > maxTickHistory) // Limit the rolling window size
            stk.priceHistory.splice(maxTickHistory, 1);
        // Volatility is easy - the largest observed % movement in a single tick
        if (!has4s) stk.vol = stk.priceHistory.reduce((max, price, idx) => Math.max(max, idx == 0 ? 0 : Math.abs(stk.priceHistory[idx - 1] - price) / price), 0);
        // We want stocks that have the best expected return, averaged over a long window for greater precision, but the game will occasionally invert probabilities
        // (45% chance every 75 updates), so we also compute a near-term forecast window to allow for early-detection of inversions so we can ditch our position.
        stk.nearTermForecast = forecast(stk.priceHistory.slice(0, nearTermForecastWindowLength));
        let preNearTermWindowProb = forecast(stk.priceHistory.slice(nearTermForecastWindowLength, nearTermForecastWindowLength + marketCycleLength)); // Used to detect the probability before the potential inversion event.
        // Detect whether it appears as though the probability of this stock has recently undergone an inversion (i.e. prob => 1 - prob)
        stk.possibleInversionDetected = has4s ? detectInversion(stk.prob, stk.lastTickProbability || stk.prob) : detectInversion(preNearTermWindowProb, stk.nearTermForecast);
        stk.lastTickProbability = stk.prob;
        if (stk.possibleInversionDetected) inversionsDetected.push(stk);
    }
    // Detect whether our auto-detected "stock market cycle" timing should be adjusted based on the number of potential inversions observed
    let summary = "";
    if (inversionsDetected.length > 0) {
        summary += `${inversionsDetected.length} Stocks appear to be reversing their outlook: ${inversionsDetected.map(s => s.sym).join(', ')} (threshold: ${inversionAgreementThreshold})\n`;
        if (inversionsDetected.length >= inversionAgreementThreshold && (has4s || currentHistory >= minTickHistory)) { // We believe we have detected the stock market cycle!
            const newPredictedCycleTick = has4s ? 0 : nearTermForecastWindowLength; // By the time we've detected it, we're this many ticks past the cycle start
            if (detectedCycleTick != newPredictedCycleTick)
                log(ns, `Threshold for changing predicted market cycle met (${inversionsDetected.length} >= ${inversionAgreementThreshold}). ` +
                    `Changing current market tick from ${detectedCycleTick} to ${newPredictedCycleTick}.`);
            marketCycleDetected = true;
            detectedCycleTick = newPredictedCycleTick;
            // Don't adjust this in the future unless we see another day with as much or even more agreement (capped at 14, it seems sometimes our cycles get out of sync with
            // actual cycles and we need to reset our clock even after previously determining the cycle with great certainty.)
            inversionAgreementThreshold = Math.max(14, inversionsDetected.length);
        }
    }
    // Act on any inversions (if trusted), compute the probability, and prepare the stock summary
    for (const stk of allStocks) {
        // Don't "trust" (act on) a detected inversion unless it's near the time when we're capable of detecting market cycle start. Avoids most false-positives.
        if (stk.possibleInversionDetected && (has4s && detectedCycleTick == 0 ||
            (!has4s && (detectedCycleTick >= nearTermForecastWindowLength / 2) && (detectedCycleTick <= nearTermForecastWindowLength + inversionLagTolerance))))
            stk.lastInversion = detectedCycleTick; // If we "trust" a probability inversion has occurred, probability will be calculated based on only history since the last inversion.
        else
            stk.lastInversion++;
        // Only take the stock history since after the last inversion to compute the probability of the stock.
        const probWindowLength = Math.min(longTermForecastWindowLength, stk.lastInversion);
        stk.longTermForecast = forecast(stk.priceHistory.slice(0, probWindowLength));
        if (!has4s) {
            stk.prob = stk.longTermForecast;
            stk.probStdDev = Math.sqrt((stk.prob * (1 - stk.prob)) / probWindowLength);
        }
        const signalStrength = 1 + (stk.bullish() ? (stk.nearTermForecast > stk.prob ? 1 : 0) + (stk.prob > 0.8 ? 1 : 0) : (stk.nearTermForecast < stk.prob ? 1 : 0) + (stk.prob < 0.2 ? 1 : 0));
        if (prepSummary) { // Example: AERO  ++   Prob: 54% (t51: 54%, t10: 67%) tLast⇄:190 Vol:0.640% ER: 2.778BP Spread:1.784% ttProfit: 65 Pos: 14.7M long  (held 189 ticks)
            stk.debugLog = `${stk.sym.padEnd(5, ' ')} ${(stk.bullish() ? '+' : '-').repeat(signalStrength).padEnd(3)} ` +
                `Prob:${(stk.prob * 100).toFixed(0).padStart(3)}% (t${probWindowLength.toFixed(0).padStart(2)}:${(stk.longTermForecast * 100).toFixed(0).padStart(3)}%, ` +
                `t${Math.min(stk.priceHistory.length, nearTermForecastWindowLength).toFixed(0).padStart(2)}:${(stk.nearTermForecast * 100).toFixed(0).padStart(3)}%) ` +
                `tLast⇄:${(stk.lastInversion + 1).toFixed(0).padStart(3)} Vol:${(stk.vol * 100).toFixed(2)}% ER:${formatBP(stk.expectedReturn()).padStart(8)} ` +
                `Spread:${(stk.spread_pct * 100).toFixed(2)}% ttProfit:${stk.blackoutWindow().toFixed(0).padStart(3)}`;
            if (stk.owned()) stk.debugLog += ` Pos: ${formatNumberShort(stk.ownedShares(), 3, 1)} (${stk.ownedShares() == stk.maxShares ? 'max' :
                ((100 * stk.ownedShares() / stk.maxShares).toFixed(0).padStart(2) + '%')}) ${stk.sharesLong > 0 ? 'long ' : 'short'} (held ${stk.ticksHeld} ticks)`;
            if (stk.possibleInversionDetected) stk.debugLog += ' ⇄⇄⇄';
        }
    }
    // Print a summary of stocks as of this most recent tick (if enabled)
    if (prepSummary) {
        summary += `Market day ${detectedCycleTick + 1}${marketCycleDetected ? '' : '?'} of ${marketCycleLength} (${marketCycleDetected ? (100 * inversionAgreementThreshold / 19).toPrecision(2) : '0'}% certain) ` +
            `Current Stock Summary and Pre-4S Forecasts (by best payoff-time):\n` + allStocks.sort(purchaseOrder).map(s => s.debugLog).join("\n")
        if (showMarketSummary) await updateForecastFile(ns, summary); else log(ns, summary);
    }
    // Write out a file of stock probabilities so that other scripts can make use of this (e.g. hack orchestrator can manipulate the stock market)
    await ns.write('/Temp/stock-probabilities.txt', JSON.stringify(Object.fromEntries(
        allStocks.map(stk => [stk.sym, { prob: stk.prob, sharesLong: stk.sharesLong, sharesShort: stk.sharesShort }]))), "w");
}

// Helpers to display the stock market summary in a separate window.
let summaryFile = '/Temp/stockmarket-summary.txt';
let updateForecastFile = async (ns, summary) => await ns.write(summaryFile, summary, 'w');
let launchSummaryTail = async ns => {
    let summaryTailScript = summaryFile.replace('.txt', '-tail.js');
    if (await getNsDataThroughFile(ns, `ns.scriptRunning('${summaryTailScript}', ns.getHostname())`, '/Temp/stockmarket-summary-is-running.txt'))
        return;
    //await getNsDataThroughFile(ns, `ns.scriptKill('${summaryTailScript}', ns.getHostname())`, summaryTailScript.replace('.js', '-kill.js')); // Only needed if we're changing the script below
    await runCommand(ns, `ns.disableLog('sleep'); ns.tail(); let lastRead = '';
        while (true) { 
            let read = ns.read('${summaryFile}');
            if (lastRead != read) ns.print(lastRead = read);
            await ns.sleep(1000); 
        }`, summaryTailScript);
}

// Ram-dodging helpers that spawn temporary scripts to buy/sell rather than pay 2.5GB ram per variant
let buyStockWrapper = async (ns, sym, numShares) => await transactStock(ns, sym, numShares, 'buy'); // ns.stock.buy(sym, numShares);
let buyShortWrapper = async (ns, sym, numShares) => await transactStock(ns, sym, numShares, 'short'); // ns.stock.short(sym, numShares);
let sellStockWrapper = async (ns, sym, numShares) => await transactStock(ns, sym, numShares, 'sell'); // ns.stock.sell(sym, numShares);
let sellShortWrapper = async (ns, sym, numShares) => await transactStock(ns, sym, numShares, 'sellShort'); // ns.stock.sellShort(sym, numShares);
let transactStock = async (ns, sym, numShares, action) =>
    await getNsDataThroughFile(ns, `ns.stock.${action}(ns.args[0], ns.args[1])`, `/Temp/stock-${action}.txt`, [sym, numShares]);

/** @param {NS} ns 
 * Automatically buys either a short or long position depending on the outlook of the stock. */
async function doBuy(ns, stk, sharesToBuy) {
    // We include -2*commission in the "holdings value" of our stock, but if we make repeated purchases of the same stock, we have to track
    // the additional commission somewhere. So only subtract it from our running profit if this isn't our first purchase of this symbol
    if (stk.owned())
        totalProfit -= commission;
    let long = stk.bullish();
    let expectedPrice = long ? stk.ask_price : stk.bid_price; // Depends on whether we will be buying a long or short position
    let price;
    log(ns, `INFO: ${long ? 'Buying  ' : 'Shorting'} ${formatNumberShort(sharesToBuy, 3, 3).padStart(5)} (` +
        `${stk.maxShares == sharesToBuy + stk.ownedShares() ? '@max shares' : `${formatNumberShort(sharesToBuy + stk.ownedShares(), 3, 3).padStart(5)}/${formatNumberShort(stk.maxShares, 3, 3).padStart(5)}`}) ` +
        `${stk.sym.padEnd(5)} @ ${formatMoney(expectedPrice).padStart(9)} for ${formatMoney(sharesToBuy * expectedPrice).padStart(9)} (Spread:${(stk.spread_pct * 100).toFixed(2)}% ` +
        `ER:${formatBP(stk.expectedReturn()).padStart(8)}) Ticks to Profit: ${stk.timeToCoverTheSpread().toFixed(2)}`, noisy, 'info');
    try {
        price = mock ? expectedPrice : Number(await transactStock(ns, stk.sym, sharesToBuy, long ? 'buy' : 'short'));
    } catch (err) {
        if (long) throw err;
        disableShorts = true;
        log(ns, `WARN: Failed to short ${stk.sym} (Shorts not available?). Disabling shorts...`, true, 'warning');
        return 0;
    }
    // The rest of this work is for troubleshooting / mock-mode purposes
    if (price == 0) {
        if (ns.getPlayer().money < sharesToBuy * expectedPrice)
            log(ns, `WARN: Failed to ${long ? 'buy' : 'short'} ${stk.sym} because money just recently dropped to ${formatMoney(ns.getPlayer().money)} and we can no longer afford it.`, noisy);
        else
            log(ns, `ERROR: Failed to ${long ? 'buy' : 'short'} ${stk.sym} @ ${formatMoney(expectedPrice)} (0 was returned) despite having ${formatMoney(ns.getPlayer().money)}.`, true, 'error');
        return 0;
    } else if (price != expectedPrice) {
        log(ns, `WARNING: ${long ? 'Bought' : 'Shorted'} ${stk.sym} @ ${formatMoney(price)} but expected ${formatMoney(expectedPrice)} (spread: ${formatMoney(stk.spread)})`, false, 'warning');
        price = expectedPrice; // Known Bitburner bug for now, short returns "price" instead of "bid_price". Correct this so running profit calcs are correct.
    }
    if (mock && long) stk.boughtPrice = (stk.boughtPrice * stk.sharesLong + price * sharesToBuy) / (stk.sharesLong + sharesToBuy);
    if (mock && !long) stk.boughtPriceShort = (stk.boughtPriceShort * stk.sharesShort + price * sharesToBuy) / (stk.sharesShort + sharesToBuy);
    if (long) stk.sharesLong += sharesToBuy; else stk.sharesShort += sharesToBuy; // Maintained for mock mode, otherwise, redundant (overwritten at next refresh)
    return sharesToBuy * price + commission; // Return the amount spent on the transaction so it can be subtracted from our cash on hand
}

/** @param {NS} ns 
 * Sell our current position in this stock. */
async function doSellAll(ns, stk) {
    let long = stk.sharesLong > 0;
    if (long && stk.sharesShort > 0) // Detect any issues here - we should always sell one before buying the other.
        log(ns, `ERROR: Somehow ended up both ${stk.sharesShort} short and ${stk.sharesLong} long on ${stk.sym}`, true, 'error');
    let expectedPrice = long ? stk.bid_price : stk.ask_price; // Depends on whether we will be selling a long or short position
    let sharesSold = long ? stk.sharesLong : stk.sharesShort;
    let price = mock ? expectedPrice : await transactStock(ns, stk.sym, sharesSold, long ? 'sell' : 'sellShort');
    const profit = (long ? stk.sharesLong * (price - stk.boughtPrice) : stk.sharesShort * (stk.boughtPriceShort - price)) - 2 * commission;
    log(ns, `${profit > 0 ? 'SUCCESS' : 'WARNING'}: Sold all ${formatNumberShort(sharesSold, 3, 3).padStart(5)} ${stk.sym.padEnd(5)} ${long ? ' long' : 'short'} positions ` +
        `@ ${formatMoney(price).padStart(9)} for a ` + (profit > 0 ? `PROFIT of ${formatMoney(profit).padStart(9)}` : ` LOSS  of ${formatMoney(-profit).padStart(9)}`) + ` after ${stk.ticksHeld} ticks`,
        noisy, noisy ? (profit > 0 ? 'success' : 'error') : undefined);
    if (price == 0) {
        log(ns, `ERROR: Failed to sell ${sharesSold} ${stk.sym} ${long ? 'shares' : 'shorts'} @ ${formatMoney(expectedPrice)} - 0 was returned.`, true, 'error');
        return 0;
    } else if (price != expectedPrice) {
        log(ns, `WARNING: Sold ${stk.sym} ${long ? 'shares' : 'shorts'} @ ${formatMoney(price)} but expected ${formatMoney(expectedPrice)} (spread: ${formatMoney(stk.spread)})`, false, 'warning');
        price = expectedPrice; // Known Bitburner bug for now, sellSort returns "price" instead of "ask_price". Correct this so running profit calcs are correct.
    }
    if (long) stk.sharesLong -= sharesSold; else stk.sharesShort -= sharesSold; // Maintained for mock mode, otherwise, redundant (overwritten at next refresh)
    totalProfit += profit;
    return price * sharesSold - commission; // Return the amount of money recieved from the transaction
}

let formatBP = fraction => formatNumberShort(fraction * 100 * 100, 3, 2) + " BP";

/** Log / tprint / toast helper.
 * @param {NS} ns */
let log = (ns, message, tprint = false, toastStyle = "") => {
    if (message == lastLog) return;
    ns.print(message);
    if (tprint) ns.tprint(message);
    if (toastStyle) ns.toast(message, toastStyle);
    return lastLog = message;
}

function doStatusUpdate(ns, stocks, myStocks, hudElement = null) {
    let maxReturnBP = 10000 * Math.max(...myStocks.map(s => s.absReturn())); // The largest return (in basis points) in our portfolio
    let minReturnBP = 10000 * Math.min(...myStocks.map(s => s.absReturn())); // The smallest return (in basis points) in our portfolio
    let est_holdings_cost = myStocks.reduce((sum, stk) => sum + (stk.owned() ? commission : 0) +
        stk.sharesLong * stk.boughtPrice + stk.sharesShort * stk.boughtPriceShort, 0);
    let liquidation_value = myStocks.reduce((sum, stk) => sum - (stk.owned() ? commission : 0) + stk.positionValue(), 0);
    let status = `Long ${myStocks.filter(s => s.sharesLong > 0).length}, Short ${myStocks.filter(s => s.sharesShort > 0).length} of ${stocks.length} stocks ` +
        (myStocks.length == 0 ? '' : `(ER ${minReturnBP.toFixed(1)}-${maxReturnBP.toFixed(1)} BP) `) +
        `Profit: ${formatMoney(totalProfit, 3)} Holdings: ${formatMoney(liquidation_value, 3)} (Cost: ${formatMoney(est_holdings_cost, 3)}) ` +
        `Net: ${formatMoney(totalProfit + liquidation_value - est_holdings_cost, 3)}`
    log(ns, status);
    if (hudElement) hudElement.innerText = formatMoney(liquidation_value, 6, 3);
}

/** @param {NS} ns **/
async function liquidate(ns) {
    if (allStockSymbols.length == 0) allStockSymbols = await getAllStockSymbols(ns); // If the global property allStockSymbols hasn't been initialized, do so now
    let totalStocks = 0, totalSharesLong = 0, totalSharesShort = 0, totalRevenue = 0;
    const dictPositions = mock ? null : await getStockInfoDict(ns, 'getPosition');
    for (const sym of allStockSymbols) {
        var [sharesLong, , sharesShort, avgShortCost] = dictPositions[sym];
        if (sharesLong + sharesShort == 0) continue;
        totalStocks++, totalSharesLong += sharesLong, totalSharesShort += sharesShort;
        if (sharesLong > 0) totalRevenue += (await sellStockWrapper(ns, sym, sharesLong)) * sharesLong - commission;
        if (sharesShort > 0) totalRevenue += (2 * avgShortCost - (await sellShortWrapper(ns, sym, sharesShort))) * sharesShort - commission;
    }
    log(ns, `Sold ${totalSharesLong.toLocaleString('en')} long shares and ${totalSharesShort.toLocaleString('en')} short shares ` +
        `in ${totalStocks} stocks for ${formatMoney(totalRevenue, 3)}`, true, 'success');
}

/** @param {NS} ns **/
/** @param {Player} playerStats **/
async function tryGet4SApi(ns, playerStats, bitnodeMults, budget) {
    if (playerStats.has4SDataTixApi) return false; // Only return true if we just bought it
    const cost4sData = 1E9 * bitnodeMults.FourSigmaMarketDataCost;
    const cost4sApi = 25E9 * bitnodeMults.FourSigmaMarketDataApiCost;
    const totalCost = (playerStats.has4SData ? 0 : cost4sData) + cost4sApi;
    // Liquidate shares if it would allow us to afford 4S API data
    if (totalCost > budget) /* Need to reserve some money to invest */
        return false;
    if (playerStats.money < totalCost)
        await liquidate(ns);
    if (!playerStats.has4SData) {
        if (await getNsDataThroughFile(ns, 'ns.stock.purchase4SMarketData()', '/Temp/purchase-4s.txt'))
            log(ns, `SUCCESS: Purchased 4SMarketData for ${formatMoney(cost4sData)} (At ${formatDuration(playerStats.playtimeSinceLastBitnode)} into BitNode)`, true, 'success');
        else
            log(ns, 'ERROR attempting to purchase 4SMarketData!', false, 'error');
    }
    if (await getNsDataThroughFile(ns, 'ns.stock.purchase4SMarketDataTixApi()', '/Temp/purchase-4s-api.txt')) {
        log(ns, `SUCCESS: Purchased 4SMarketDataTixApi for ${formatMoney(cost4sApi)} (At ${formatDuration(playerStats.playtimeSinceLastBitnode)} into BitNode)`, true, 'success');
        return true;
    } else {
        log(ns, 'ERROR attempting to purchase 4SMarketDataTixApi!', false, 'error');
        if (!(5 in dictSourceFiles)) { // If we do not have access to bitnode multipliers, assume the cost is double and try again later
            log(ns, 'INFO: Bitnode mults are not available (SF5) - assuming everything is twice as expensive in the current bitnode.');
            bitnodeMults.FourSigmaMarketDataCost *= 2;
            bitnodeMults.FourSigmaMarketDataApiCost *= 2;
        }
    }
    return false;
}

/** @param {NS} ns **/
/** @param {Player} playerStats **/
async function tryGetStockMarketAccess(ns, playerStats, budget) {
    if (playerStats.hasTixApiAccess) return true; // Already have access
    const costWseAccount = 200E6;
    const costTixApi = 5E9;
    const totalCost = (playerStats.hasWseAccount ? 0 : costWseAccount) + costTixApi;
    if (totalCost > budget) return false;
    if (!playerStats.hasWseAccount) {
        if (await getNsDataThroughFile(ns, 'ns.stock.purchaseWseAccount()', '/Temp/purchase-wse.txt'))
            log(ns, `SUCCESS: Purchased a WSE (stockmarket) account for ${formatMoney(costWseAccount)} (At ${formatDuration(playerStats.playtimeSinceLastBitnode)} into BitNode)`, true, 'success');
        else
            log(ns, 'ERROR attempting to purchase WSE account!', false, 'error');
    }
    if (await getNsDataThroughFile(ns, 'ns.stock.purchaseTixApi()', '/Temp/purchase-tix-api.txt')) {
        log(ns, `SUCCESS: Purchased Tix (stockmarket) Api access for ${formatMoney(costTixApi)} (At ${formatDuration(playerStats.playtimeSinceLastBitnode)} into BitNode)`, true, 'success');
        return true;
    } else
        log(ns, 'ERROR attempting to purchase Tix Api!', false, 'error');
    return false;
}

function initializeHud() {
    const d = eval("document");
    let htmlDisplay = d.getElementById("stock-display-1");
    if (htmlDisplay !== null) return htmlDisplay;
    // Get the custom display elements in HUD.
    let customElements = d.getElementById("overview-extra-hook-0").parentElement.parentElement;
    // Make a clone of the hook for extra hud elements, and move it up under money
    let stockValueTracker = customElements.cloneNode(true);
    // Remove any nested elements created by stats.js
    stockValueTracker.querySelectorAll("p > p").forEach(el => el.parentElement.removeChild(el));
    // Change ids since duplicate id's are invalid
    stockValueTracker.querySelectorAll("p").forEach((el, i) => el.id = "stock-display-" + i);
    // Get out output element
    htmlDisplay = stockValueTracker.querySelector("#stock-display-1");
    // Display label and default value
    stockValueTracker.querySelectorAll("p")[0].innerText = "Stock";
    htmlDisplay.innerText = "$0.000 "
    // Insert our element right after Money
    customElements.parentElement.insertBefore(stockValueTracker, customElements.parentElement.childNodes[2]);
    return htmlDisplay;
}

/**
 * Return a formatted representation of the monetary amount using scale symbols (e.g. $6.50M)
 * @param {number} num - The number to format
 * @param {number=} maxSignificantFigures - (default: 6) The maximum significant figures you wish to see (e.g. 123, 12.3 and 1.23 all have 3 significant figures)
 * @param {number=} maxDecimalPlaces - (default: 3) The maximum decimal places you wish to see, regardless of significant figures. (e.g. 12.3, 1.2, 0.1 all have 1 decimal)
 **/
 export function formatMoney(num, maxSignificantFigures = 6, maxDecimalPlaces = 3) {
    let numberShort = formatNumberShort(num, maxSignificantFigures, maxDecimalPlaces);
    return num >= 0 ? "$" + numberShort : numberShort.replace("-", "-$");
}

const symbols = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "e33", "e36", "e39"];

/**
 * Return a formatted representation of the monetary amount using scale sympols (e.g. 6.50M) 
 * @param {number} num - The number to format
 * @param {number=} maxSignificantFigures - (default: 6) The maximum significant figures you wish to see (e.g. 123, 12.3 and 1.23 all have 3 significant figures)
 * @param {number=} maxDecimalPlaces - (default: 3) The maximum decimal places you wish to see, regardless of significant figures. (e.g. 12.3, 1.2, 0.1 all have 1 decimal)
 **/
export function formatNumberShort(num, maxSignificantFigures = 6, maxDecimalPlaces = 3) {
    if (Math.abs(num) > 10 ** (3 * symbols.length)) // If we've exceeded our max symbol, switch to exponential notation
        return num.toExponential(Math.min(maxDecimalPlaces, maxSignificantFigures - 1));
    for (var i = 0, sign = Math.sign(num), num = Math.abs(num); num >= 1000 && i < symbols.length; i++) num /= 1000;
    // TODO: A number like 9.999 once rounded to show 3 sig figs, will become 10.00, which is now 4 sig figs.
    return ((sign < 0) ? "-" : "") + num.toFixed(Math.max(0, Math.min(maxDecimalPlaces, maxSignificantFigures - Math.floor(1 + Math.log10(num))))) + symbols[i];
}

/** Convert a shortened number back into a value */
export function parseShortNumber(text = "0") {
    let parsed = Number(text);
    if (!isNaN(parsed)) return parsed;
    for (const sym of symbols.slice(1))
        if (text.toLowerCase().endsWith(sym))
            return Number.parseFloat(text.slice(0, text.length - sym.length)) * Math.pow(10, 3 * symbols.indexOf(sym));
    return Number.NaN;
}

/**
 * Return a number formatted with the specified number of significatnt figures or decimal places, whichever is more limiting.
 * @param {number} num - The number to format
 * @param {number=} minSignificantFigures - (default: 6) The minimum significant figures you wish to see (e.g. 123, 12.3 and 1.23 all have 3 significant figures)
 * @param {number=} minDecimalPlaces - (default: 3) The minimum decimal places you wish to see, regardless of significant figures. (e.g. 12.3, 1.2, 0.1 all have 1 decimal)
 **/
export function formatNumber(num, minSignificantFigures = 3, minDecimalPlaces = 1) {
    return num == 0.0 ? num : num.toFixed(Math.max(minDecimalPlaces, Math.max(0, minSignificantFigures - Math.ceil(Math.log10(num)))));
}

/** Formats some RAM amount as a round number of GB with thousands separators e.g. `1,028 GB` */
export function formatRam(num) { return `${Math.round(num).toLocaleString('en')} GB`; }

/** Return a datatime in ISO format */
export function formatDateTime(datetime) { return datetime.toISOString(); }

/** Format a duration (in milliseconds) as e.g. '1h 21m 6s' for big durations or e.g '12.5s' / '23ms' for small durations */
export function formatDuration(duration) {
    if (duration < 1000) return `${duration.toFixed(0)}ms`
    if (!isFinite(duration)) return 'forever (Infinity)'
    const portions = [];
    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(duration / msInHour);
    if (hours > 0) {
        portions.push(hours + 'h');
        duration -= (hours * msInHour);
    }
    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(duration / msInMinute);
    if (minutes > 0) {
        portions.push(minutes + 'm');
        duration -= (minutes * msInMinute);
    }
    let seconds = (duration / 1000.0)
    // Include millisecond precision if we're on the order of seconds
    seconds = (hours == 0 && minutes == 0) ? seconds.toPrecision(3) : seconds.toFixed(0);
    if (seconds > 0) {
        portions.push(seconds + 's');
        duration -= (minutes * 1000);
    }
    return portions.join(' ');
}

/** Generate a hashCode for a string that is pretty unique most of the time */
export function hashCode(s) { return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0); }

/** @param {NS} ns **/
export function disableLogs(ns, listOfLogs) { ['disableLog'].concat(...listOfLogs).forEach(log => checkNsInstance(ns, '"disableLogs"').disableLog(log)); }

/** Joins all arguments as components in a path, e.g. pathJoin("foo", "bar", "/baz") = "foo/bar/baz" **/
export function pathJoin(...args) {
    return args.filter(s => !!s).join('/').replace(/\/\/+/g, '/');
}

/** Gets the path for the given local file, taking into account optional subfolder relocation via git-pull.js **/
export function getFilePath(file) {
    const subfolder = '';  // git-pull.js optionally modifies this when downloading
    return pathJoin(subfolder, file);
}

// FUNCTIONS THAT PROVIDE ALTERNATIVE IMPLEMENTATIONS TO EXPENSIVE NS FUNCTIONS
// VARIATIONS ON NS.RUN

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.run in your script **/
export function getFnRunViaNsRun(ns) { return checkNsInstance(ns, '"getFnRunViaNsRun"').run; }

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.exec in your script **/
export function getFnRunViaNsExec(ns, host = "home") {
    checkNsInstance(ns, '"getFnRunViaNsExec"');
    return function (scriptPath, ...args) { return ns.exec(scriptPath, host, ...args); }
}
// VARIATIONS ON NS.ISRUNNING

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.run in your script  */
export function getFnIsAliveViaNsIsRunning(ns) { return checkNsInstance(ns, '"getFnIsAliveViaNsIsRunning"').isRunning; }

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.ps in your script  */
export function getFnIsAliveViaNsPs(ns) {
    checkNsInstance(ns, '"getFnIsAliveViaNsPs"');
    return function (pid, host) { return ns.ps(host).some(process => process.pid === pid); }
}

/**
 * Retrieve the result of an ns command by executing it in a temporary .js script, writing the result to a file, then shuting it down
 * Importing incurs a maximum of 1.1 GB RAM (0 GB for ns.read, 1 GB for ns.run, 0.1 GB for ns.isRunning).
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 * @param {bool=} verbose - (default false) If set to true, pid and result of command are logged.
 **/
export async function getNsDataThroughFile(ns, command, fName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
    checkNsInstance(ns, '"getNsDataThroughFile"');
    if (!verbose) disableLogs(ns, ['run', 'isRunning']);
    return await getNsDataThroughFile_Custom(ns, ns.run, ns.isRunning, command, fName, args, verbose, maxRetries, retryDelayMs);
}

/**
 * An advanced version of getNsDataThroughFile that lets you pass your own "fnRun" and "fnIsAlive" implementations to reduce RAM requirements
 * Importing incurs no RAM (now that ns.read is free) plus whatever fnRun / fnIsAlive you provide it
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnRun - A single-argument function used to start the new sript, e.g. `ns.run` or `(f,...args) => ns.exec(f, "home", ...args)`
 * @param {function} fnIsAlive - A single-argument function used to start the new sript, e.g. `ns.isRunning` or `pid => ns.ps("home").some(process => process.pid === pid)`
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 **/
export async function getNsDataThroughFile_Custom(ns, fnRun, fnIsAlive, command, fName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
    checkNsInstance(ns, '"getNsDataThroughFile_Custom"');
    if (!verbose) disableLogs(ns, ['read']);
    const commandHash = hashCode(command);
    fName = fName || `/Temp/${commandHash}-data.txt`;
    const fNameCommand = (fName || `/Temp/${commandHash}-command`) + '.js'
    // Pre-write contents to the file that will allow us to detect if our temp script never got run
    const initialContents = "<Insufficient RAM>";
    await ns.write(fName, initialContents, 'w');
    // Prepare a command that will write out a new file containing the results of the command
    // unless it already exists with the same contents (saves time/ram to check first)
    // If an error occurs, it will write an empty file to avoid old results being misread.
    const commandToFile = `let r;try{r=JSON.stringify(\n` +
        `    ${command}\n` +
        `);}catch(e){r="ERROR: "+(typeof e=='string'?e:e.message||JSON.stringify(e));}\n` +
        `const f="${fName}"; if(ns.read(f)!==r) await ns.write(f,r,'w')`;
    // Run the command with auto-retries if it fails
    const pid = await runCommand_Custom(ns, fnRun, commandToFile, fNameCommand, args, verbose, maxRetries, retryDelayMs);
    // Wait for the process to complete
    await waitForProcessToComplete_Custom(ns, fnIsAlive, pid, verbose);
    if (verbose) ns.print(`Process ${pid} is done. Reading the contents of ${fName}...`);
    // Read the file, with auto-retries if it fails // TODO: Unsure reading a file can fail or needs retrying. 
    let lastRead;
    const fileData = await autoRetry(ns, () => ns.read(fName),
        f => (lastRead = f) !== undefined && f !== "" && f !== initialContents && !(typeof f == "string" && f.startsWith("ERROR: ")),
        () => `\nns.read('${fName}') returned a bad result: "${lastRead}".` +
            `\n  Script:  ${fNameCommand}\n  Args:    ${JSON.stringify(args)}\n  Command: ${command}` +
            (lastRead == undefined ? '\nThe developer has no idea how this could have happened. Please post a screenshot of this error on discord.' :
                lastRead == initialContents ? `\nThe script that ran this will likely recover and try again later once you have more free ram.` :
                    lastRead == "" ? `\nThe file appears to have been deleted before a result could be retrieved. Perhaps there is a conflicting script.` :
                        `\nThe script was likely passed invalid arguments. Please post a screenshot of this error on discord.`),
        maxRetries, retryDelayMs, undefined, verbose, verbose);
    if (verbose) ns.print(`Read the following data for command ${command}:\n${fileData}`);
    return JSON.parse(fileData); // Deserialize it back into an object/array and return
}

/** Evaluate an arbitrary ns command by writing it to a new script and then running or executing it.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 * @param {bool=} verbose - (default false) If set to true, the evaluation result of the command is printed to the terminal
 */
export async function runCommand(ns, command, fileName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
    checkNsInstance(ns, '"runCommand"');
    if (!verbose) disableLogs(ns, ['run']);
    return await runCommand_Custom(ns, ns.run, command, fileName, args, verbose, maxRetries, retryDelayMs);
}

const _cachedExports = [];
/** @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @returns {string[]} The set of all funciton names exported by this file. */
function getExports(ns) {
    if (_cachedExports.length > 0) return _cachedExports;
    const scriptHelpersRows = ns.read(getFilePath('helpers.js')).split("\n");
    for (const row of scriptHelpersRows) {
        if (!row.startsWith("export")) continue;
        const funcNameStart = row.indexOf("function") + "function".length + 1;
        const funcNameEnd = row.indexOf("(", funcNameStart);
        _cachedExports.push(row.substring(funcNameStart, funcNameEnd));
    }
    return _cachedExports;
}

/**
 * An advanced version of runCommand that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnRun, fnWrite are implemented using another ns function you already reference elsewhere like ns.exec)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnRun - A single-argument function used to start the new sript, e.g. `ns.run` or `(f,...args) => ns.exec(f, "home", ...args)`
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 **/
export async function runCommand_Custom(ns, fnRun, command, fileName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
    checkNsInstance(ns, '"runCommand_Custom"');
    if (!Array.isArray(args)) throw new Error(`args specified were a ${typeof args}, but an array is required.`);
    if (verbose) // In verbose mode, wrap the command in something that will dump it's output to the terminal
        command = `try { let output = ${command}; ns.tprint(JSON.stringify(output)); } ` +
            `catch(e) { ns.tprint('ERROR: '+(typeof e=='string'?e:e.message||JSON.stringify(e))); throw(e); }`;
    else disableLogs(ns, ['sleep']);
    // Auto-import any helpers that the temp script attempts to use
    const required = getExports(ns).filter(e => command.includes(`${e}(`));
    let script = (required.length > 0 ? `import { ${required.join(", ")} } from 'helpers.js'\n` : '') +
        `export async function main(ns) { ${command} }`;
    fileName = fileName || `/Temp/${hashCode(command)}-command.js`;
    // It's possible for the file to be deleted while we're trying to execute it, so even wrap writing the file in a retry
    return await autoRetry(ns, async () => {
        // To improve performance, don't re-write the temp script if it's already in place with the correct contents.
        const oldContents = ns.read(fileName);
        if (oldContents != script) {
            if (oldContents) // Create some noise if temp scripts are being created with the same name but different contents
                ns.tprint(`WARNING: Had to overwrite temp script ${fileName}\nOld Contents:\n${oldContents}\nNew Contents:\n${script}` +
                    `\nThis warning is generated as part of an effort to switch over to using only 'immutable' temp scripts. ` +
                    `Please paste a screenshot in Discord at https://discord.com/channels/415207508303544321/935667531111342200`);
            await ns.write(fileName, script, "w");
            // Wait for the script to appear and be readable (game can be finicky on actually completing the write)
            await autoRetry(ns, () => ns.read(fileName), c => c == script, () => `Temporary script ${fileName} is not available, ` +
                `despite having written it. (Did a competing process delete or overwrite it?)`, maxRetries, retryDelayMs, undefined, verbose, verbose);
        }
        // Run the script, now that we're sure it is in place
        return fnRun(fileName, 1 /* Always 1 thread */, ...args);
    }, pid => pid !== 0,
        () => `The temp script was not run (likely due to insufficient RAM).` +
            `\n  Script:  ${fileName}\n  Args:    ${JSON.stringify(args)}\n  Command: ${command}` +
            `\nThe script that ran this will likely recover and try again later once you have more free ram.`,
        maxRetries, retryDelayMs, undefined, verbose, verbose);
}

/**
 * Wait for a process id to complete running
 * Importing incurs a maximum of 0.1 GB RAM (for ns.isRunning) 
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {int} pid - The process id to monitor
 * @param {bool=} verbose - (default false) If set to true, pid and result of command are logged.
 **/
export async function waitForProcessToComplete(ns, pid, verbose) {
    checkNsInstance(ns, '"waitForProcessToComplete"');
    if (!verbose) disableLogs(ns, ['isRunning']);
    return await waitForProcessToComplete_Custom(ns, ns.isRunning, pid, verbose);
}
/**
 * An advanced version of waitForProcessToComplete that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnIsAlive is implemented using another ns function you already reference elsewhere like ns.ps) 
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnIsAlive - A single-argument function used to start the new sript, e.g. `ns.isRunning` or `pid => ns.ps("home").some(process => process.pid === pid)`
 **/
export async function waitForProcessToComplete_Custom(ns, fnIsAlive, pid, verbose) {
    checkNsInstance(ns, '"waitForProcessToComplete_Custom"');
    if (!verbose) disableLogs(ns, ['sleep']);
    // Wait for the PID to stop running (cheaper than e.g. deleting (rm) a possibly pre-existing file and waiting for it to be recreated)
    let start = Date.now();
    let sleepMs = 1;
    for (var retries = 0; retries < 1000; retries++) {
        if (!fnIsAlive(pid)) break; // Script is done running
        if (verbose && retries % 100 === 0) ns.print(`Waiting for pid ${pid} to complete... (${formatDuration(Date.now() - start)})`);
        await ns.sleep(sleepMs);
        sleepMs = Math.min(sleepMs * 2, 200);
    }
    // Make sure that the process has shut down and we haven't just stopped retrying
    if (fnIsAlive(pid)) {
        let errorMessage = `run-command pid ${pid} is running much longer than expected. Max retries exceeded.`;
        ns.print(errorMessage);
        throw new Error(errorMessage);
    }
}

/** Helper to retry something that failed temporarily (can happen when e.g. we temporarily don't have enough RAM to run)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export async function autoRetry(ns, fnFunctionThatMayFail, fnSuccessCondition, errorContext = "Success condition not met",
    maxRetries = 5, initialRetryDelayMs = 50, backoffRate = 3, verbose = false, tprintFatalErrors = true) {
    checkNsInstance(ns, '"autoRetry"');
    let retryDelayMs = initialRetryDelayMs, attempts = 0;
    while (attempts++ <= maxRetries) {
        try {
            const result = await fnFunctionThatMayFail()
            const error = typeof errorContext === 'string' ? errorContext : errorContext();
            if (!fnSuccessCondition(result))
                throw (typeof error === 'string' ? new Error(error) : error);
            return result;
        }
        catch (error) {
            const fatal = attempts >= maxRetries;
            log(ns, `${fatal ? 'FAIL' : 'INFO'}: Attempt ${attempts} of ${maxRetries} failed` +
                (fatal ? `: ${String(error)}` : `. Trying again in ${retryDelayMs}ms...`),
                tprintFatalErrors && fatal, !verbose ? undefined : (fatal ? 'error' : 'info'))
            if (fatal) throw error;
            await ns.sleep(retryDelayMs);
            retryDelayMs *= backoffRate;
        }
    }
}

/** Helper to log a message, and optionally also tprint it and toast it
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function logr(ns, message = "", alsoPrintToTerminal = false, toastStyle = "", maxToastLength = Number.MAX_SAFE_INTEGER) {
    checkNsInstance(ns, '"log"');
    ns.print(message);
    if (toastStyle) ns.toast(message.length <= maxToastLength ? message : message.substring(0, maxToastLength - 3) + "...", toastStyle);
    if (alsoPrintToTerminal) {
        ns.tprint(message);
        // TODO: Find a way write things logged to the terminal to a "permanent" terminal log file, preferably without this becoming an async function.
        //       Perhaps we copy logs to a port so that a separate script can optionally pop and append them to a file.
        //ns.write("log.terminal.txt", message + '\n', 'a'); // Note: we should get away with not awaiting this promise since it's not a script file
    }
    return message;
}

/** Helper to get a list of all hostnames on the network
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function scanAllServers(ns) {
    checkNsInstance(ns, '"scanAllServers"');
    let discoveredHosts = []; // Hosts (a.k.a. servers) we have scanned
    let hostsToScan = ["home"]; // Hosts we know about, but have no yet scanned
    let infiniteLoopProtection = 9999; // In case you mess with this code, this should save you from getting stuck
    while (hostsToScan.length > 0 && infiniteLoopProtection-- > 0) { // Loop until the list of hosts to scan is empty
        let hostName = hostsToScan.pop(); // Get the next host to be scanned
        for (const connectedHost of ns.scan(hostName)) // "scan" (list all hosts connected to this one)
            if (!discoveredHosts.includes(connectedHost)) // If we haven't already scanned this host
                hostsToScan.push(connectedHost); // Add it to the queue of hosts to be scanned
        discoveredHosts.push(hostName); // Mark this host as "scanned"
    }
    return discoveredHosts; // The list of scanned hosts should now be the set of all hosts in the game!
}

/** @param {NS} ns 
 * Get a dictionary of active source files, taking into account the current active bitnode as well (optionally disabled). **/
export async function getActiveSourceFiles(ns, includeLevelsFromCurrentBitnode = true) {
    return await getActiveSourceFiles_Custom(ns, getNsDataThroughFile, includeLevelsFromCurrentBitnode);
}

/** @param {NS} ns 
 * getActiveSourceFiles Helper that allows the user to pass in their chosen implementation of getNsDataThroughFile to minimize RAM usage **/
export async function getActiveSourceFiles_Custom(ns, fnGetNsDataThroughFile, includeLevelsFromCurrentBitnode = true) {
    checkNsInstance(ns, '"getActiveSourceFiles"');
    // Find out what source files the user has unlocked
    let dictSourceFiles;
    try {
        dictSourceFiles = await fnGetNsDataThroughFile(ns, `Object.fromEntries(ns.getOwnedSourceFiles().map(sf => [sf.n, sf.lvl]))`, '/Temp/owned-source-files.txt');
    } catch { dictSourceFiles = {}; } // If this fails (e.g. low RAM), return an empty dictionary
    // If the user is currently in a given bitnode, they will have its features unlocked
    if (includeLevelsFromCurrentBitnode) {
        try {
            const bitNodeN = (await fnGetNsDataThroughFile(ns, 'ns.getPlayer()', '/Temp/player-info.txt')).bitNodeN;
            dictSourceFiles[bitNodeN] = Math.max(3, dictSourceFiles[bitNodeN] || 0);
        } catch { /* We are expected to be fault-tolerant in low-ram conditions */ }
    }
    return dictSourceFiles;
}

/** @param {NS} ns 
 * Return bitnode multiplers, or null if they cannot be accessed. **/
export async function tryGetBitNodeMultipliers(ns) {
    return await tryGetBitNodeMultipliers_Custom(ns, getNsDataThroughFile);
}

/** @param {NS} ns
 * tryGetBitNodeMultipliers Helper that allows the user to pass in their chosen implementation of getNsDataThroughFile to minimize RAM usage **/
export async function tryGetBitNodeMultipliers_Custom(ns, fnGetNsDataThroughFile) {
    checkNsInstance(ns, '"tryGetBitNodeMultipliers"');
    let canGetBitNodeMultipliers = false;
    try { canGetBitNodeMultipliers = 5 in (await getActiveSourceFiles_Custom(ns, fnGetNsDataThroughFile)); } catch { }
    if (!canGetBitNodeMultipliers) return null;
    try { return await fnGetNsDataThroughFile(ns, 'ns.getBitNodeMultipliers()', '/Temp/bitnode-multipliers.txt'); } catch { }
    return null;
}

/** @param {NS} ns 
 * Returns the number of instances of the current script running on the specified host. **/
export async function instanceCount(ns, onHost = "home", warn = true, tailOtherInstances = true) {
    checkNsInstance(ns, '"alreadyRunning"');
    const scriptName = ns.getScriptName();
    const others = await getNsDataThroughFile(ns, 'ns.ps(ns.args[0]).filter(p => p.filename == ns.args[1]).map(p => p.pid)',
        '/Temp/ps-other-instances.txt', [onHost, scriptName]);
    if (others.length >= 2) {
        if (warn)
            log(ns, `WARNING: You cannot start multiple versions of this script (${scriptName}). Please shut down the other instance first.` +
                (tailOtherInstances ? ' (To help with this, a tail window for the other instance will be opened)' : ''), true, 'warning');
        if (tailOtherInstances) // Tail all but the last pid, since it will belong to the current instance (which will be shut down)
            others.slice(0, others.length - 1).forEach(pid => ns.tail(pid));
    }
    return others.length;
}

let cachedStockSymbols; // Cache of stock symbols since these never change

/** Helper function to get the total value of stocks using as little RAM as possible.
 * @param {NS} ns
 * @param {Player} player - If you have previously retrieved player info, you can provide that here to save some time.
 * @param {string[]} stockSymbols - If you have previously retrieved a list of all stock symbols, you can provide that here to save some time. */
export async function getStocksValue(ns, player = null, stockSymbols = null) {
    if (!(player || await getNsDataThroughFile(ns, 'ns.getPlayer()', '/Temp/getPlayer.txt')).hasTixApiAccess) return 0;
    if (!stockSymbols || stockSymbols.length == 0) {
        if (!cachedStockSymbols)
            cachedStockSymbols = await getNsDataThroughFile(ns, `ns.stock.getSymbols()`, '/Temp/stock-symbols.txt');
        stockSymbols = cachedStockSymbols;
    }
    const helper = async (fn) => await getNsDataThroughFile(ns,
        `Object.fromEntries(ns.args.map(sym => [sym, ns.stock.${fn}(sym)]))`, `/Temp/stock-${fn}.txt`, stockSymbols);
    const askPrices = await helper('getAskPrice');
    const bidPrices = await helper('getBidPrice');
    const positions = await helper('getPosition');
    return stockSymbols.map(sym => ({ sym, pos: positions[sym], ask: askPrices[sym], bid: bidPrices[sym] }))
        .reduce((total, stk) => total + (stk.pos[0] * stk.bid) /* Long Value */ + stk.pos[2] * (stk.pos[3] * 2 - stk.ask) /* Short Value */
            // Subtract commission only if we have one or more shares (this is money we won't get when we sell our position)
            // If for some crazy reason we have shares both in the short and long position, we'll have to pay the commission twice (two separate sales)
            - 100000 * (Math.sign(stk.pos[0]) + Math.sign(stk.pos[2])), 0);
}

/** @param {NS} ns 
 * Returns a helpful error message if we forgot to pass the ns instance to a function */
export function checkNsInstance(ns, fnName = "this function") {
    if (!ns.print) throw new Error(`The first argument to ${fnName} should be a 'ns' instance.`);
    return ns;
}

/** A helper to parse the command line arguments with a bunch of extra features, such as
 * - Loading a persistent defaults override from a local config file named after the script.
 * - Rendering "--help" output without all scripts having to explicitly specify it
 * @param {NS} ns
 * @param {[string, string | number | boolean | string[]][]} argsSchema - Specification of possible command line args. **/
export function getConfiguration(ns, argsSchema) {
    checkNsInstance(ns, '"getConfig"');
    const scriptName = ns.getScriptName();
    // If the user has a local config file, override the defaults in the argsSchema
    const confName = `${scriptName}.config.txt`;
    const overrides = ns.read(confName);
    const overriddenSchema = overrides ? [...argsSchema] : argsSchema; // Clone the original args schema    
    if (overrides) {
        try {
            let parsedOverrides = JSON.parse(overrides); // Expect a parsable dict or array of 2-element arrays like args schema
            if (Array.isArray(parsedOverrides)) parsedOverrides = Object.fromEntries(parsedOverrides);
            log(ns, `INFO: Applying ${Object.keys(parsedOverrides).length} overriding default arguments from "${confName}"...`);
            for (const key in parsedOverrides) {
                const override = parsedOverrides[key];
                const matchIndex = overriddenSchema.findIndex(o => o[0] == key);
                const match = matchIndex === -1 ? null : overriddenSchema[matchIndex];
                if (!match)
                    throw new Error(`Unrecognized key "${key}" does not match of this script's options: ` + JSON.stringify(argsSchema.map(a => a[0])));
                else if (override === undefined)
                    throw new Error(`The key "${key}" appeared in the config with no value. Some value must be provided. Try null?`);
                else if (match && JSON.stringify(match[1]) != JSON.stringify(override)) {
                    if (typeof (match[1]) !== typeof (override))
                        log(ns, `WARNING: The "${confName}" overriding "${key}" value: ${JSON.stringify(override)} has a different type (${typeof override}) than the ` +
                            `current default value ${JSON.stringify(match[1])} (${typeof match[1]}). The resulting behaviour may be unpredictable.`, false, 'warning');
                    else
                        log(ns, `INFO: Overriding "${key}" value: ${JSON.stringify(match[1])}  ->  ${JSON.stringify(override)}`);
                    overriddenSchema[matchIndex] = { ...match }; // Clone the (previously shallow-copied) object at this position of the new argsSchema
                    overriddenSchema[matchIndex][1] = override; // Update the value of the clone.
                }
            }
        } catch (err) {
            log(ns, `ERROR: There's something wrong with your config file "${confName}", it cannot be loaded.` +
                `\nThe error encountered was: ${(typeof err === 'string' ? err : err.message || JSON.stringify(err))}` +
                `\nYour config file should either be a dictionary e.g.: { "string-opt": "value", "num-opt": 123, "array-opt": ["one", "two"] }` +
                `\nor an array of dict entries (2-element arrays) e.g.: [ ["string-opt", "value"], ["num-opt", 123], ["array-opt", ["one", "two"]] ]` +
                `\n"${confName}" contains:\n${overrides}`, true, 'error', 80);
            return null;
        }
    }
    // Return the result of using the in-game args parser to combine the defaults with the command line args provided
    try {
        const finalOptions = ns.flags(overriddenSchema);
        log(ns, `INFO: Running ${scriptName} with the following settings:` + Object.keys(finalOptions).filter(a => a != "_").map(a =>
            `\n  ${a.length == 1 ? "-" : "--"}${a} = ${finalOptions[a] === null ? "null" : JSON.stringify(finalOptions[a])}`).join("") +
            `\nrun ${scriptName} --help  to get more information about these options.`)
        return finalOptions;
    } catch (err) { // Detect if the user passed invalid arguments, and return help text
        const error = ns.args.includes("help") || ns.args.includes("--help") ? null : // Detect if the user explictly asked for help and suppress the error
            (typeof err === 'string' ? err : err.message || JSON.stringify(err));
        // Try to parse documentation about each argument from the source code's comments
        const source = ns.read(scriptName).split("\n");
        let argsRow = 1 + source.findIndex(row => row.includes("argsSchema ="));
        const optionDescriptions = {}
        while (argsRow && argsRow < source.length) {
            const nextArgRow = source[argsRow++].trim();
            if (nextArgRow.length == 0) continue;
            if (nextArgRow[0] == "]" || nextArgRow.includes(";")) break; // We've reached the end of the args schema
            const commentSplit = nextArgRow.split("//").map(e => e.trim());
            if (commentSplit.length != 2) continue; // This row doesn't appear to be in the format: [option...], // Comment
            const optionSplit = commentSplit[0].split("'"); // Expect something like: ['name', someDefault]. All we need is the name
            if (optionSplit.length < 2) continue;
            optionDescriptions[optionSplit[1]] = commentSplit[1];
        }
        log(ns, (error ? `ERROR: There was an error parsing the script arguments provided: ${error}\n` : 'INFO: ') +
            `${scriptName} possible arguments:` + argsSchema.map(a => `\n  ${a[0].length == 1 ? " -" : "--"}${a[0].padEnd(30)} ` +
                `Default: ${(a[1] === null ? "null" : JSON.stringify(a[1])).padEnd(10)}` +
                (a[0] in optionDescriptions ? ` // ${optionDescriptions[a[0]]}` : '')).join("") + '\n' +
            `\nTip: All argument names, and some values support auto-complete. Hit the <tab> key to autocomplete or see possible options.` +
            `\nTip: Array arguments are populated by specifying the argument multiple times, e.g.:` +
            `\n       run ${scriptName} --arrayArg first --arrayArg second --arrayArg third  to run the script with arrayArg=[first, second, third]` +
            (!overrides ? `\nTip: You can override the default values by creating a config file named "${confName}" containing e.g.: { "arg-name": "preferredValue" }`
                : overrides && !error ? `\nNote: The default values are being modified by overrides in your local "${confName}":\n${overrides}`
                    : `\nThis error may have been caused by your local overriding "${confName}" (especially if you changed the types of any options):\n${overrides}`), true);
        return null; // Caller should handle null and shut down elegantly.
    }
}

/** In order to pass in args to pass along to the startup/completion script, they may have to be quoted, when given as
 * parameters to this script, but those quotes will have to be stripped when passing these along to a subsequent script as raw strings.
 * @param {string[]} args - The the array-argument passed to the script.
 * @returns {string[]} The the array-argument unescaped (or deserialized if a single argument starting with '[' was supplied]). */
export function unEscapeArrayArgs(args) {
    // For convenience, also support args as a single stringified array
    if (args.length == 1 && args[0].startsWith("[")) return JSON.parse(args[0]);
    // Otherwise, args wrapped in quotes should have those quotes removed.
    const escapeChars = ['"', "'", "`"];
    return args.map(arg => escapeChars.some(c => arg.startsWith(c) && arg.endsWith(c)) ? arg.slice(1, -1) : arg);
}
