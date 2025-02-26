import OpenAI from 'openai';

import dotenv from 'dotenv';
dotenv.config();

const LLM_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY, 
    model: 'gpt-4o-mini'
  }
};

export function callLLM(prompt: string, model: string) {
  if (model === 'openai') {
    return callOpenai(prompt)
      .then(response => {
        try {
          // Parse the text response as JSON
          const jsonResponse = JSON.parse(response.text);
          return jsonResponse;
        } catch (error) {
          console.error("Error parsing response as JSON:", error);
          throw new Error("Response could not be parsed as JSON. Make sure the LLM is returning valid JSON.");
        }
      });
  }
  
  // For random model or unsupported models, return a default response
  throw new Error(`Model "${model}" is not supported.`);
}

function callOpenai(prompt: string) {
  const { apiKey, model } = LLM_CONFIG.openai;
  console.log('OpenAI API called');
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }
  
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  
  return openai.chat.completions.create({
    model: model,
    messages: messages,
    response_format: { type: "json_object" }
  })
  .then(response => {
    console.log(response.choices[0].message.content);
    return {
      text: response.choices[0].message.content || '',
      raw: response
    };
  })
  .catch(error => {
    console.error("Error calling OpenAI API:", error);
    throw error;
  });
}