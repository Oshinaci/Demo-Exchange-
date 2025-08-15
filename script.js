// --- TradingView Chart ---
new TradingView.widget({
    "width": "100%",
    "height": "100%",
    "symbol": "BINANCE:BTCUSDT",
    "interval": "30",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#111",
    "enable_publishing": false,
    "hide_legend": false,
    "container_id": "chart"
});

// --- WebSocket Binance ---
const priceEl = document.getElementById('price');
const bidsEl = document.querySelector('#bids tbody');
const asksEl = document.querySelector('#asks tbody');
const tradesEl = document.querySelector('#trades tbody');

// Harga Live
let wsTicker = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
wsTicker.onmessage = (event) => {
    let data = JSON.parse(event.data);
    let price = parseFloat(data.c).toFixed(2);
    let change = parseFloat(data.P).toFixed(2);
    priceEl.textContent = `$${price} (${change}%)`;
    priceEl.style.color = change >= 0 ? 'lime' : 'red';
};

// Order Book
let wsDepth = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms');
wsDepth.onmessage = (event) => {
    let data = JSON.parse(event.data);
    bidsEl.innerHTML = '';
    asksEl.innerHTML = '';
    data.bids.forEach(b => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td class="green">${parseFloat(b[0]).toFixed(2)}</td>`;
        bidsEl.appendChild(tr);
    });
    data.asks.forEach(a => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td class="red">${parseFloat(a[0]).toFixed(2)}</td>`;
        asksEl.appendChild(tr);
    });
};

// Trade History
let wsTrades = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
let tradeHistory = [];
wsTrades.onmessage = (event) => {
    let data = JSON.parse(event.data);
    tradeHistory.unshift({
        price: parseFloat(data.p).toFixed(2),
        qty: parseFloat(data.q).toFixed(4),
        time: new Date(data.T).toLocaleTimeString()
    });
    if (tradeHistory.length > 30) tradeHistory.pop();

    tradesEl.innerHTML = '';
    tradeHistory.forEach((t, i) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="${i === 0 || t.price >= tradeHistory[i - 1]?.price ? 'green' : 'red'}">${t.price}</td>
            <td>${t.qty}</td>
            <td>${t.time}</td>
        `;
        tradesEl.appendChild(tr);
    });
};
