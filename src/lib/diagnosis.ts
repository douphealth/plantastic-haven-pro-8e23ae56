export interface DiagnosisAnswers {
  plantName: string;
  mainProblem: string;
  lightLevel: string;
  wateringFrequency: string;
  potDrainage: string;
  soilMoisture: string;
  experienceLevel: string;
}

export interface CarePlan {
  reportId: string;
  date: string;
  plantName: string;
  answers: DiagnosisAnswers;
  title: string;
  description: string;
  whatToDoToday: string;
  rescueDays: string[];
  wateringAdvice: string;
  lightAdvice: string;
  soilPotAdvice: string;
  mistakes: string[];
  relatedGuides: Array<{ title: string; link: string }>;
  checklistState: boolean[];
  suggestedWaterIntervalDays: number;
}

export const CARE_PLAN_STORAGE_KEY = "plantastichaven_care_plan";

export function normalizeCarePlan(value: unknown): CarePlan | null {
  if (!value || typeof value !== "object") return null;
  const plan = value as Partial<CarePlan> & { whatToday?: string };
  if (typeof plan.plantName !== "string" || !Array.isArray(plan.rescueDays)) {
    return null;
  }

  const legacy = plan as { whatToday?: string };
  return {
    reportId: plan.reportId || "PH-LOCAL",
    date: plan.date || "",
    plantName: plan.plantName,
    answers: plan.answers || {
      plantName: plan.plantName,
      mainProblem: "",
      lightLevel: "",
      wateringFrequency: "",
      potDrainage: "",
      soilMoisture: "",
      experienceLevel: "",
    },
    title: plan.title || "Care plan",
    description: plan.description || "",
    whatToDoToday: plan.whatToDoToday || legacy.whatToday || "",
    rescueDays: plan.rescueDays,
    wateringAdvice: plan.wateringAdvice || "",
    lightAdvice: plan.lightAdvice || "",
    soilPotAdvice: plan.soilPotAdvice || "",
    mistakes: Array.isArray(plan.mistakes) ? plan.mistakes : [],
    relatedGuides: Array.isArray(plan.relatedGuides) ? plan.relatedGuides : [],
    checklistState: Array.isArray(plan.checklistState)
      ? plan.checklistState
      : plan.rescueDays.map(() => false),
    suggestedWaterIntervalDays:
      typeof plan.suggestedWaterIntervalDays === "number"
        ? plan.suggestedWaterIntervalDays
        : 7,
  };
}

export function readStoredCarePlan(): CarePlan | null {
  try {
    const saved = localStorage.getItem(CARE_PLAN_STORAGE_KEY);
    if (!saved) return null;
    return normalizeCarePlan(JSON.parse(saved));
  } catch {
    return null;
  }
}

const finish = (
  answers: DiagnosisAnswers,
  plan: Omit<
    CarePlan,
    "reportId" | "date" | "plantName" | "answers" | "checklistState"
  >
): CarePlan => ({
  reportId: `PH-${Math.floor(100000 + Math.random() * 900000)}`,
  date: new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  plantName: answers.plantName,
  answers,
  checklistState: Array(plan.rescueDays.length).fill(false),
  ...plan,
});

