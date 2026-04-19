const API_KEY = import.meta.env.VITE_CHATANYWHERE_API_KEY
const API_URL = import.meta.env.VITE_CHATANYWHERE_API_URL || 'https://api.chatanywhere.tech/v1/chat/completions'

const MOOD_PROMPTS = {
  'Storm Grey': 'contemplative, mysterious, introspective, philosophical',
  'Sun Yellow': 'joyful, curious, energetic, optimistic',
  'Moss Green': 'grounded, natural, calm, ecological',
  'Burnt Orange': 'warm, adventurous, creative, cultural',
  'Twilight Lavender': 'dreamy, ethereal, imaginative, poetic',
  'Rose Blush': 'tender, human, empathetic, relational',
  'Ink Blue': 'deep, historical, narrative, oceanic'
}

const CATEGORY_CONTEXTS = {
  'Gear': 'science, engineering, how things work, mechanisms, mathematics, technology',
  'Book': 'history, literature, narrative, culture, philosophy, language',
  'Telescope': 'astronomy, wonder, nature, exploration, cosmos, biology',
  'Handshake': 'psychology, sociology, human behavior, relationships, society',
  'Leaf': 'botany, ecology, seasons, slow living, mindfulness, growth'
}

export async function generateCuratedContent(mood, categories = ['Telescope']) {
  const moodContext = MOOD_PROMPTS[mood] || 'curious and open'
  const categoryContext = categories
    .map(c => CATEGORY_CONTEXTS[c])
    .filter(Boolean)
    .join('; ')

  const systemPrompt = `You are One Leaf, a poetic curator of wonder and small daily discoveries. 
Your tone is gentle, literary, and slightly mysterious — like a wise friend who notices things others miss.
You create single, beautiful "gift cards" of knowledge — facts, observations, exercises, or puzzles.
Each card feels like a serendipitous discovery, not a lecture.
Never be preachy or self-helpy. Be curious and specific.
Always respond in valid JSON only.`

  const userPrompt = `Create ONE perfect "gift card" of discovery for someone feeling ${moodContext}.
Their interests lean toward: ${categoryContext}.

The card should have:
- A "fact" or "exercise" or "puzzle" or "observation" (pick the most evocative type)
- A title (3-6 words, poetic)
- Body text (2-4 sentences, specific and surprising, never generic)
- An "icon" emoji that perfectly represents the content
- A "cta" (call to action) — one gentle invitation to engage (optional link text if relevant)
- A "type": one of ["fact", "exercise", "puzzle", "observation"]

Respond ONLY in this JSON format, no markdown:
{
  "title": "...",
  "body": "...",
  "icon": "...",
  "type": "fact|exercise|puzzle|observation",
  "cta": "...",
  "hint": "..." // only if type is puzzle — the answer/hint
}`

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        max_tokens: 400,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (err) {
    console.error('ChatAnywhere error:', err)
    return getFallbackCard(mood)
  }
}

export async function generateWordOfSilence() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        max_tokens: 50,
        temperature: 1.0,
        messages: [
          {
            role: 'user',
            content: 'Give me a single evocative word (not a common word) that teaches something about stillness, patience, or presence. Just the word, nothing else.'
          }
        ]
      })
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || 'Patience'
  } catch {
    const words = ['Patience', 'Stillness', 'Breathe', 'Witness', 'Linger', 'Soften', 'Gather']
    return words[Math.floor(Math.random() * words.length)]
  }
}

export async function reflectOnGathering(text) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        max_tokens: 120,
        temperature: 0.85,
        messages: [
          {
            role: 'system',
            content: 'You are a gentle, poetic companion. When someone shares something they learned today, respond with a single beautiful sentence — a reflection, a related wonder, or a gentle question. Be specific to what they shared. Never generic. No more than 30 words.'
          },
          { role: 'user', content: text }
        ]
      })
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
  } catch {
    return ''
  }
}

function getFallbackCard(mood) {
  const fallbacks = [
    {
      title: "The Weight of Silence",
      body: "In 1951, John Cage entered an anechoic chamber — the quietest room on Earth — and still heard two sounds: his nervous system and his blood circulating. There is no such thing as silence.",
      icon: "🎧",
      type: "fact",
      cta: "Listen to 4′33″ today"
    },
    {
      title: "Greek Statues Were Painted",
      body: "The pristine white marble of ancient Greek sculptures was never meant to be white. They were painted in vivid, startling colors — crimson cloaks, blue eyes, golden hair. The elegant minimalism we admire is just the passage of time.",
      icon: "🏛️",
      type: "observation",
      cta: "Imagine them in color"
    },
    {
      title: "A Clock Puzzle",
      body: "How many times do the hour and minute hands of a clock overlap in a 24-hour period? You might guess 24 — but the answer is more surprising.",
      icon: "🕐",
      type: "puzzle",
      hint: "22 times. Not 24 — because each overlap takes slightly more than an hour."
    }
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}
