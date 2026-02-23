const { WebSocketServer } = require('ws');

/**
 * WebSocket Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Upgrades the existing HTTP server to support WebSocket connections.
 * Clients connect to ws://localhost:5000 and receive real-time crisis alerts
 * whenever new environmental data is ingested via POST /data.
 *
 * Message Types pushed to clients:
 * ┌─────────────────┬───────────────────────────────────────────────┐
 * │ CONNECTED       │ Sent once on connection with current status   │
 * │ RISK_UPDATE     │ Sent on new data ingestion with updated risk  │
 * │ PING            │ Keepalive, client should respond with PONG    │
 * └─────────────────┴───────────────────────────────────────────────┘
 *
 * Connection example (browser console):
 *   const ws = new WebSocket('ws://localhost:5000');
 *   ws.onmessage = e => console.log(JSON.parse(e.data));
 */

const initWebSocket = (httpServer, app) => {
    const wss = new WebSocketServer({ server: httpServer });

    wss.on('connection', (ws, req) => {
        console.log(`📡 WebSocket client connected from ${req.socket.remoteAddress}`);

        // Send current connection status immediately
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'CitySentinel AI real-time feed connected.',
            timestamp: new Date().toISOString(),
        }));

        // Handle incoming client messages
        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw);
                if (msg.type === 'PONG') return; // keepalive response
                console.log('📨 WS message received:', msg);
            } catch (_) { /* ignore malformed messages */ }
        });

        ws.on('close', () => {
            console.log('📡 WebSocket client disconnected.');
        });

        ws.on('error', (err) => {
            console.error('📡 WebSocket error:', err.message);
        });
    });

    // Keepalive ping every 30s to prevent idle disconnections
    const pingInterval = setInterval(() => {
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
            }
        });
    }, 30000);

    wss.on('close', () => clearInterval(pingInterval));

    // Attach wss to Express app so routes can access it
    app.set('wss', wss);

    console.log('📡 WebSocket server initialized on same port.');
    return wss;
};

module.exports = { initWebSocket };
