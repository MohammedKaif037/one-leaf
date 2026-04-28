const API_KEY = import.meta.env.VITE_CHATANYWHERE_API_KEY
const API_URL = import.meta.env.VITE_CHATANYWHERE_API_URL || 'https://api.chatanywhere.tech/v1/chat/completions'

const MOOD_PROMPTS = {
  'Storm Grey': 'contemplative, mysterious, introspective, philosophical',
  'Sun Yellow': 'joyful, curious, energetic, optimistic',
  'Moss Green': 'grounded, natural, calm, ecological',
  'Burnt Orange': 'warm, adventurous, creative, cultural',
  'Twilight Lavender': 'dreamy, ethereal, imaginative, poetic',
  'Rose Blush': 'tender, human, empathetic, relational',
  'Ink Blue': 'deep, historical, narrative, oceanic',
}

const STYLE_PROMPTS = {
  'Poetic': 'lyrical, metaphorical, evocative, uses imagery and rhythm, feels like a gentle meditation, language that lingers',
  'Practical': 'direct, useful, actionable, clear, focused on real-world application, no fluff, straightforward wisdom',
  'Whimsical': 'playful, surprising, magical, childlike wonder, unexpected connections, delightfully odd, gently absurd',
  'Wise': 'profound, timeless, like a quiet elder sharing hard-won insight, minimal but deep, every word carries weight',
  'Curious': 'questioning, exploratory, invites wonder, ends with more questions than answers, speculative, open-ended',
  'Grounded': 'earthy, somatic, embodied, connected to physical sensation and presence, rooted in the body and nature',
}

// All 9 onboarding categories mapped to context strings
const CATEGORY_CONTEXTS = {
  Gear: 'science, engineering, how things work, mechanisms, mathematics, technology',
  Book: 'history, literature, narrative, culture, philosophy, language',
  Telescope: 'astronomy, wonder, nature, exploration, cosmos, biology',
  Handshake: 'psychology, sociology, human behavior, relationships, society',
  Leaf: 'botany, ecology, seasons, slow living, mindfulness, growth',
  Brush: 'art, craft, creativity, design, aesthetics, making',
  Globe: 'other cultures, music, food, traditions, travel, languages',
  Flask: 'strange biology, chemistry, weird science, peculiar phenomena',
  Quill: 'philosophy, ethics, meaning, logic, ideas, thought experiments',
}

async function chatComplete(messages, maxTokens = 400, temperature = 0.9) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function generateCuratedContent(mood, categories = ['Telescope'], style = 'Poetic') {
  const moodContext = MOOD_PROMPTS[mood] || 'curious and open'
  const styleContext = STYLE_PROMPTS[style] || STYLE_PROMPTS['Poetic']
  const categoryContext = categories
    .map(c => CATEGORY_CONTEXTS[c])
    .filter(Boolean)
    .join('; ')

  const systemPrompt = `You are One Leaf, a curator of wonder and small daily discoveries.
Your tone: ${styleContext}

You create single, beautiful "gift cards" of knowledge — facts, observations, exercises, or puzzles.
Each card feels like a serendipitous discovery, not a lecture.
Never be preachy or self-helpy. Be curious and specific.
Always respond in valid JSON only.`

  const userPrompt = `Create ONE perfect "gift card" of discovery for someone feeling ${moodContext}.
Their interests lean toward: ${categoryContext}.

Respond ONLY in this JSON format, no markdown backticks:
{
  "title": "3-6 poetic words",
  "body": "2-4 sentences, specific and surprising, never generic",
  "icon": "single emoji",
  "type": "fact|exercise|puzzle|observation",
  "cta": "one gentle invitation to engage",
  "hint": "answer if puzzle, otherwise null"
}`

  try {
    const text = await chatComplete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      400,
      0.9
    )
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (err) {
    console.error('ChatAnywhere error:', err)
    return getFallbackCard()
  }
}

export async function generateWordOfSilence() {
  try {
    const text = await chatComplete(
      [
        {
          role: 'user',
          content:
            'Give me a single evocative word (not a common word) that teaches something about stillness, patience, or presence. Just the word, nothing else.',
        },
      ],
      20,
      1.0
    )
    return text.trim().replace(/[".]/g, '') || 'Patience'
  } catch {
    const words = ['Patience', 'Stillness', 'Breathe', 'Witness', 'Linger', 'Soften', 'Gather']
    return words[Math.floor(Math.random() * words.length)]
  }
}

export async function reflectOnGathering(text, style = 'Poetic') {
  const styleContext = STYLE_PROMPTS[style] || STYLE_PROMPTS['Poetic']
  
  try {
    const reflection = await chatComplete(
      [
        {
          role: 'system',
          content: `You are a gentle companion. Respond to what someone learned today with ONE beautiful sentence.
          
Style requirement: ${styleContext}

Rules:
- Be specific to what they shared (never generic)
- Max 30 words
- Match the requested style
- No quotes, no explanations, just the sentence
- Feel like a quiet friend reflecting back something true`,
        },
        { role: 'user', content: text },
      ],
      120,
      0.85
    )
    return reflection.trim()
  } catch {
    return getFallbackReflection(style)
  }
}

function getFallbackCard() {
  const fallbacks = [
    {
      title: 'The Weight of Silence',
      body: 'In 1951, John Cage entered an anechoic chamber — the quietest room on Earth — and still heard two sounds: his nervous system and his blood circulating. There is no such thing as silence.',
      icon: '🎧',
      type: 'fact',
      cta: 'Listen to 4′33″ today',
      hint: null,
    },
    {
      title: 'Greek Statues Were Painted',
      body: 'The pristine white marble of ancient Greek sculptures was never meant to be white. They were painted in vivid, startling colors — crimson cloaks, blue eyes, golden hair. The elegant minimalism we admire is just the passage of time.',
      icon: '🏛️',
      type: 'observation',
      cta: 'Imagine them in color',
      hint: null,
    },
    {
      title: 'A Clock Puzzle',
      body: 'How many times do the hour and minute hands of a clock overlap in a 24-hour period? You might guess 24 — but the answer is more surprising.',
      icon: '🕐',
      type: 'puzzle',
      cta: 'Think carefully',
      hint: '22 times. Not 24 — because each overlap takes slightly more than an hour.',
    },
    {
      title: 'Trees Remember Drought',
      body: 'When a tree survives a drought, it records the stress in its rings — a compressed, denser band of wood that scientists can read centuries later. Every tree is a diary written in wood.',
      icon: '🌳',
      type: 'observation',
      cta: 'Find a tree ring today',
      hint: null,
    },
    {
      title: 'Count Your Heartbeats',
      body: 'Sit still for one minute and count your pulse. Most mammals have roughly the same number of heartbeats in a lifetime — about 1.5 billion. Elephants spend each one slowly. Mice spend them in a blur.',
      icon: '💗',
      type: 'exercise',
      cta: 'Try it right now',
      hint: null,
    },
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

function getFallbackReflection(style) {
  const fallbacks = {
    'Poetic': 'The smallest lessons often arrive like morning light—soft, then suddenly everywhere.',
    'Practical': 'That is worth holding onto. You will need it again sooner than you think.',
    'Whimsical': 'And somewhere, a small bell rang because you learned something new today.',
    'Wise': 'Knowing is a doorway. Walking through it is the real work.',
    'Curious': 'What else shifts when you look at it that way?',
    'Grounded': 'You can feel that settling into your bones now. That is real learning.',
  }
  return fallbacks[style] || fallbacks['Poetic']
}