export function buildCarePlan(answers: DiagnosisAnswers): CarePlan {
  const {
    plantName,
    mainProblem,
    lightLevel,
    wateringFrequency,
    potDrainage,
    soilMoisture,
  } = answers;

  const isOverwatered =
    mainProblem.includes("mushy") ||
    mainProblem.includes("root rot") ||
    soilMoisture === "Always soggy, wet, or muddy" ||
    soilMoisture.includes("wet/damp deep below") ||
    (potDrainage === "No drainage holes" && soilMoisture.includes("soggy")) ||
    (wateringFrequency === "Every single day" && !lightLevel.includes("Direct"));

  const isUnderwatered =
    mainProblem.includes("wilting") ||
    soilMoisture === "Bone dry all the way down" ||
    (wateringFrequency.includes("monthly") && !mainProblem.includes("insects"));

  const isLowHumidity =
    mainProblem.includes("tips") ||
    (plantName.toLowerCase().includes("calathea") &&
      mainProblem.includes("brown")) ||
    (plantName.toLowerCase().includes("fern") && mainProblem.includes("brown"));

  const isLowLight =
    lightLevel === "Low light / dark corner" &&
    (mainProblem.includes("slow") || mainProblem.includes("yellow"));

  const isPests =
    mainProblem.includes("insects") || mainProblem.includes("spots");

  if (isOverwatered) {
    return finish(answers, {
      title: "Overwatering & Root Rot Development",
      description:
        "Your plant's roots are suffocating due to prolonged saturation in waterlogged soil. Houseplant roots require oxygen pockets to breathe and absorb nutrients. When water fills these spaces permanently, anaerobic rot fungi thrive, turning healthy roots mushy and preventing water transport, which ironically makes the plant wilt as if it were dry.",
      whatToDoToday:
        "Stop watering immediately. Slide the plant out of its pot. Inspect the roots: if they are dark brown, black, or slimy, trim them back to healthy cream-colored tissue with sterilized scissors. Leave the root ball on newspaper or towels for 24 hours to dry.",
      rescueDays: [
        "Inspect root system for mushy rot; trim affected roots and wash the pot with soapy water.",
        "Allow root ball to air dry on newspaper. Prepare clean soil mixed with 30% perlite.",
        "Repot the plant in a clean pot WITH drainage holes. Use dry, highly aerated soil mix.",
        "Place the plant in warm, bright indirect light. Do not water it yet.",
        "Monitor soil moisture. Use a wooden stick to test that the soil remains completely dry.",
        "If soil is bone dry all the way down, give a tiny sip (1/4 cup) of room-temperature water.",
        "Set up a strict rule: only water when the top 3 inches of soil feel completely dry.",
      ],
      wateringAdvice:
        "Ditch the calendar. Always test the soil: stick a finger or wooden chopstick 2-3 inches deep. If it comes out with damp soil, do not water. Always empty the bottom drainage saucer after watering.",
      lightAdvice:
        "Move to bright, indirect light. Higher light levels increase the rate of photosynthesis, helping the plant process soil moisture much faster.",
      soilPotAdvice:
        "Ensure your pot has drainage holes. Add perlite, pumice, or orchid bark (25-30%) to standard potting soil to increase drainage and aeration.",
      mistakes: [
        "Watering on a set calendar schedule.",
        "Letting the pot sit in standing water in the saucer.",
        "Using heavy garden soil or dense potting mix without aeration.",
      ],
      relatedGuides: [
        {
          title: "Avoiding Root Rot: The Golden Rule of Watering",
          link: "/guides?article=survival-guide&day=0",
        },
        {
          title: "Soil Architecture: Creating the Ultimate Mix",
          link: "/guides?article=survival-guide&day=2",
        },
      ],
      suggestedWaterIntervalDays: 14,
    });
  }

  if (isUnderwatered) {
    return finish(answers, {
      title: "Severe Dehydration / Underwatering",
      description:
        "Your plant is suffering from chronic moisture deprivation. As the soil dries out completely, the plant's internal cell pressure drops, causing leaves to wilt, drop, or develop crisp brown margins. When soil becomes extremely dry, it can become hydrophobic, meaning water runs down the inner sides of the pot without actually soaking the roots.",
      whatToDoToday:
        "Give your plant a deep bottom watering. Place the entire pot in a sink or tub filled with 2-3 inches of room-temperature water and let it soak from below for 45 minutes until the top soil feels damp.",
      rescueDays: [
        "Perform deep bottom-watering soak for 45 minutes. Drain thoroughly.",
        "Move the plant slightly back from hot direct sun to reduce transpiration stress.",
        "Snip off completely crispy or dead leaves at the base using clean shears.",
        "Wipe leaves with a damp cloth to clear dust and improve moisture capture.",
        "Check soil moisture. It should feel cool, moist, and loose now.",
        "If leaves have firmed up, move the plant back to its optimal light source.",
        "Resume watering deeply from the top whenever the top 2 inches feel dry.",
      ],
      wateringAdvice:
        "When you water, saturate the soil completely until water flows freely out of the drainage holes. Avoid giving small, frequent splashes of water, which only wet the top layer and starve lower roots.",
      lightAdvice:
        "Avoid placing a dehydrated plant in scorching, hot direct sun, which accelerates moisture loss.",
      soilPotAdvice:
        "If your soil mix has compacted and shrunk away from the pot edges, poke holes in it with a chopstick to help water reach the root ball, or repot with organic coco coir.",
      mistakes: [
        "Giving small, shallow sips of water instead of saturating.",
        "Ignoring hydrophobic soil that refuses to absorb water.",
        "Placing dehydrated plants in hot direct window sunlight.",
      ],
      relatedGuides: [
        {
          title: "Avoiding Root Rot: The Golden Rule of Watering",
          link: "/guides?article=survival-guide&day=0",
        },
        {
          title: "The Art of Humidity: Tropical Oasis Hacks",
          link: "/guides?article=survival-guide&day=3",
        },
      ],
      suggestedWaterIntervalDays: 7,
    });
  }

  if (isLowHumidity) {
    return finish(answers, {
      title: "Low Ambient Humidity & Scorched Margins",
      description:
        "Tropical houseplants are native to high-humidity rainforests. Standard indoor air, especially with heaters or air conditioning, is often very dry. Dry air pulls moisture out of leaf tips faster than roots can replace it, so the tips turn brown and crisp.",
      whatToDoToday:
        "Relocate the plant away from active air conditioning vents, heaters, or drafts. Snip off dry brown leaf tips, leaving a tiny brown margin so you don't cut into healthy green tissue.",
      rescueDays: [
        "Move the plant away from drafty windows, air vents, or heaters.",
        "Group this plant tightly with other houseplants to create a humid microclimate.",
        "Construct a pebble tray: fill a tray with stones, add water, and place the pot on top.",
        "Trim dry leaf tips with clean scissors, cutting just outside the green leaf tissue.",
        "Wipe leaves with a damp sponge to remove dust and support transpiration.",
        "Verify soil moisture. Low humidity areas dry out soil quicker.",
        "Evaluate the plant. If new tips are green, the environment has stabilized.",
      ],
      wateringAdvice:
        "Water when the top 2 inches of soil feel dry. Do not overwater the soil to compensate for dry air, as this leads to root rot.",
      lightAdvice:
        "Provide bright, filtered indirect light. Hot direct sunlight will exacerbate dry leaf tips.",
      soilPotAdvice:
        "Add organic compost or peat moss to the potting mix to hold moderate moisture, but ensure drainage remains excellent.",
      mistakes: [
        "Misting leaves with a spray bottle, which dries in minutes and can invite fungus.",
        "Placing tropical plants directly in front of dry air blowing from vents.",
        "Allowing soil to dry out completely for long periods.",
      ],
      relatedGuides: [
        {
          title: "The Art of Humidity: Creating a Tropical Oasis",
          link: "/guides?article=survival-guide&day=3",
        },
        {
          title: "Demystifying Light Levels: Shadow Tests",
          link: "/guides?article=survival-guide&day=1",
        },
      ],
      suggestedWaterIntervalDays: 7,
    });
  }

  if (isLowLight) {
    return finish(answers, {
      title: "Light Starvation / Photosynthesis Deficit",
      description:
        "Your plant is not getting enough light to use the water in the pot. In low light, growth slows or stretches, leaves can yellow, and soil stays wet for a long time. That wet soil is a common path to root rot.",
      whatToDoToday:
        "Move the plant closer to a window, or to a room with bright indirect light. Wipe dust off the leaves with a damp cloth so they can use the light they get.",
      rescueDays: [
        "Move the plant to a spot directly facing an East or West window.",
        "Wipe leaves with a damp cloth to clear dust blocking light absorption.",
        "Rotate the pot 90 degrees to ensure all sides receive equal light.",
        "Inspect soil moisture. Note how long it takes to dry now.",
        "Do not fertilize. A plant that is not growing cannot process extra nutrients.",
        "Trim off completely yellowed lower leaves to redirect energy to new shoots.",
        "Consider adding an LED grow light if natural window light is limited.",
      ],
      wateringAdvice:
        "Because a light-starved plant processes water extremely slowly, reduce watering frequency. Water only when the soil is dry at least halfway down the pot.",
      lightAdvice:
        "Acclimate the plant gradually. Moving a plant from a dark corner directly into scorching direct sun will sunburn the leaves.",
      soilPotAdvice:
        "Use a porous pot, such as terra cotta, and a loose, fast-draining soil mix to offset the slower water absorption rate.",
      mistakes: [
        "Keeping plants in dark hallways or windowless bathrooms.",
        "Fertilizing a plant that isn't growing due to lack of light.",
        "Watering frequently in low-light environments.",
      ],
      relatedGuides: [
        {
          title: "Demystifying Light Levels: What Bright Indirect Means",
          link: "/guides?article=survival-guide&day=1",
        },
        {
          title: "Nutrients 101: Fertilizer Science and Cycles",
          link: "/guides?article=survival-guide&day=4",
        },
      ],
      suggestedWaterIntervalDays: 14,
    });
  }

  if (isPests) {
    return finish(answers, {
      title: "Pest Colonization or Fungal Pathogen",
      description:
        "The symptoms match pests such as spider mites, mealybugs, or fungus gnats, or a fungus such as powdery mildew. This quiz cannot see the plant, so confirm with a close look at leaf undersides and the soil surface before treating.",
      whatToDoToday:
        "Isolate the plant from your other plants. Wipe the leaves with a mild soapy water solution and look under the leaves for insects, webbing, or powder.",
      rescueDays: [
        "Quarantine the plant. Wipe all leaves and stems thoroughly with soapy water.",
        "Spray the entire plant with insecticidal soap or neem oil, especially leaf undersides.",
        "Dab visible cottony mealybugs directly with a cotton swab dipped in rubbing alcohol.",
        "Allow topsoil to dry out. Place yellow sticky cards to trap adult gnats.",
        "Prune and discard heavily infested leaves in the trash.",
        "Apply a second spray of insecticidal soap to catch newly hatched pests.",
        "Re-inspect the plant under bright light. Keep it isolated until it is clear.",
      ],
      wateringAdvice:
        "Let the soil dry out more than usual between waterings. Fungus gnats breed in damp, warm topsoil.",
      lightAdvice:
        "Place in bright indirect light. Do not put a plant sprayed with oil into hot direct sun.",
      soilPotAdvice:
        "If fungus gnats persist, add a half-inch layer of dry sand to the topsoil to block their breeding cycle, or use mosquito dunks in watering water.",
      mistakes: [
        "Leaving infested plants next to healthy ones.",
        "Spraying oil-based pesticides and putting the plant in direct hot sun.",
        "Keeping soil constantly wet, which invites fungus and gnats.",
      ],
      relatedGuides: [
        {
          title: "Common Pests & How to Defeat Them Naturally",
          link: "/guides?article=survival-guide&day=5",
        },
        {
          title: "Avoiding Root Rot: The Golden Rule of Watering",
          link: "/guides?article=survival-guide&day=0",
        },
      ],
      suggestedWaterIntervalDays: 10,
    });
  }

  return finish(answers, {
    title: "Acclimation Stress & Mild Nutrient Deficiency",
    description:
      "Nothing in the answers points to a single clear cause. The plant may be adjusting to a draft or seasonal change, or the potting mix may be low on nutrients. This is a starting checklist, not a confirmed disease diagnosis.",
    whatToDoToday:
      "Clean the leaves so they can use the light they get. Check the soil moisture. If it is the growing season and the soil is moist but not wet, a quarter-strength liquid fertilizer is enough.",
    rescueDays: [
      "Position the plant in a stable location with bright indirect light and no drafts.",
      "Wipe dust off leaves to boost light capture and plant respiration.",
      "Verify soil moisture using the finger test.",
      "Apply an organic liquid fertilizer diluted to 1/4 strength only if the soil is already moist.",
      "Rotate the pot 90 degrees to encourage balanced vertical growth.",
      "Inspect stems and leaf joints under a bright light for early pest signs.",
      "Set a weekly reminder to check soil moisture and inspect leaf health.",
    ],
    wateringAdvice:
      "Water deeply only when the top 2 inches of soil feel dry. Always drain the saucer.",
    lightAdvice:
      "Aim for several hours of bright, filtered indirect light. Move the plant if the spot is dark by mid-afternoon.",
    soilPotAdvice:
      "Top-dress the soil with 1-2 inches of worm castings or compost if you want a slow source of nutrients.",
    mistakes: [
      "Applying full-strength fertilizer to dry soil.",
      "Moving the plant to different rooms constantly.",
      "Fertilizing heavily in winter when growth has slowed.",
    ],
    relatedGuides: [
      {
        title: "Nutrients 101: Fertilizer Science and Cycles",
        link: "/guides?article=survival-guide&day=4",
      },
      {
        title: "Pruning, Propagating & Styling Your Plants",
        link: "/guides?article=survival-guide&day=6",
      },
    ],
    suggestedWaterIntervalDays: 7,
  });
}
