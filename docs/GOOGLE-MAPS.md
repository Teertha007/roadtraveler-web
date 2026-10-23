# Google Maps (optional)

RoadTraveler’s `/map` page works **without** Google:

- **Default:** Leaflet + CARTO/OpenStreetMap tiles — **free**, no API key
- **Optional:** Google Maps JavaScript API when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set

## Why it asks for an API key

Google’s Maps JavaScript API will not load without a Cloud project API key. Billing must be enabled on the Google Cloud project even to use the free monthly quota.

## Is it free?

**Partly.** Not unlimited free forever.

As of 2025+, Google replaced the old flat **$200/month credit** with **per-SKU free caps**. For interactive maps (**Dynamic Maps** / Maps JavaScript), the Essentials free cap is typically **~10,000 map loads per month**. Past that you pay (order of ~$7 per 1,000 loads in the first paid tier — check [current pricing](https://developers.google.com/maps/billing-and-pricing/pricing)).

You still need a **billing account** on Google Cloud; unused free quota usually costs $0.

## How to integrate

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create/select a project  
2. Enable **Maps JavaScript API** (APIs & Services → Library)  
3. APIs & Services → Credentials → **Create API key**  
4. Restrict the key:  
   - Application restrictions → HTTP referrers (`http://localhost:3000/*`, your Vercel domain)  
   - API restrictions → Maps JavaScript API only  
5. Link a billing account (required)  
6. Add to `.env.local` (and Vercel env):

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

7. Restart `npm run dev` (Next.js only reads `NEXT_PUBLIC_*` at startup)

You should see Google dark / satellite / terrain controls on `/map`. Remove the env var to fall back to free Leaflet.
