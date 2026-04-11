const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = 'llama-3.3-70b-versatile'

const generateCards = async (text, deckTitle, cardCount = 20) => {
  const excerpt = text.slice(0, 8000)

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: 'You are an expert instructional designer. Return only valid JSON arrays. No markdown fences, no commentary, no extra text whatsoever.'
      },
      {
        role: 'user',
        content: `Create exactly ${cardCount} flashcards for a deck titled "${deckTitle}".

RULES:
- Each "front" is a clear specific question or prompt
- Each "back" is a concise complete answer (1-4 sentences)
- Each "hint" is a subtle nudge, NOT the answer
- Each "tags" array has 1-3 topic labels
- Cover definitions, relationships, processes, examples, edge cases
- Vary question types: What is, How does, Why does, Explain, Difference between

SOURCE MATERIAL:
${excerpt}

Return ONLY this JSON array, nothing else:
[{"front":"...","back":"...","hint":"...","tags":["..."]}]`
      }
    ]
  })

  const raw = completion.choices[0].message.content.trim().replace(/```json|```/g, '').trim()

  try {
    const cards = JSON.parse(raw)
    if (!Array.isArray(cards)) throw new Error('Not an array')
    return cards.map(c => ({
      front: String(c.front || '').trim(),
      back:  String(c.back  || '').trim(),
      hint:  String(c.hint  || '').trim(),
      tags:  Array.isArray(c.tags) ? c.tags.map(t => String(t).trim()) : []
    })).filter(c => c.front && c.back)
  } catch {
    throw new Error('Card generation failed — please try again.')
  }
}

const suggestTitle = async (text) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 20,
    messages: [{
      role: 'user',
      content: `Suggest a short 3-6 word deck title for this text. Reply with ONLY the title, nothing else:\n\n${text.slice(0, 400)}`
    }]
  })
  return completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '')
}

module.exports = { generateCards, suggestTitle }