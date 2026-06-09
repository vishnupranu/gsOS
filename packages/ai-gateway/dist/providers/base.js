export class BaseProvider {
    getHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
        return headers;
    }
    getTimeout(config) {
        return config.timeout ?? 60000;
    }
    getMaxRetries(config) {
        return config.maxRetries ?? 3;
    }
    async createCompletion(request, config) {
        const url = this.buildUrl(config);
        const headers = this.getHeaders(config);
        const timeout = this.getTimeout(config);
        const maxRetries = this.getMaxRetries(config);
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(this.transformRequest(request)),
                }, timeout);
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorBody}`);
                }
                const data = await response.json();
                return this.transformResponse(data);
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }
    async *createStreamingCompletion(request, config) {
        if (!this.supportsStreaming()) {
            throw new Error(`Provider ${this.name} does not support streaming`);
        }
        const url = this.buildUrl(config);
        const headers = this.getHeaders(config);
        headers['Accept'] = 'text/event-stream';
        headers['Cache-Control'] = 'no-cache';
        headers['Connection'] = 'keep-alive';
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(this.transformRequest(request)),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            return;
                        try {
                            const parsed = JSON.parse(data);
                            yield this.transformStreamingChunk(parsed);
                        }
                        catch {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            return await fetch(url, {
                ...options,
                signal: controller.signal,
            });
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=base.js.map