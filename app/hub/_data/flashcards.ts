export type QACategory = "discovery" | "objection" | "pricing" | "results" | "technical";

export type QACard = {
  cat: QACategory;
  q: string;
  a: string;
};

export const QA_DATA: QACard[] = [
  { cat: "discovery", q: "What exactly does QuadGrowth do?", a: "We help dental clinics in Victoria attract more patients and fill their appointment books using AI-powered marketing. We combine local search optimisation, targeted digital advertising, and smart automation so your clinic shows up when patients in your area are searching for a dentist — and we make sure those patients actually book." },
  { cat: "discovery", q: "How is this different from what we're already doing?", a: "Most dental marketing is generic — basic Facebook ads or a set-and-forget Google campaign. We're different in three ways: we use AI to identify exactly which patients in your suburb are looking for a dentist right now, we personalise every touchpoint to your specific clinic, and we track every dollar back to actual bookings — not just clicks or impressions." },
  { cat: "discovery", q: "Why should we trust a new agency we've never heard of?", a: "That's a fair question. We're newer, which means you get more attention than you would from a large agency where you're just another account. What I can show you is exactly what we've built — our lead gen system, our process, and case studies from similar clinics. I'd rather prove it to you in the first 30 days than ask you to take it on faith." },
  { cat: "discovery", q: "Who is your typical client?", a: "Dental clinics across Victoria — from Melbourne CBD and inner suburbs like Fitzroy and Richmond, out to regional centres like Geelong, Ballarat, and Bendigo. We specifically work with clinic owners who have capacity to take on new patients but aren't yet consistently full. Sound like you?" },
  { cat: "discovery", q: "Do you work with other types of healthcare providers?", a: "Dental is our core focus to start, but QuadGrowth is built to serve all healthcare specialists — GPs, physios, chiropractors, cosmetic clinics. We're expanding as we grow. For now, dental clinics get our complete focus and the best results." },

  { cat: "objection", q: "We've tried digital marketing before and it didn't work.", a: "I hear that a lot — and usually it comes down to one of three things: the targeting was too broad, the ads sent people to a generic website instead of a specific booking page, or there was no follow-up system. Can you tell me what you tried before? I'll be honest if I think the same thing will happen again, or I'll show you specifically what we'd do differently." },
  { cat: "objection", q: "We get most of our patients through word of mouth — we don't need marketing.", a: "Word of mouth is fantastic — it means your existing patients love you. But it's unpredictable. You can't turn it up when you have empty slots in three weeks. What we do is essentially build a reliable second channel that runs in the background, so you're never waiting on referrals to fill your schedule." },
  { cat: "objection", q: "We don't have time to deal with marketing on top of running the clinic.", a: "That's exactly why we handle everything. You get a monthly report and a brief catch-up call — that's all we ask of your time. The campaigns, the leads, the follow-ups — all managed by us. You just confirm the bookings when they come in." },
  { cat: "objection", q: "We already have someone doing our social media.", a: "Social media and patient acquisition are actually quite different. Social keeps your existing patients engaged, which is great. We focus on new patient acquisition — finding people who don't know you yet but are actively searching for a dentist in your area. The two work well together." },
  { cat: "objection", q: "Can you guarantee results?", a: "I won't make guarantees I can't keep — and any agency that promises you a specific number of patients before seeing your data is telling you what you want to hear. What I can commit to is full transparency — you'll see every campaign, every lead, every booking. And we have a 30-day out in our contract if you're not happy with the direction." },
  { cat: "objection", q: "We're not sure this is the right time.", a: "The best time to build a patient pipeline is before you need it. Empty slots three months from now are hard to fill in three months' time — it takes time to build momentum. That said, I'd rather understand what's holding you back. Is it budget, bandwidth, or something else?" },

  { cat: "pricing", q: "How much does this cost?", a: "Our packages start from AUD 1,500 per month for a core local search and lead gen setup. Most clinics we work with are on AUD 2,500–4,000/month once we add paid advertising. To put it in perspective — if we bring you just 3–4 new patients a month, and the average dental patient is worth AUD 800–1,200 per year, the service more than pays for itself." },
  { cat: "pricing", q: "That's more than we expected. Can you do it cheaper?", a: "I understand. Let me ask — what's an empty appointment slot worth to your clinic? If it's AUD 300–500 per slot, and you have even 5–10 empty slots a week, that's real money leaving the building. Our pricing is set to be a fraction of that. But if budget is a genuine constraint, let's talk about what a smaller starting package looks like." },
  { cat: "pricing", q: "Do you charge setup fees?", a: "We have a one-time onboarding and setup fee which covers building your campaign structure, your local search profile, and your lead tracking. I'll send you a full breakdown — no surprises." },
  { cat: "pricing", q: "What's your contract length?", a: "We start with a 3-month minimum — that's the time it takes to build momentum, gather data, and start seeing consistent results. After that it's monthly rolling. We don't lock you into long contracts because we'd rather earn your renewal every month." },
  { cat: "pricing", q: "What do we actually get for that monthly fee?", a: "Every month you get: new patient campaigns running across Google and social, local search optimisation, AI-powered lead targeting, a full performance dashboard, and a monthly strategy call with me. You'll know exactly where every dollar went and what it returned." },

  { cat: "results", q: "How long does it take to see results?", a: "Honest answer — you'll start seeing lead activity within the first 2 weeks. Actual new patients in the chair usually starts weeks 3–6, as people book ahead. Consistent, predictable flow typically comes at the 60–90 day mark. We'll show you the data the whole way." },
  { cat: "results", q: "What kind of results have other clinics seen?", a: "Early clients have gone from around 60% appointment capacity to 90–95% within 6 weeks. Revenue increases of 30–40% in the first quarter are realistic for a clinic that has genuine capacity and a solid team. I'll share specific examples on our call." },
  { cat: "results", q: "How do you measure success?", a: "We track three things that actually matter to you: number of new patient enquiries, number of bookings confirmed, and estimated revenue generated. Not impressions, not clicks — actual patients. Everything is in a live dashboard you can check anytime." },
  { cat: "results", q: "What if we don't see results after the first month?", a: "One month isn't enough to judge — campaigns need data to optimise. But if by the end of month two you're seeing zero lead activity, we'll review everything together and if needed, restructure the approach at no extra charge. We stand behind our work." },

  { cat: "technical", q: "How does the AI part actually work?", a: "Our AI analyses search patterns in your suburb to identify people actively looking for a dentist — not just anyone online. It then serves them specific ads based on their intent, and personalises the message based on what we know about your clinic's strengths. It also automates follow-ups so leads don't fall through the cracks." },
  { cat: "technical", q: "Do we need to do anything technical on our end?", a: "Very little. We'll need access to your Google Business Profile, and if you're running a practice management system like Dental4Windows or Exact, we can discuss integration. Otherwise, we handle everything technical — you just receive a login to the dashboard." },
  { cat: "technical", q: "Is our patient data safe?", a: "Yes — we don't touch patient records at all. Our system works with anonymous intent data and public information. We're fully compliant with Australian Privacy Principles and the Spam Act 2003. We can provide our data handling policy in writing." },
  { cat: "technical", q: "What platforms do you advertise on?", a: "Primarily Google Search and Google Maps — that's where patients actively searching for a dentist in your area are. We supplement with Meta (Facebook/Instagram) for awareness campaigns. The mix depends on your goals and suburb demographics." },
];

export const CATEGORIES: { key: QACategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "discovery", label: "Discovery Call" },
  { key: "objection", label: "Objections" },
  { key: "pricing", label: "Pricing" },
  { key: "results", label: "Results & ROI" },
  { key: "technical", label: "Technical" },
];
