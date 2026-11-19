const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// Runs a few times a day (not every few minutes) so it can't flood notifications; they also expire after 30 days.
const HEARTBEAT_INTERVAL_MS = 6 * 60 * 60 * 1000;

const sendHeartbeat = async () => {
  try {
    console.log('[Background Task] Running heartbeat task...');
    
    // 1. Fetch all users to send them a heartbeat
    const users = await User.find({}).select('_id username');
    
    // Generate ONE global AI tip via OpenRouter to avoid rate limits
    let globalAITip = "";
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const hasValidKey = openRouterKey && openRouterKey.length > 10;
    
    if (hasValidKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for background task

      try {
        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "openrouter/free",
            "messages": [
              { role: "user", content: "Generate a short, one-sentence, highly motivational fitness tip or fun fact." }
            ],
            "max_tokens": 150
          }),
          signal: controller.signal
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          globalAITip = aiData.choices?.[0]?.message?.content || "";
        } else {
          console.warn(`[Background Task] OpenRouter responded with ${aiRes.status}`);
        }
      } catch (aiErr) {
        console.error('Heartbeat OpenRouter error:', aiErr.name === 'AbortError' ? 'Timed out' : aiErr.message);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    const fitnessTips = [
      "Tip: Drink at least 8 glasses of water today for optimal metabolism.",
      "AI Recommendation: Try adding 10 minutes of HIIT to your routine for better calorie burn.",
      "Diet Tip: High-protein breakfasts can help reduce cravings throughout the day.",
      "Challenge: Can you do 20 pushups right now? Give it a try!",
      "Workout Tip: Remember to stretch for 5 minutes after your session to aid recovery.",
      "Pro Tip: Consistency is better than intensity. Keep showing up!",
      "AI Suggestion: Your sleep affects your gains. Aim for 7-9 hours tonight.",
      "Quick Routine: Take a 5-minute walk every hour to stay active while working."
    ];

    for (const user of users) {
      try {
        // Check for unprocessed activities for this user
        const unprocessed = await Activity.find({ userId: user._id, processed: false });
        
        let message = "";
        let title = 'AI Fitness Tip';
        
        if (unprocessed.length > 0) {
          title = 'FitQuest Update';
          const counts = unprocessed.reduce((acc, it) => {
            acc[it.type] = (acc[it.type] || 0) + 1;
            return acc;
          }, {});
          const parts = Object.entries(counts).map(([t, c]) => `${c} ${t}${c > 1 ? 's' : ''}`);
          message = `Activity Update: ${parts.join(', ')}. Keep moving!`;
          
          // Mark these activities as processed
          await Activity.updateMany({ _id: { $in: unprocessed.map(a => a._id) } }, { processed: true });
        } else {
          // Use the global AI tip if available, else fallback to random static tip
          message = globalAITip || fitnessTips[Math.floor(Math.random() * fitnessTips.length)];
        }

        // Create the notification for this user
        await Notification.create({ 
          userId: user._id, 
          title: title, 
          message,
          read: false
        });
      } catch (userErr) {
        console.error(`[Background Task] Failed for user ${user.username}:`, userErr.message);
      }
    }
    console.log(`[Background Task] Completed heartbeat for ${users.length} users.`);
  } catch (err) {
    console.error('[Background Task] ERROR:', err);
  }
};

// Sends every user an activity digest (or an AI / static fitness tip) as a notification.
const startHeartbeat = () => {
  sendHeartbeat();
  return setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
};

module.exports = { startHeartbeat };
