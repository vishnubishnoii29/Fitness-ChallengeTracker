require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the genAI instance in some versions
    // but we can try to fetch the models via a simple request or use the internal client
    console.log('Fetching available models for your API key...');
    
    // Using the REST API via fetch since SDK doesn't expose listModels easily in all versions
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('\nAvailable Models:');
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
        console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      });
    } else {
      console.log('No models found or error in response:', data);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
