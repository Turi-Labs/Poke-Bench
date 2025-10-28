// utils/llm.js
import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const LLM_CONFIG = {
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    model: 'gpt-4.5-preview'
  },
  claude: {
    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    model: 'claude-3-7-sonnet-20250219'
  }
};

export function callLLM(prompt, model) {
  if (model === 'openai') {
    const response = callOpenai(prompt);
    try {
      console.log("Reached callLLM for openai");
      const jsonResponse = JSON.parse(response.text);
      console.log(jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing response as JSON:", error);
      throw new Error("Response could not be parsed as JSON. Make sure the LLM is returning valid JSON.");
    }
  } else if (model === 'claude') {
    const response = callClaude(prompt);
    try {
      console.log("Reached callLLM for Claude");
      const jsonResponse = JSON.parse(response.text);
      console.log(jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing response as JSON:", error);
      throw new Error("Response could not be parsed as JSON. Make sure the LLM is returning valid JSON.");
    }
  }
}

function callOpenai(prompt) {
  const { apiKey, model } = LLM_CONFIG.openai;
  console.log('OpenAI API called');
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }
  
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant. Always respond with valid JSON."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  // Prepare the request data
  const requestData = {
    model: model,
    messages: messages,
    response_format: { type: "json_object" }
  };

  try {
    // Using a CORS proxy to avoid CORS issues
    const proxyUrl = '';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Using XMLHttpRequest for a synchronous call
    const xhr = new XMLHttpRequest();
    xhr.open('POST', proxyUrl + apiUrl, false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Required by some CORS proxies
    xhr.send(JSON.stringify(requestData));

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response.choices[0].message.content);
      return {
        text: response.choices[0].message.content || '',
        raw: response
      };
    } else {
      throw new Error(`HTTP error! Status: ${xhr.status}, Response: ${xhr.responseText}`);
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

function callClaude(prompt) {
  console.log('Claude API called via backend');
  
  try {
    // Using XMLHttpRequest for a synchronous call to your backend
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BACKEND_URL}/api/claude`, false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ prompt }));

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response.text);
      return {
        text: response.text,
        raw: response.raw
      };
    } else {
      throw new Error(`HTTP error! Status: ${xhr.status}, Response: ${xhr.responseText}`);
    }
  } catch (error) {
    console.error("Error calling Claude API via backend:", error);
    throw error;
  }
}