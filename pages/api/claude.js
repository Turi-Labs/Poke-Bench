export default async function handler(req, res) {
    try {
      const { prompt } = req.body;
      
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ];
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1024,
          messages: messages
        })
      });
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error calling Claude API:", error);
      return res.status(500).json({ error: error.message });
    }
  }