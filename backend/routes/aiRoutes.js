const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Activity = require('../models/Activity');

// Helper for OpenRouter API
const callOpenRouter = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    console.log('[OpenRouter] No valid API key found');
    return null;
  }

  try {
    const modelId = "openrouter/free"; // Using auto-free selection as requested
    console.log(`[OpenRouter] Calling API with model: ${modelId}`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelId,
        "messages": messages,
        "max_tokens": 250
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[OpenRouter API Error] Status: ${response.status}, Body: ${errorData}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[OpenRouter Network Error]:', err.message);
    return null;
  }
};

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;
    console.log(`[AI Chat OpenRouter] Request from user ${userId}`);

    const user = await User.findById(userId);
    const recentActivities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    const userContext = `
      User Profile:
      - Username: ${user.username}
      - Level: ${user.level}
      - Streak: ${user.streak}
      - Stats: Burned ${user.stats?.burnedCalories || 0} kcal
      
      Recent Activities:
      ${recentActivities.map(a => `- ${a.type}: ${a.data?.calories || 0} kcal`).join('\n')}
    `;

    const messages = [
      ...(history || []).map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      })),
      { 
        role: "user", 
        content: `INSTRUCTIONS: You are FitQuest AI, a highly motivating and knowledgeable fitness coach. 
        Context: ${userContext}
        
        User Question: ${message}` 
      }
    ];

    if (!process.env.OPENROUTER_API_KEY) {
        return res.json({ 
            message: "I'm in Demo Mode (OpenRouter key missing). Keep up that " + user.streak + " day streak!",
            isDemo: true
        });
    }

    const aiResponse = await callOpenRouter(messages);

    if (!aiResponse) {
      return res.status(500).json({ message: 'AI is temporarily unavailable via OpenRouter' });
    }

    res.json({ message: aiResponse });
  } catch (err) {
    console.error('[AI Chat Error]:', err);
    res.status(500).json({ message: 'Failed to get response from AI coach' });
  }
});

router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({ 
        insight: `You're doing great on your ${user.streak}-day streak!`,
        isDemo: true
      });
    }

    const prompt = `INSTRUCTIONS: You are FitQuest AI. Based on User: ${user.username}, Level: ${user.level}, Streak: ${user.streak}, provide a short encouraging fitness tip (max 15 words).`;
    console.log('[DEBUG] Calling AI insights for:', user.username);
    const aiResponse = await callOpenRouter([{ role: "user", content: prompt }]);
    console.log('[DEBUG] AI Insight Result:', aiResponse ? 'SUCCESS' : 'EMPTY');

    res.json({ insight: aiResponse || `Keep up the great work! You're on a ${user.streak}-day streak and doing amazing.` });
  } catch (err) {
    console.error('[AI Insights Error]:', err);
    res.json({ insight: "Remember: Consistency is the key to progress. Keep showing up every day!" });
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
    const workouts = await Workout.find({}).limit(20); // Get a pool of workouts
    const recentActivities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10);

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

    const context = `
      User: ${user.username}, Level: ${user.level}
      Recent Activities: ${recentActivities.map(a => a.type).join(', ')}
      Available Workouts: ${workouts.map((w, i) => `ID:${i} - ${w.title} (${w.type})`).join('\n')}
      
      Select exactly 4 workout IDs that best suit this user. 
      Return ONLY a JSON array of objects: [{"id": number, "reason": "short string", "match": "90-99%"}]
    `;

    const aiResponse = await callOpenRouter([{ role: "user", content: context }]);
    
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
      const fallbackWorkouts = await Workout.find({ isRecommended: true }).limit(4);
      const localFallbacks = fallbackWorkouts.map(w => ({
        ...w.toObject(),
        match: '92%',
        aiReason: `This ${w.type} session is highly rated by users at your level.`
      }));
      res.json(localFallbacks);
    }
  } catch (err) {
    console.error('[AI Recommendations Error]:', err);
    const fallbackWorkouts = await Workout.find({ isRecommended: true }).limit(4);
    const localFallbacks = fallbackWorkouts.map(w => ({
      ...w.toObject(),
      match: '90%',
      aiReason: `Recommended based on your current level ${user.level} progress.`
    }));
    res.status(200).json(localFallbacks);
  }
});

module.exports = router;
