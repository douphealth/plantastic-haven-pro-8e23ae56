export interface EmailTemplate {
  subject: string;
  preheader: string;
  readTime: string;
  content: string; // Plain text or markdown summary
  html: string; // The premium, responsive HTML template
}

export interface EmailCourse {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  category: string;
  icon: string; // Lucide icon identifier
  color: string; // HSL text/bg classes
  emails: EmailTemplate[];
}

export const EMAIL_COURSES: EmailCourse[] = [
  {
    id: "survival-guide",
    title: "7-Day Houseplant Survival Guide",
    description: "Master the fundamental pillars of botany to keep any houseplant alive, thriving, and structurally radiant.",
    difficulty: "Beginner",
    estimatedTime: "7 Days (5-min/day)",
    category: "General Care",
    icon: "Leaf",
    color: "from-primary/10 to-primary/20 text-primary border-primary/20",
    emails: [
      {
        subject: "🌿 Day 1: The Golden Rule of Watering (Avoiding Root Rot)",
        preheader: "90% of houseplants die from this one mistake. Here is how to fix it.",
        readTime: "4 min read",
        content: "Learn how to sense soil moisture, avoid the calendar trap, and water deeply.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🌿</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #e3f2ec; color: #1d5c3f; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 1: WATERING HYGIENE
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        The Golden Rule of Watering: Ditch the Calendar
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Did you know that <strong>over 90% of indoor plant deaths</strong> are caused by overwatering? But overwatering isn't about giving a plant too much water at once. It's about watering <strong>too frequently</strong>, without letting the soil breathe.
      </p>
      
      <p style="margin-bottom: 20px;">
        When plant roots sit in waterlogged soil, they lose access to oxygen. They literally drown, leading to root rot. Once root rot sets in, the roots can no longer absorb moisture, and the plant will wilt—making you think it needs <em>more</em> water. It's a tragic cycle.
      </p>
      
      <!-- Pro Tip Box -->
      <div style="background-color: #f1f8f5; border-left: 4px solid #1d5c3f; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 25px 0; font-size: 14px; color: #1c3629;">
        <strong style="color: #1d5c3f; display: block; margin-bottom: 5px;">💡 PRO TIP: The Chopstick Test</strong>
        Don't trust the dry surface soil. Push a wooden chopstick or skewer 2–3 inches into the pot. Pull it out: if damp soil clings to it, hold off on watering. If it comes out clean and dry, it's time to irrigate!
      </div>

      <h3 style="font-size: 16px; font-weight: 600; color: #111d16; margin-top: 30px; margin-bottom: 12px;">Three Steps to Perfect Watering</h3>
      <ol style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 10px;"><strong>Water Thoroughly:</strong> Pour water until it runs out of the drainage hole at the bottom. This flushes salt build-ups and guarantees all roots get moisture.</li>
        <li style="margin-bottom: 10px;"><strong>Empty the Saucer:</strong> Never let your pot stand in drainage water for more than 15 minutes.</li>
        <li style="margin-bottom: 10px;"><strong>Use Room-Temp Water:</strong> Freezing tap water shocks delicate tropical roots. Let water sit out for a few hours first.</li>
      </ol>

      <a href="https://plantastichaven.com/dashboard" style="display: block; text-align: center; background: linear-gradient(135deg, #1d5c3f, #15452e); color: #ffffff; text-decoration: none; padding: 15px; border-radius: 8px; font-weight: 600; margin-top: 30px; box-shadow: 0 4px 12px rgba(29, 92, 63, 0.2);">
        Track Your Watering Schedule
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
      <p style="margin: 0 0 20px 0;">© 2026 PlantasticHaven. All rights reserved.</p>
      <div style="font-size: 11px;">
        <a href="#" style="color: #ecc94b; text-decoration: underline; margin-right: 15px;">Email Settings</a>
        <a href="#" style="color: #ecc94b; text-decoration: underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "☀️ Day 2: Demystifying Light Levels: Finding Your Window's Secret",
        preheader: "Is your plant starving for light? Here is how to measure it without special gear.",
        readTime: "5 min read",
        content: "Understand north/south exposure, direct vs. indirect light, and signs of light distress.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">☀️</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #b45309; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 2: LIGHT ENGINEERING
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        Demystifying Light Levels: What Does 'Bright Indirect' Mean?
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Light is food for plants. Through photosynthesis, light energy is synthesized into sugars. Water and soil nutrients are secondary. If a plant has inadequate light, it cannot process water, leading to soil sogginess and eventually root rot.
      </p>
      
      <p style="margin-bottom: 20px;">
        But nursery labels are frustratingly vague. Let's translate the three primary light categories:
      </p>
      
      <ul style="padding-left: 20px; margin-bottom: 25px; line-height: 1.8;">
        <li style="margin-bottom: 12px;"><strong>Direct Sun:</strong> Solar rays fall uninterrupted onto the leaves. Usually found in South or West-facing windows. Essential for cacti, succulents, and citrus trees.</li>
        <li style="margin-bottom: 12px;"><strong>Bright Indirect Light:</strong> A room illuminated with ambient sunlight, but rays don't hit the leaves directly (often right next to a North window, or 3-5 feet back from a South/West window). Ideal for Monstera, Ficus, and Philodendrons.</li>
        <li style="margin-bottom: 12px;"><strong>Low Light:</strong> Sufficient light to read a newspaper comfortably without artificial lamps, but far from windows. Only resilient plants like Snake Plants, ZZ Plants, and Cast Iron Plants survive here.</li>
      </ul>
      
      <!-- Pro Tip Box -->
      <div style="background-color: #fffbeb; border-left: 4px solid #ecc94b; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 25px 0; font-size: 14px; color: #78350f;">
        <strong style="color: #b45309; display: block; margin-bottom: 5px;">💡 PRO TIP: The Shadow Test</strong>
        Hold your hand 12 inches above a sheet of paper under your plant's light source. 
        - Sharp, dark shadow = Direct sunlight.
        - Soft, fuzzy shadow = Bright indirect light.
        - Barely visible, indistinct shadow = Low light.
      </div>

      <a href="https://plantastichaven.com/dashboard" style="display: block; text-align: center; background: linear-gradient(135deg, #1d5c3f, #15452e); color: #ffffff; text-decoration: none; padding: 15px; border-radius: 8px; font-weight: 600; margin-top: 30px;">
        Measure Light with AI Scanner
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
      <p style="margin: 0 0 20px 0;">© 2026 PlantasticHaven. All rights reserved.</p>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "🌱 Day 3: Soil Science: How to Create the Ultimate Custom Mix",
        preheader: "Why bag soil is killing your plants, and the simple 3-part recipe to fix it.",
        readTime: "4 min read",
        content: "Learn about aeration, drainage, potting mixes, and custom formulas.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🟫</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #ede9fe; color: #6d28d9; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 3: SOIL ARCHITECTURE
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        Soil Science: Create the Ultimate Houseplant Mix
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Most store-bought potting soils are formulated for retention, not aeration. They consist primarily of dense peat moss, which packs tight around roots and stays wet for weeks.
      </p>
      
      <p style="margin-bottom: 20px;">
        To make roots happy, we need to design a substrate that allows air pockets. Here is our <strong>Ultimate 3-Part Chunky Aroid Mix</strong>, perfect for Monsteras, Pothos, Philodendrons, and Fiddle Leaf Figs:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <thead>
          <tr style="background-color: #f1f8f5; border-bottom: 2px solid #e1e8e3;">
            <th style="padding: 10px; text-align: left;">Ingredient</th>
            <th style="padding: 10px; text-align: left;">Ratio</th>
            <th style="padding: 10px; text-align: left;">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e1e8e3;">
            <td style="padding: 10px; font-weight: 600;">Organic Potting Soil</td>
            <td style="padding: 10px;">50% (2 parts)</td>
            <td style="padding: 10px;">Moisture and base nutrients</td>
          </tr>
          <tr style="border-bottom: 1px solid #e1e8e3;">
            <td style="padding: 10px; font-weight: 600;">Perlite or Pumice</td>
            <td style="padding: 10px;">25% (1 part)</td>
            <td style="padding: 10px;">Provides aeration and quick drainage</td>
          </tr>
          <tr style="border-bottom: 1px solid #e1e8e3;">
            <td style="padding: 10px; font-weight: 600;">Orchid Bark chips</td>
            <td style="padding: 10px;">25% (1 part)</td>
            <td style="padding: 10px;">Mimics forest floors, feeds roots air</td>
          </tr>
        </tbody>
      </table>

      <!-- Pro Tip Box -->
      <div style="background-color: #f5f3ff; border-left: 4px solid #7c3aed; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 25px 0; font-size: 14px; color: #4c1d95;">
        <strong style="color: #6d28d9; display: block; margin-bottom: 5px;">💡 PRO TIP: Charcoal Addition</strong>
        Throw in a handful of activated horticultural charcoal. Charcoal absorbs impurities, controls odors, and acts as a preventative buffer against harmful fungal growth in the soil.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "💨 Day 4: The Art of Humidity: Creating a Tropical Oasis",
        preheader: "Misting is a myth. Here is what actually raises humidity for your leaves.",
        readTime: "3 min read",
        content: "Debunking misting myths, explaining pebble trays, glass display cases, and humidifiers.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">💨</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #e0f2fe; color: #0369a1; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 4: HUMIDITY ENGINEERING
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        The Art of Humidity: Misting is a Myth
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        We love misting our plants. It feels therapeutic. But the truth is: <strong>misting does not raise humidity</strong>. Within 10 minutes, the mist evaporates, and the relative humidity returns to its starting point. Worse, leaving standing water on leaves in stagnant air invites fungal diseases and pests.
      </p>
      
      <p style="margin-bottom: 20px;">
        Tropical plants like Calatheas, Alocasias, and Ferns require relative humidity above 50% to prevent crispy brown edges. Here is how to achieve it effectively:
      </p>
      
      <ol style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 12px;"><strong>Group Your Plants:</strong> Plants transpire water vapor. Grouping them creates a micro-climate where they share humidity.</li>
        <li style="margin-bottom: 12px;"><strong>Use Pebble Trays:</strong> Fill a tray with pebbles, add water until it sits just below the pebble surface, and place your pots on top. As water evaporates, it drafts up around the foliage.</li>
        <li style="margin-bottom: 12px;"><strong>Get a Cool Mist Humidifier:</strong> The only real way to reliably bump room humidity by 20% or more. Keep it clean!</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "🧪 Day 5: Nutrients 101: Fertilizer Science and Cycles",
        preheader: "Understanding N-P-K ratios and how to feed your green jungle without leaf burn.",
        readTime: "4 min read",
        content: "Deconstructing Nitrogen, Phosphorus, Potassium, and synthetic vs. organic fertilizers.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🧪</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #fce7f3; color: #be185d; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 5: BIO-CHEMISTRY
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        Fertilizer Science: How to Feed Without Burning
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Just like humans, plants require a balance of macro and micro nutrients to thrive. In pots, soil nutrients wash out over time. We must replenish them.
      </p>
      
      <p style="margin-bottom: 20px;">
        On any fertilizer box, you will see three numbers (e.g., 9-3-6 or 20-20-20). This is the <strong>N-P-K Ratio</strong>:
      </p>
      
      <ul style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 8px;"><strong>N (Nitrogen):</strong> Drives leaf growth and vibrant green chlorophyll structure.</li>
        <li style="margin-bottom: 8px;"><strong>P (Phosphorus):</strong> Stimulates root system development and flower/fruit production.</li>
        <li style="margin-bottom: 8px;"><strong>K (Potassium):</strong> Fortifies overall cell strength, immune systems, and water movement.</li>
      </ul>

      <!-- Pro Tip Box -->
      <div style="background-color: #fdf2f8; border-left: 4px solid #db2777; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 25px 0; font-size: 14px; color: #831843;">
        <strong style="color: #be185d; display: block; margin-bottom: 5px;">💡 PRO TIP: Weak Weekly Solution</strong>
        Instead of dosing full strength once a month, dilute your liquid fertilizer to 1/4 strength and apply it during every watering throughout spring and summer. This guarantees a steady stream of nutrients without salt burn.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "🐛 Day 6: Common Pests & How to Defeat Them Naturally",
        preheader: "Fungus gnats, spider mites, and mealybugs. Know your enemies and eradicate them.",
        readTime: "5 min read",
        content: "Identification and organic treatment protocols using neem oil, soap, and physical scrubbing.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🐛</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #fef2f2; color: #991b1b; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 6: INTEGRATED PEST MANAGEMENT
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        Know Your Enemies: Eradicating Common Pests
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Pests are an inevitable part of plant ownership. They hitchhike on new purchases, float through open windows, or emerge from bag soil. Don't panic—detecting them early is the key.
      </p>
      
      <h3 style="font-size: 16px; font-weight: 600; color: #111d16; margin-top: 20px; margin-bottom: 10px;">The Big Three Rogues Gallery</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
        <tr style="background-color: #fcf8f8; border-bottom: 1px solid #f3e8e8;">
          <td style="padding: 10px; font-weight: 600; width: 120px;">Spider Mites</td>
          <td style="padding: 10px;">Look like dust motes; leave fine webbing underneath leaves. Wipe with soapy water.</td>
        </tr>
        <tr style="background-color: #ffffff; border-bottom: 1px solid #f3e8e8;">
          <td style="padding: 10px; font-weight: 600;">Mealybugs</td>
          <td style="padding: 10px;">Look like white, fluffy cotton clusters in crevices. Dab with rubbing alcohol.</td>
        </tr>
        <tr style="background-color: #fcf8f8;">
          <td style="padding: 10px; font-weight: 600;">Fungus Gnats</td>
          <td style="padding: 10px;">Tiny black flies buzzing around damp soil. Let soil dry completely and use yellow sticky cards.</td>
        </tr>
      </table>

      <!-- Pro Tip Box -->
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 25px 0; font-size: 14px; color: #7f1d1d;">
        <strong style="color: #991b1b; display: block; margin-bottom: 5px;">💡 PRO TIP: The Quarantine Strategy</strong>
        Whenever you bring a new plant home, isolate it from your other plants for at least 14 days. Inspect it under a magnifying glass. This prevents a single infected purchase from turning into a greenhouse-wide infestation.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
    </div>
  </div>
</div>
        `
      },
      {
        subject: "✂️ Day 7: Pruning, Propagating & Leveling Up",
        preheader: "How to make free new plants from cuttings and style your plants like a pro designer.",
        readTime: "6 min read",
        content: "Making cuttings, water rooting, soil nodes, and shaping rules.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f6f4; padding: 40px 20px; color: #14221a; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(20, 34, 26, 0.05); border: 1px solid #e1e8e3;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d5c3f, #15452e); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">✂️</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #ecc94b;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a3cbb5; margin: 0;">Masterclass Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; color: #047857; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 7: ADVANCED PROPAGATION
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111d16; margin: 0 0 20px 0; line-height: 1.3;">
        Propagation & Design: Make Free New Plants
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Plant Parent,</p>
      
      <p style="margin-bottom: 20px;">
        Congratulations! You've completed the fundamentals course. You now have the knowledge to keep your leafy friends happy. Today, we look at propagation: creating duplicate plants for free.
      </p>
      
      <p style="margin-bottom: 20px;">
        To multiply plants like Monsteras or Pothos, you must locate the <strong>node</strong>—the brown bumped joint on the stem where aerial roots and leaf stems emerge. A stem cut <em>without</em> a node will never root.
      </p>
      
      <ol style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 10px;"><strong>The Cut:</strong> Slice clean 1/2 inch below a node using sterilized shears.</li>
        <li style="margin-bottom: 10px;"><strong>Water Bath:</strong> Put the cutting in a glass jar of room-temp water, keeping leaves dry.</li>
        <li style="margin-bottom: 10px;"><strong>Watch Roots Grow:</strong> Keep in bright indirect light. Change the water weekly. Transfer to soil when roots reach 2 inches.</li>
      </ol>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; text-align: center; margin-top: 30px;">
        <h3 style="margin: 0 0 10px 0; color: #166534; font-family: 'Playfair Display', Georgia, serif;">🏆 You are Certified!</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px;">You have successfully completed the 7-day care program.</p>
        <a href="https://plantastichaven.com/dashboard" style="display: inline-block; background-color: #166534; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">Go Claim Your Badge</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111d16; padding: 30px; text-align: center; color: #a3cbb5; font-size: 12px; border-top: 1px solid #1e3327;">
      <p style="margin: 0 0 10px 0;">You are receiving this as part of your <strong>PlantasticHaven Pro</strong> membership.</p>
    </div>
  </div>
</div>
        `
      }
    ]
  },
  {
    id: "desert-botanist",
    title: "Succulent & Cacti Masterclass",
    description: "Unravel the biological mechanics of desert survival to prevent structural collapse and rotting in dry species.",
    difficulty: "Intermediate",
    estimatedTime: "3 Days (6-min/day)",
    category: "Specialized Care",
    icon: "Flame",
    color: "from-secondary/10 to-secondary/20 text-secondary border-secondary/20",
    emails: [
      {
        subject: "🌵 Day 1: Soil Mixes that Breathe: The 70/30 Grit Rule",
        preheader: "Standard potting mix is a death sentence for desert flora. Let's rebuild it.",
        readTime: "4 min read",
        content: "How succulent root capillaries require oxygen and mineral particles to prevent stagnation.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #fdfbf7; padding: 40px 20px; color: #2d261e; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(45, 38, 30, 0.05); border: 1px solid #f1ece4;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #b45309, #78350f); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🌵</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #fef3c7;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #fbcfe8; margin: 0; color: #fde68a;">Desert Botanist Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #b45309; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 1: SUBSTRATE ENGINEERING
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #451a03; margin: 0 0 20px 0; line-height: 1.3;">
        Grit Science: The 70/30 Mineral Ratio
      </h2>
      
      <p style="margin-bottom: 20px;">Hello Desert Gardener,</p>
      <p style="margin-bottom: 20px;">
        Desert plants have root systems designed to absorb torrential rains instantly and then dry out completely within hours. Potting them in organic peat moss will smother them.
      </p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <strong>The Golden Formula:</strong><br />
        Combine <strong>70% inorganic grit</strong> (pumice, lava rock, coarse river sand, perlite) with only <strong>30% sifted organic soil</strong>. This mimics the arid, gritty slopes of desert landscapes.
      </div>
    </div>
  </div>
</div>
        `
      }
    ]
  },
  {
    id: "orchid-whisperer",
    title: "Orchid Whisperer: Rebloom Guide",
    description: "Unlock the physiological triggers that stimulate tropical epiphytes to drop old stems and generate gorgeous blooms.",
    difficulty: "Advanced",
    estimatedTime: "3 Days (5-min/day)",
    category: "Specialized Care",
    icon: "Flower",
    color: "from-bloom/10 to-bloom/20 text-bloom border-bloom/20",
    emails: [
      {
        subject: "🌸 Day 1: Roots in the Air: Understanding Epiphytic Biology",
        preheader: "Orchids do not grow in soil. Here is why potting them in dirt will drown them.",
        readTime: "5 min read",
        content: "Velamen layers, air exchange, moisture capture, potting medium guidelines.",
        html: `
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #fffafb; padding: 40px 20px; color: #2d1e22; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(45, 30, 34, 0.05); border: 1px solid #fcf0f2;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #db2777, #9d174d); padding: 40px 30px; text-align: center; color: #ffffff;">
      <span style="font-size: 32px;">🌸</span>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; margin: 15px 0 5px 0; letter-spacing: -0.5px;">Plantastic<span style="color: #fce7f3;">Haven</span></h1>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #fbcfe8;">Orchid Whisperer Series</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 35px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: #fce7f3; color: #be185d; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        DAY 1: EPIPHYTIC ROOTS
      </div>
      
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #5c062c; margin: 0 0 20px 0; line-height: 1.3;">
        Velamen Coating: Air is Life
      </h2>
      <p style="margin-bottom: 20px;">Hello Orchid Lover,</p>
      <p style="margin-bottom: 20px;">
        In their native habitats, orchids grow high on tree limbs. Their roots dangle in the open air, absorbing dew and rainfall. They are covered in a silvery sheath called <strong>velamen</strong> which functions like a sponge.
      </p>
      <p style="margin-bottom: 20px;">
        If you bury these roots in standard dirt, they will suffocatingly turn mushy and rot within weeks. That's why we pot orchids in chunky pine bark and sphagnum moss.
      </p>
    </div>
  </div>
</div>
        `
      }
    ]
  }
];
