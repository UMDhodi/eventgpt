import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamNvidiaChat } from '@/lib/nvidiaLlm'

export const runtime = 'edge'
export const maxDuration = 60

const PRODUCER_SYSTEM_PROMPT = `You are EventGpt, the master AI event architect and executive producer.
When designing an event plan, you MUST strictly adhere to this exact 4-section structure with clean bullet points:

✦ AI-DESIGNED EVENT BLUEPRINT: [EVENT TYPE / TITLE]
**Location**: [City / Destination] · **Capacity**: [Guest count] Guests · **Vibe**: [Aesthetic vibe]

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: [Concise description of venue layout and zoning]
- **Aesthetic**: [Lighting tone, warm 2700K architectural wash, botanical/floral design, textures]

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: [Acoustic equipment, e.g. ultra-compact d&b audiotechnik column speakers or L-Acoustics arrays, sound distribution without visual clutter]
- **Atmosphere**: [Pin-spot dining illumination, organic candle pergolas, and subtle ambient uplighting]

### 3. ⏱️ Run-of-Show Milestones
- **06:30 PM** — Welcome mixology & passed botanical amuse-bouche.
- **08:00 PM** — Keynote reveal / toast with champagne tower.
- **09:00 PM** — 4-course seated chef degustation feast.
- **10:30 PM** — Vinyl DJ lounge set with craft digestifs.

### 4. 💰 Target Budget Allocation
- **Venue & Private Hire (35%)**
- **Gastronomy & Sommelier Service (35%)**
- **Acoustic Sound & Lighting Architecture (18%)**
- **Hospitality Concierge & Logistics (12%)**

✦ **Would you like to print or download your official event blueprint specification?** (Reply "Yes" or use the Download button on your right)

CRITICAL INSTRUCTION: Adhere strictly to this exact 4-section format. Deliver a direct, authoritative event plan without generic filler.
At the very end of your response, ALWAYS append this metadata tag on its own line:
<!--EVENT_META:{"eventType":"...","city":"...","guests":"...","budget":"...","vibe":"..."}-->`

// Circuit breaker state for NVIDIA NIM endpoint
let lastNvidiaFailureTime = 0
const NVIDIA_COOLDOWN_MS = 60_000 // 60s cooldown to prevent repeated hangs

function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  // Match any character including newlines [\s\S] in 16-character chunks
  const chunks = text.match(/[\s\S]{1,16}/g) || [text]
  let index = 0

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]))
        index++
        await new Promise((resolve) => setTimeout(resolve, 10))
      } else {
        controller.close()
      }
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages, eventContext } = await req.json()
    const lastUserMessage = messages?.[messages.length - 1]?.content || ''

    // 1. Primary Engine: NVIDIA NIM LLM (minimaxai/minimax-m3.1-flash)
    const nvidiaKey =
      process.env.NVIDIA_API_KEY ||
      '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'

    const isCooldownActive = Date.now() - lastNvidiaFailureTime < NVIDIA_COOLDOWN_MS

    if (nvidiaKey && !isCooldownActive) {
      try {
        let systemPrompt = PRODUCER_SYSTEM_PROMPT
        if (eventContext) {
          systemPrompt += `\n\nCURRENT EVENT CONTEXT:\n- Event Type: ${
            eventContext.eventType || 'Celebration'
          }\n- City: ${eventContext.city || 'Mumbai'}\n- Guests: ${
            eventContext.guests || '150 Attendees'
          }\n- Budget: ${eventContext.budget || 'Flexible'}\n- Status: ${
            eventContext.status || 'Active Planning'
          }`
        }

        const formatted = (messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content || '',
        }))

        const stream = await streamNvidiaChat({
          messages: formatted,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2048,
        })

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Model-Provider': 'NVIDIA NIM (minimaxai/minimax-m3.1-flash)',
          },
        })
      } catch (nvidiaErr: any) {
        lastNvidiaFailureTime = Date.now()
        const isTimeout =
          nvidiaErr?.name === 'TimeoutError' ||
          nvidiaErr?.message?.includes('aborted') ||
          nvidiaErr?.message?.includes('timeout')
        if (isTimeout) {
          console.log('⚡ NVIDIA NIM standby (>2s), switched to EventGpt Producer Engine (60s cooldown)')
        } else {
          console.log('⚡ NVIDIA NIM unavailable, switched to EventGpt Producer Engine')
        }
      }
    }

    // 2. Secondary Engine: Google Gemini fallback if configured
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (googleApiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey: googleApiKey })
        const result = streamText({
          model: google('gemini-1.5-flash'),
          system: PRODUCER_SYSTEM_PROMPT,
          messages,
          maxTokens: 1024,
          temperature: 0.7,
        })
        return result.toDataStreamResponse()
      } catch (geminiErr) {
        console.warn('Google Gemini fallback error:', geminiErr)
      }
    }

    // 3. Fallback instant producer reply with typewriter streaming
    const mockProducerReply = generateMockProducerResponse(lastUserMessage, eventContext)
    const stream = createTextStream(mockProducerReply)

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Model-Provider': 'EventGpt Producer Engine',
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'EventGpt Producer Engine temporarily unavailable' },
      { status: 500 }
    )
  }
}

