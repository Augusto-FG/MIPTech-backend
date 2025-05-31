class OpenRouterAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://openrouter.ai/api/v1";
  }

    async sendChatMessage(messages) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MyApp"
        },
        body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: messages // ahora acepta array completo
        })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter API error: ${err}`);
        }

        return await response.json();
    }
}

module.exports = OpenRouterAPIClient;
