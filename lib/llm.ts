import dotenv from 'dotenv';
dotenv.config();

const LLM_CONFIG = {
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    model: 'gpt-4o-mini'
  },
  claude: {
    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    model: 'claude-3-7-sonnet-20250219'
  }
};

export function callLLM(prompt: string, model: string) {
  if (model === 'openai') {
    const response = callOpenai(prompt)
        try {
          // Parse the text response as JSON
          console.log("Reached callLLM for openai")

          const jsonResponse = JSON.parse(response.text);
          console.log(jsonResponse)
          return jsonResponse;
        } catch (error) {
          console.error("Error parsing response as JSON:", error);
          throw new Error("Response could not be parsed as JSON. Make sure the LLM is returning valid JSON.");
        }
      }else if (model === 'claude') {
        const response = callClaude(prompt);
        try {
          // Parse the text response as JSON
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

  // Prepare the request data
  const requestData = {
    model: model,
    messages: messages,
    response_format: { type: "json_object" }
  };

  // Set up the request options
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestData)
  };

  try {
    // Using XMLHttpRequest for a more synchronous-like approach
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.openai.com/v1/chat/completions', false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.send(JSON.stringify(requestData));

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response.choices[0].message.content);
      return {
        text: response.choices[0].message.content || '',
        raw: response
      };
    } else {
      throw new Error(`HTTP error! Status: ${xhr.status}`);
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

function callClaude(prompt: string) {
  const { apiKey, model } = LLM_CONFIG.claude;
  console.log('Claude API called');
  
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured.");
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

  // Prepare the request data
  const requestData = {
    model: model,
    max_tokens: 1024,
    messages: messages
  };

  // Set up the request options
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestData)
  };

  try {
    // Using XMLHttpRequest for a synchronous-like approach
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.anthropic.com/v1/messages', false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-api-key', apiKey);
    xhr.setRequestHeader('anthropic-version', '2023-06-01');
    xhr.send(JSON.stringify(requestData));

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response.content[0].text);
      return {
        text: response.content[0].text,
        raw: response
      };
    } else {
      throw new Error(`HTTP error! Status: ${xhr.status}`);
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}