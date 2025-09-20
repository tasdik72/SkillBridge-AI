const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const realAIService = {
  generateRoadmap: async (goal: string, level: string) => {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured in .env file');
    }

    const prompt = `You are an expert curriculum designer. A user with a skill level of '${level}' wants to learn '${goal}'. Create a structured learning roadmap in JSON format. The JSON object must have 'title', 'description', 'domain', and a 'milestones' array. Each milestone object in the array must have 'title', 'desc', 'duration_days', 'deliverable', 'reward_usd', and a 'resources' array. Each item in the 'resources' array should be an object with 'type' (e.g., 'article', 'video', 'docs') and 'url'. Find real, high-quality URLs for these resources. The 'reward_usd' should be a small, symbolic amount, like $1, $2.50, or $5. Ensure the content is practical and project-based.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          { role: 'system', content: 'You are an expert curriculum designer who always responds in English.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
};
