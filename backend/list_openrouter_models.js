async function listOpenRouterModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    
    console.log('Available OpenRouter Models (Filtered for Gemini):');
    data.data
      .filter(m => m.id.includes('gemini'))
      .forEach(m => {
        console.log(`- ${m.id} (${m.name})`);
      });
      
    console.log('\nTop Free/Cheap Models:');
    data.data
      .filter(m => m.id.includes('free') || m.id.includes('flash'))
      .slice(0, 10)
      .forEach(m => {
        console.log(`- ${m.id} (${m.name})`);
      });
  } catch (err) {
    console.error('Error fetching models:', err.message);
  }
}

listOpenRouterModels();
