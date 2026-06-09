export class GeminiProvider {
    name = 'gemini';
    defaultBaseURL = 'https://generativelanguage.googleapis.com/v1beta';
    defaultModel = 'gemini-1.5-pro';
    supportsStreaming() {
        return true;
    }
    mapModelName(model) {
        const modelMap = {
            'gemini-pro': 'gemini-1.5-pro',
            'gemini-pro-vision': 'gemini-1.5-flash',
            'gemini-1.5-pro': 'gemini-1.5-pro',
            'gemini-1.5-flash': 'gemini-1.5-flash',
        };
        return modelMap[model] ?? model;
    }
    buildUrl(config) {
        const model = config.defaultModel ?? this.defaultModel;
        return `${this.defaultBaseURL}/models/${model}:generateContent?key=${config.apiKey ?? ''}`;
    }
    transformRequest(request) {
        const contents = request.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
        return {
            contents,
            generationConfig: {
                temperature: request.temperature,
                topP: request.topP,
                maxOutputTokens: request.maxTokens,
                stopSequences: request.stop,
            },
        };
    }
    transformResponse(data) {
        const d = data;
        const candidates = d.candidates;
        const firstCandidate = candidates?.[0];
        const content = firstCandidate?.content;
        const parts = content?.parts;
        return {
            id: `gemini-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: d.modelVersion ?? this.defaultModel,
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: parts?.[0]?.text ?? '',
                    },
                    finishReason: firstCandidate?.finishReason ?? 'stop',
                },
            ],
        };
    }
    transformStreamingChunk(data) {
        const d = data;
        const candidates = d.candidates;
        const firstCandidate = candidates?.[0];
        const content = firstCandidate?.content;
        const parts = content?.parts;
        return {
            id: d.promptTokenCount ? `gemini-${Date.now()}` : d.name,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: d.modelVersion ?? this.defaultModel,
            choices: [
                {
                    index: 0,
                    delta: parts?.[0] ? { content: parts[0].text } : {},
                    finishReason: firstCandidate?.finishReason,
                },
            ],
        };
    }
    async createCompletion(request, config) {
        const url = this.buildUrl(config);
        const timeout = config.timeout ?? 60000;
        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.transformRequest(request)),
        }, timeout);
        const data = await response.json();
        return this.transformResponse(data);
    }
    async *createStreamingCompletion(request, config) {
        const url = this.buildUrl(config).replace('generateContent', 'streamGenerateContent');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.transformRequest(request)),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('No response body');
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
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            yield this.transformStreamingChunk(parsed);
                        }
                        catch {
                            // Skip invalid JSON
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
            return await fetch(url, { ...options, signal: controller.signal });
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}
//# sourceMappingURL=gemini.js.map