function generateMockProducerResponse(query: string, context?: any): string {
  const q = query.toLowerCase()

  // Extract detected destination city dynamically
  let detectedCity = 'New Delhi NCR'
  if (q.includes('mumbai') || q.includes('bombay')) detectedCity = 'Mumbai, Maharashtra'
  else if (q.includes('delhi')) detectedCity = 'New Delhi NCR'
  else if (q.includes('udaipur')) detectedCity = 'Udaipur, Rajasthan'
  else if (q.includes('goa')) detectedCity = 'Goa Coastal'
  else if (q.includes('bangalore') || q.includes('bengaluru')) detectedCity = 'Bengaluru, Karnataka'
  else if (q.includes('jaipur')) detectedCity = 'Jaipur, Rajasthan'
  else if (context?.city && context.city !== 'Flexible' && context.city !== 'Specify in Chat') detectedCity = context.city

  // Extract attendee capacity dynamically
  let guestCount = '100 Guests'
  const guestMatch = query.match(/(\d+)\s*(?:guest|guests|people|pax|attendee|attendees|person|persons)/i)
  if (guestMatch) guestCount = `${guestMatch[1]} Guests`
  else if (context?.guests && context.guests !== 'Custom Attendees') guestCount = context.guests

  // Extract budget dynamically
  let detectedBudget = '₹5 Lakhs'
  const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i)
  const crMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i)
  if (lakhMatch) {
    detectedBudget = `₹${lakhMatch[1]} Lakhs`
  } else if (crMatch) {
    detectedBudget = `₹${crMatch[1]} Crores`
  } else if (context?.budget && context.budget !== 'Flexible' && context.budget !== 'Adaptive Budget') {
    detectedBudget = context.budget
  }

  // 1. Royal Sangeet / Palace Wedding
  if (q.includes('sangeet') || q.includes('wedding') || q.includes('mandap') || q.includes('mehendi') || q.includes('pheras')) {
    const isSangeet = q.includes('sangeet')
    const title = isSangeet ? 'ROYAL SANGEET & CELEBRATION' : 'HERITAGE PALACE WEDDING'
    const eventType = isSangeet ? 'Royal Sangeet Gala' : 'Heritage Palace Wedding'
    return `✦ AI-DESIGNED EVENT BLUEPRINT: ${title}
**Location**: ${detectedCity} · **Capacity**: ${guestCount} · **Vibe**: Royal Heritage & Contemporary Glamour

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: Grand courtyard arrangement featuring an imperial welcome portal, floating candlelit water walkways, and a 28ft x 28ft gloss performance dance floor.
- **Aesthetic**: Cascading fresh white tuberose and jasmine pergolas, 2700K warm architectural wash, and hand-loomed raw silk lounges.

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: Calibrated L-Acoustics K3 line-array sound system tuned for crystal vocal clarity without reverberation off heritage stone facades.
- **Atmosphere**: GrandMA3 synchronized dynamic stage wash, warm halogen pin-spots, and automated 10:00 PM decibel curfew compliance.

### 3. ⏱️ Run-of-Show Milestones
- **07:00 PM** — Imperial welcome infusions & passed artisanal rose-saffron spritzers with live sitar quartet.
- **08:15 PM** — Choreographed family performance showcases with seamless DJ crossfades.
- **09:45 PM** — The Royal Feast: multi-station royal degustation dining.
- **11:00 PM** — Midnight afterglow dance set with live percussionist.

### 4. 💰 Target Budget Allocation
- **Venue & Private Palace Staging (35%)**
- **Gastronomy & Royal Hospitality Service (35%)**
- **Acoustic Sound & Lighting Architecture (18%)**
- **Hospitality Concierge & Logistics (12%)**

✦ **Would you like to print or download your official event blueprint specification?** (Reply "Yes" or use the Download button on your right)

<!--EVENT_META:{"eventType":"${eventType}","city":"${detectedCity}","guests":"${guestCount}","budget":"${detectedBudget}","vibe":"Royal Heritage & Contemporary Glamour"}-->`
  }

  // 2. Stadium Arena Concert Tour Rig
  if (q.includes('concert') || q.includes('tour') || q.includes('stadium') || q.includes('arena') || q.includes('sound rig')) {
    return `✦ AI-DESIGNED EVENT BLUEPRINT: STADIUM ARENA TOUR RIG
**Location**: ${detectedCity} · **Capacity**: ${guestCount} · **Vibe**: High-Energy Arena Production

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: 60ft x 40ft heavy-duty aluminum ground-support stage with 24ft clearance, dual 4K IMAG side LED walls, and zoned security barriers.
- **Aesthetic**: Matte-black industrial staging, aerial laser projection fans, and cold-spark pyrotechnic fountains.

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: 24-box L-Acoustics K2 line arrays + 16 KS28 subwoofers in cardioid sub-arc configuration delivering 104dB SPL phase-aligned dispersion.
- **Atmosphere**: 48 high-output beam fixtures, 32 strobes, and full timecoded GrandMA3 control networked over sACN.

### 3. ⏱️ Run-of-Show Milestones
- **05:00 PM** — Turnstile ingress gates open with RFID fast-lane throughput.
- **07:00 PM** — Direct support act (45 min high-tempo warm-up).
- **08:30 PM** — Headliner arena performance with synchronized lighting cues & pyro finale.
- **10:30 PM** — Controlled egress with dedicated safety marshals and transit shuttles.

### 4. 💰 Target Budget Allocation
- **Stage Rigging & Structural Engineering (35%)**
- **Acoustic Sound & Line-Array System (35%)**
- **Lighting Production & Visual SFX (18%)**
- **Security, Medical & Municipal Clearances (12%)**

✦ **Would you like to print or download your official event blueprint specification?** (Reply "Yes" or use the Download button on your right)

<!--EVENT_META:{"eventType":"Stadium Concert Tour","city":"${detectedCity}","guests":"${guestCount}","budget":"${detectedBudget}","vibe":"High-Energy Arena Production"}-->`
  }

  // 3. Milestone Birthday Celebration
  if (q.includes('birthday') || q.includes('milestone')) {
    return `✦ AI-DESIGNED EVENT BLUEPRINT: MILESTONE BIRTHDAY CELEBRATION
**Location**: ${detectedCity} · **Capacity**: ${guestCount} · **Vibe**: Vibrant Luxe & Retro Disco

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: Panoramic rooftop layout featuring a central circular mixology island, custom neon photo installations, and sunken plush lounge booths.
- **Aesthetic**: Emerald velvet banquettes, retro incandescent filament bulbs, and mirror-ball ceiling installations.

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: High-fidelity Void Acoustics column sound distribution providing warm, punchy bass across indoor and terrace zones.
- **Atmosphere**: Dimmable neon accent illumination, atmospheric fine haze, and rhythmic dance floor wash.

### 3. ⏱️ Run-of-Show Milestones
- **07:30 PM** — Sunset welcome spritzers & acoustic chillout set.
- **09:00 PM** — Signature cake reveal & vintage champagne tower toast.
- **09:45 PM** — Chef-curated small-plates degustation & craft cocktail pairings.
- **11:00 PM** — Open DJ dance party with live saxophonist.

### 4. 💰 Target Budget Allocation
- **Venue & Rooftop Private Hire (35%)**
- **Signature Mixology & Gourmet Catering (35%)**
- **Acoustic Audio & Lighting Production (18%)**
- **Hospitality Concierge & Logistics (12%)**

✦ **Would you like to print or download your official event blueprint specification?** (Reply "Yes" or use the Download button on your right)

<!--EVENT_META:{"eventType":"Milestone Birthday Celebration","city":"${detectedCity}","guests":"${guestCount}","budget":"${detectedBudget}","vibe":"Vibrant Luxe & Retro Disco"}-->`
  }

  // 4. Bespoke Celebration / Intimate Gathering (Default style specifically matching requested output)
  return `✦ AI-DESIGNED EVENT BLUEPRINT: BESPOKE CELEBRATION
**Location**: ${detectedCity} · **Capacity**: ${guestCount} · **Vibe**: Curated Editorial Luxury

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: Intimate multi-zone venue arrangement uniting a cocktail welcome lounge, acoustic showcase stage, and banquet dining rotunda.
- **Aesthetic**: Low-profile warm architectural lighting (2700K), bespoke linens, and minimalist botanical arches.

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: Ultra-compact d&b audiotechnik column speakers providing crisp conversational sound distribution without visual clutter.
- **Atmosphere**: Pin-spot dining illumination, organic candle pergolas, and subtle ambient uplighting.

### 3. ⏱️ Run-of-Show Milestones
- **06:30 PM** — Welcome mixology & passed botanical amuse-bouche.
- **08:00 PM** — Keynote reveal / toast with champagne tower.
- **09:00 PM** — 4-course seated chef degustation feast.
- **10:30 PM** — Vinyl DJ lounge set with craft digestifs.

### 4. 💰 Target Budget Allocation
- **Venue & Private Hire (35%)**
- **Gastronomy & Sommelier Service (35%)**
- **Acoustic Sound & Lighting Architecture (18%)**
- **Hospitality Concierge & Logistics (12%)**

✦ **Would you like to print or download your official event blueprint specification?** (Reply "Yes" or use the Download button on your right)

<!--EVENT_META:{"eventType":"Bespoke Celebration","city":"${detectedCity}","guests":"${guestCount}","budget":"${detectedBudget}","vibe":"Curated Editorial Luxury"}-->`
}
