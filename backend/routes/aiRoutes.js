const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Activity = require('../models/Activity');

// Helper for OpenRouter API
const callAI = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('your_')) throw new Error("Missing or invalid OpenRouter API Key.");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": messages,
        "max_tokens": 250
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    throw err;
  }
};

// Updated Streaming Endpoint
router.post('/chat/stream', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Prepare Context (Token Optimized)
    const recentHistory = (history || []).slice(-1); // Only keep the last 1 previous message
    const messages = [
      ...recentHistory.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content })),
      { role: "user", content: `[Lvl ${user.level}] ${message}` }
    ];

    // 2. Set Headers for Streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_')) {
      res.write(`data: ${JSON.stringify({ text: "I'm in Demo Mode. Connect an OpenRouter API key to chat!" })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // 3. Call OpenRouter with stream: true
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "openrouter/free",
          "messages": messages,
          "max_tokens": 500,
          "stream": true
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            if (!dataStr) continue;

            try {
              const json = JSON.parse(dataStr);
              if (json.choices?.[0]?.delta?.content) {
                res.write(`data: ${JSON.stringify({ text: json.choices[0].delta.content })}\n\n`);
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (err) {
      console.log("Streaming failed, trying fallback...");
      try {
        const fallback = await callAI(messages);
        res.write(`data: ${JSON.stringify({ text: fallback || "AI returned an empty response" })}\n\n`);
      } catch (fallbackErr) {
        res.write(`data: ${JSON.stringify({ text: `System Error: ${err.message}. Fallback Error: ${fallbackErr.message}` })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Stream Error:', err);
    res.status(500).end();
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const recentActivities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(5);

    const recentHistory = (history || []).slice(-1);
    const messages = [
      ...recentHistory.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content })),
      { role: "user", content: `[Lvl ${user.level}] ${message}` }
    ];

    const aiResponse = await callAI(messages);
    if (!aiResponse) return res.status(500).json({ message: 'AI is temporarily unavailable' });
    res.json({ message: aiResponse });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get response' });
  }
});

router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const today = new Date().toISOString().split('T')[0];
    if (user.insightDate === today && user.dailyInsight) {
      console.log(`[AI Insights] Serving cached insight for user ${user.username}`);
      return res.json({ insight: user.dailyInsight });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        insight: `You're doing great on your ${user.streak}-day streak!`,
        isDemo: true
      });
    }

    const prompt = `Give a 15-word max fitness tip for ${user.username} (Lvl ${user.level}, ${user.streak}-day streak).`;
    console.log('[DEBUG] Calling AI insights for:', user.username);
    const aiResponse = await callAI([{ role: "user", content: prompt }]);
    console.log('[DEBUG] AI Insight Result:', aiResponse ? 'SUCCESS' : 'EMPTY');

    const finalInsight = aiResponse || `Keep up the great work! You're on a ${user.streak}-day streak and doing amazing.`;
    
    // Save to cache
    user.dailyInsight = finalInsight;
    user.insightDate = today;
    await user.save();

    res.json({ insight: finalInsight });
  } catch (err) {
    console.error('[AI Insights Error]:', err);
    res.status(500).json({ message: `AI Connection Error: ${err.message}` });
  }
});

// NEW: AI Recommendations for Explore Tab
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Check if we have valid recommendations for today
    const today = new Date().toISOString().split('T')[0];
    if (user.recommendationsDate === today && user.dailyRecommendations && user.dailyRecommendations.length > 0) {
      console.log(`[AI Recommendations] Serving cached data for user ${user.username}`);
      return res.json(user.dailyRecommendations);
    }

    console.log(`[AI Recommendations] Cache miss. Generating new recommendations for ${user.username}...`);
    const workouts = await Workout.find({}).limit(10); // Reduced from 20 to save tokens
    const recentActivities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(3); // Reduced from 10

    if (!process.env.OPENROUTER_API_KEY) {
      const fallbackWorkouts = await Workout.find({ isRecommended: true }).limit(4);
      const localFallbacks = fallbackWorkouts.map(w => ({
        ...w.toObject(),
        match: '95%',
        aiReason: `This ${w.type} session is recommended based on your recent activity.`
      }));

      // Save fallback to user cache too
      user.dailyRecommendations = localFallbacks;
      user.recommendationsDate = today;
      await user.save();
      return res.json(localFallbacks);
    }

    const context = `Lvl:${user.level}
Acts:${recentActivities.map(a => a.type).join(',')}
Wkouts:${workouts.map((w, i) => `${i}:${w.type}`).join(',')}
Return JSON array of 4 best workouts: [{"id":num,"reason":"short","match":"95%"}]`;

    const aiResponse = await callAI([{ role: "user", content: context }]);

    try {
      // Safely check if aiResponse exists before matching
      const jsonStr = (aiResponse && aiResponse.match(/\[.*\]/s)) ? aiResponse.match(/\[.*\]/s)[0] : "[]";
      const selected = JSON.parse(jsonStr);

      const finalRecommendations = selected.map(sel => {
        const workout = workouts[sel.id];
        if (!workout) return null;
        return {
          ...workout.toObject(),
          match: sel.match || '95%',
          aiReason: sel.reason
        };
      }).filter(Boolean);

      // Save to cache
      user.dailyRecommendations = finalRecommendations;
      user.recommendationsDate = today;
      await user.save();

      res.json(finalRecommendations.length > 0 ? finalRecommendations : await Workout.find({ isRecommended: true }).limit(4));
    } catch (parseErr) {
      console.error('AI Recommendation Parse Error:', parseErr);
      return res.status(500).json({ message: `AI Parse Error: ${parseErr.message}` });
    }
  } catch (err) {
    console.error('[AI Recommendations Error]:', err);
    return res.status(500).json({ message: `AI Connection Error: ${err.message}` });
  }
});

module.exports = router;
