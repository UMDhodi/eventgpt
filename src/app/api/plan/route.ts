import { NextRequest, NextResponse } from 'next/server'
import { generateNvidiaChatCompletion } from '@/lib/nvidiaLlm'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventType = 'wedding',
      city = 'Mumbai',
      guests = 150,
      budget = 1200000,
      vibe = 'Editorial Luxury',
    } = body

    // Dynamically generate personalized AI Producer directive using NVIDIA LLM
    let aiDirective: string | null = null
    try {
      aiDirective = await generateNvidiaChatCompletion({
        messages: [
          {
            role: 'user',
            content: `As an elite executive event producer, write a 2-sentence architectural directive for a ${vibe} ${eventType} in ${city} for ${guests} guests with a total budget of ₹${Number(
              budget
            ).toLocaleString('en-IN')}. Focus on acoustics, spatial layout, and culinary flow.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2048,
      })
    } catch {
      // Non-blocking fallback
    }

    // 3 Curated Plan Options (Handbook Section 7.6 pack-opening reveal M9)
    const plans = [
      {
        id: 'plan-avant-garde',
        title: `${vibe} Executive Edition`,
        tier: 'FEATURED',
        budgetTotal: budget,
        guestComfortScore: 98,
        vibeDescription:
          aiDirective ||
          `A masterclass in contemporary ${eventType} architecture in ${city}. Intimate lighting, Michelin-calibre cuisine, and precise acoustic engineering.`,
        timeline: [
          { time: '04:00 PM', title: 'Arrival & Welcome Elixir', desc: 'Chilled botanical infusions and live harpist' },
          { time: '05:30 PM', title: 'Main Program & Reveal', desc: 'Full stage illumination and keynote/ceremony' },
          { time: '07:30 PM', title: 'Curated Degustation Feast', desc: '5-course paired dinner experience' },
          { time: '09:45 PM', title: 'Midnight Afterglow Lounge', desc: 'Vinyl soul DJ set and artisanal digestifs' },
        ],
        budgetDonut: [
          { category: 'Venue & Staging', percent: 38, amount: Math.round(budget * 0.38) },
          { category: 'Catering & Mixology', percent: 32, amount: Math.round(budget * 0.32) },
          { category: 'Acoustics & Lighting', percent: 18, amount: Math.round(budget * 0.18) },
          { category: 'Permits & Operations', percent: 12, amount: Math.round(budget * 0.12) },
        ],
        vendors: [
          { name: 'Niora Sound Architecture', role: 'Live Concert & Sound Spec', status: 'CONFIRMED' },
          { name: 'Botanical Atelier Delhi/Mumbai', role: 'Florals & Installations', status: 'AVAILABLE' },
          { name: 'Artisan Culinary Collective', role: 'Degustation & Bar', status: 'CONFIRMED' },
        ],
      },
      {
        id: 'plan-heritage',
        title: 'Heritage Sovereign Edition',
        tier: 'HERITAGE GRAND',
        budgetTotal: Math.round(budget * 1.25),
        guestComfortScore: 99,
        vibeDescription: `Majestic palace ambience in ${city} with royal hospitality, authentic cultural performances, and gilded heirloom decor.`,
        timeline: [
          { time: '03:30 PM', title: 'Royal Processional Gates Open', desc: 'Traditional shehnai & floral shower greeting' },
          { time: '05:00 PM', title: 'Grand Courtyard Ceremony', desc: 'Surrounded by historic stone arches and water palace mirrors' },
          { time: '08:00 PM', title: 'Banqueting Under The Stars', desc: 'Heirloom recipes served in brass and silver service' },
        ],
        budgetDonut: [
          { category: 'Heritage Estate', percent: 45, amount: Math.round(budget * 1.25 * 0.45) },
          { category: 'Royal Gastronomy', percent: 30, amount: Math.round(budget * 1.25 * 0.30) },
          { category: 'Art & Decor', percent: 15, amount: Math.round(budget * 1.25 * 0.15) },
          { category: 'Concierge Protocol', percent: 10, amount: Math.round(budget * 1.25 * 0.10) },
        ],
        vendors: [
          { name: 'Royal Heritage Escorts', role: 'VIP Logistics & Protocol', status: 'CONFIRMED' },
          { name: 'Palace Culinary Masters', role: 'Imperial Banquet', status: 'CONFIRMED' },
        ],
      },
      {
        id: 'plan-minimalist',
        title: 'Boutique Studio Minimalist',
        tier: 'ESSENTIAL PRODUCER',
        budgetTotal: Math.round(budget * 0.82),
        guestComfortScore: 94,
        vibeDescription: `Zero-waste, ultra-refined modern celebration in ${city} focusing on unforgettable guest connection, craft cocktails, and high-fidelity sound.`,
        timeline: [
          { time: '06:00 PM', title: 'Sunset Rooftop Gathering', desc: 'Golden hour drinks and panoramic city view' },
          { time: '07:30 PM', title: 'Interactive Chef Table', desc: 'Live culinary stations and natural wines' },
          { time: '09:00 PM', title: 'Electronic Live Set', desc: 'Deep melodic house and dance floor' },
        ],
        budgetDonut: [
          { category: 'Modern Studio Venue', percent: 35, amount: Math.round(budget * 0.82 * 0.35) },
          { category: 'Farm-to-Fork Fare', percent: 35, amount: Math.round(budget * 0.82 * 0.35) },
          { category: 'Hi-Fi Audio Rig', percent: 20, amount: Math.round(budget * 0.82 * 0.20) },
          { category: 'Zero-Waste Team', percent: 10, amount: Math.round(budget * 0.82 * 0.10) },
        ],
        vendors: [
          { name: 'Studio Minimal Sound', role: 'Audiophile Sound Rig', status: 'CONFIRMED' },
          { name: 'Organic Greenery Loft', role: 'Sustainable Flora', status: 'CONFIRMED' },
        ],
      },
    ]

    return NextResponse.json({
      success: true,
      plans,
      query: { eventType, city, guests, budget, vibe },
      model: 'minimaxai/minimax-m3.1-flash via NVIDIA NIM',
    })
  } catch (error) {
    console.error('Plan API Error:', error)
    return NextResponse.json({ error: 'Failed to generate event plan' }, { status: 500 })
  }
}
