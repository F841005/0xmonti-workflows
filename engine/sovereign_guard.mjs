export class SovereignThreatGuard {
    constructor(windowMs = 60000, maxRequests = 50) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.clientRegistry = new Map();
        setInterval(() => {
            const now = Date.now();
            for (const [ip, record] of this.clientRegistry.entries()) {
                if (now - record.startTime > this.windowMs) this.clientRegistry.delete(ip);
            }
        }, 120000);
    }
    inspect(req) {
        const ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';
        const now = Date.now();
        if (!this.clientRegistry.has(ip)) {
            this.clientRegistry.set(ip, { count: 1, startTime: now });
            return true;
        }
        const clientData = this.clientRegistry.get(ip);
        if (now - clientData.startTime > this.windowMs) {
            clientData.count = 1;
            clientData.startTime = now;
            return true;
        }
        clientData.count++;
        return clientData.count <= this.maxRequests;
    }
}
