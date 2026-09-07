// Things you overhear rather than things you are told. Lines are short, mostly
// transliterated Malayalam, and only glossed when the meaning would otherwise
// be lost. They surface from proximity, weather and time — never from a quest.

export const REGION_FLAVOUR = {
  backwaters: {
    greeting: "Entha, evide pooya?",
    // Kuttanad and Kottayam: canal talk, rice, and the boat that is always late.
    tone: "canal",
  },
  central: {
    greeting: "Sugallae?",
    tone: "town",
  },
  malabar: {
    // North Malabar leans on "ingal" where the south says "ningal".
    greeting: "Ingalu evideyaa?",
    tone: "coast",
  },
  highlands: {
    greeting: "Thanuppundallo?",
    tone: "hill",
  },
  south: {
    greeting: "Ningal evideyaanu?",
    tone: "city",
  },
};

// `at` is a place, `radius` how close you must be, `when` an optional gate.
// `gloss` is only for lines a non-Malayali could not follow from context.
export const OVERHEARD = [
  {
    id: "chaayakkada",
    x: -12,
    z: 30,
    radius: 20,
    lines: [
      { who: "Leela", text: "Oru chaya koodi edukkatte?" },
      {
        who: "At the counter",
        text: "Ee kaaryam paranju theerilla, Leelechi.",
        gloss: "we will never finish talking about this",
      },
      { who: "Leela", text: "Pazham pori chood aanu. Vaangikko." },
      {
        who: "At the counter",
        text: "Nale varaam ketto. Kadam pinne.",
        gloss: "I'll come tomorrow — the tab can wait",
      },
      { who: "An old man", text: "Ee sarkkaar onnum cheyyilla, nokkiko." },
    ],
  },
  {
    id: "chaayakkada-rain",
    x: -12,
    z: 30,
    radius: 28,
    when: (c) => c.rain > 0.3,
    lines: [
      { who: "Leela", text: "Mazha thodangi. Akathekku kayari nilkku." },
      {
        who: "Someone sheltering",
        text: "Chaya adipoli timing aanu ithu.",
        gloss: "perfect weather for tea",
      },
      { who: "A boy", text: "Kuda kondu vannillallo!" },
    ],
  },
  {
    id: "jetty",
    x: 24,
    z: 5,
    radius: 20,
    lines: [
      { who: "Binu", text: "Vellathinu swantham vazhikal undu." },
      {
        who: "Binu",
        text: "Vallam sookshichu thuzhayanam. Thirakku illa.",
        gloss: "paddle carefully — there's no hurry",
      },
      { who: "A boatman", text: "Meen kittiyo innu?" },
    ],
  },
  {
    id: "courtyard",
    x: -22,
    z: -25,
    radius: 30,
    lines: [
      { who: "Hari", text: "Thaalam pizhachu. Onnu koodi." },
      {
        who: "A drummer",
        text: "Kai vedana edukkum, pinne shariyaakum.",
        gloss: "your hands will hurt, then they'll learn",
      },
      {
        who: "Hari",
        text: "Chenda kettunnathu kaathu kondalla, manassu kondaanu.",
      },
    ],
  },
  {
    id: "coir",
    x: 62,
    z: -42,
    radius: 20,
    lines: [
      { who: "Radha", text: "Chakiri thallanam, ennitte kayar pirikkam." },
      { who: "Radha", text: "Ee joli ammayude ammakkum ariyaam." },
    ],
  },
  {
    id: "village-road",
    x: 2,
    z: 40,
    radius: 60,
    lines: [
      { who: "A neighbour", text: "Aa vazhikku pokandaa, chelam aanu." },
      {
        who: "Someone passing",
        text: "Sugalle? Veetil ellaarum sugam thanne?",
      },
      { who: "A boy on a cycle", text: "Maaru maaru, vazhi tha!" },
    ],
  },
  {
    id: "paddy",
    x: -48,
    z: -108,
    radius: 26,
    lines: [
      { who: "A farmer", text: "Vellam kayari ponkilla ee kollam." },
      {
        who: "A farmer",
        text: "Nellu pacha aanu. Ini koracchu naal koodi.",
        gloss: "the rice is still green — a while yet",
      },
    ],
  },
  {
    id: "kavu",
    x: 92,
    z: -70,
    radius: 22,
    lines: [
      { who: "An elder", text: "Ivide oru illayum pottikkaruthu." },
      {
        who: "An elder",
        text: "Kaavu theendalle, kulam nangoo.",
        gloss: "an old saying: harm the grove and the pond goes dry",
      },
    ],
  },
  {
    id: "ghat",
    x: 30,
    z: -630,
    radius: 26,
    lines: [
      { who: "A woman washing", text: "Vellathinu ippozhum thanuppundu." },
      { who: "A boy", text: "Chaadaan pattumo? Aazham illa ivide." },
    ],
  },
  {
    id: "pooram",
    x: 90,
    z: -735,
    radius: 45,
    lines: [
      { who: "A man watching", text: "Melam kondu pidikkunnu, kettille?" },
      {
        who: "A mahout",
        text: "Aana nikkatte. Thirakku koottathe.",
        gloss: "let the elephant stand — don't crowd it",
      },
      { who: "A boy", text: "Kudamaattam ethra manikk aanu?" },
    ],
  },
  {
    id: "spice",
    x: -24,
    z: -870,
    radius: 26,
    lines: [
      { who: "Fatima", text: "Kurumulaku manam pidikkumo ningalkku?" },
      {
        who: "A trader",
        text: "Ee theruvil ethra kappal vannu poyi.",
        gloss: "how many ships have come and gone down this street",
      },
      {
        who: "Fatima",
        text: "Elakkaayum karugapattayum — pathukke chertha mathi.",
      },
    ],
  },
  {
    id: "beach-market",
    x: -44,
    z: -1005,
    radius: 32,
    lines: [
      { who: "Moidu", text: "Ingalu halwa nokkiyo? Chood aanu." },
      { who: "A fish seller", text: "Aayila undu, mathiyum undu. Vegam!" },
      {
        who: "A boy",
        text: "Kadalinte katt maariyittundu.",
        gloss: "the sea breeze has turned",
      },
    ],
  },
  {
    id: "fort",
    x: -62,
    z: -1350,
    radius: 40,
    lines: [
      { who: "A caretaker", text: "Ee kotta kadalinodu samsaarikkum." },
      { who: "A visitor", text: "Sooryan tazhunnathu ivide ninnu kaananam." },
    ],
  },
  {
    id: "theyyam",
    x: 128,
    z: -1150,
    radius: 40,
    lines: [
      {
        who: "An elder",
        text: "Chenda kettumbol, athu manushyanalla.",
        gloss: "when the drums begin, that is no longer a man",
      },
      { who: "A woman", text: "Doore ninnu thozhuthaal mathi." },
    ],
  },
  {
    id: "estate",
    x: 563,
    z: -262,
    radius: 40,
    lines: [
      { who: "Thanka", text: "Randu ilayum oru mottum. Athrathanne." },
      { who: "A plucker", text: "Manju varunnathinu munpe theerkkanam." },
      {
        who: "A plucker",
        text: "Ivide thanuppu kondu kai maravikkum.",
        gloss: "the cold numbs your hands up here",
      },
    ],
  },
  {
    id: "viewpoint",
    x: 690,
    z: -330,
    radius: 40,
    lines: [
      { who: "A traveller", text: "Manju maariyaal kadal vare kaanaam." },
      { who: "A traveller", text: "Ithinu vendi ithra dooram nadannu." },
    ],
  },
  {
    id: "lagoon",
    x: 152,
    z: 442,
    radius: 55,
    lines: [
      { who: "A fisherman", text: "Ashtamudi ettu kaiyyum neetti kidakkuvaa." },
      { who: "A boatman", text: "Cheena vala uyarthaan neram aayi." },
    ],
  },
  {
    id: "durbar",
    x: 32,
    z: 560,
    radius: 34,
    lines: [
      { who: "Ammini", text: "Ilayil kazhikkanam. Athaanu ruchi." },
      {
        who: "Ammini",
        text: "Payasam undu. Ozhivaakkaan nokkanda.",
        gloss: "there's payasam — don't even try to get out of it",
      },
      {
        who: "A shopkeeper",
        text: "Ee theruvinu nooru varshathe pazhakkam undu.",
      },
    ],
  },
  {
    id: "lighthouse",
    x: -70,
    z: 638,
    radius: 40,
    lines: [
      { who: "A keeper", text: "Velicham thirinju thodangi. Nokkiko." },
      {
        who: "A fisherman",
        text: "Aa velicham kandaanu njangal thirichu varunnathu.",
      },
    ],
  },
];

// Weather and time colour the whole world, wherever you happen to be standing.
export const WEATHER_LINES = {
  "rain-start": [
    { who: "Someone running past", text: "Mazha! Odu odu!" },
    {
      who: "A woman",
      text: "Alakku pureth aanu, ayyo!",
      gloss: "the washing is still outside",
    },
    {
      who: "A man on the road",
      text: "Kuda edukkathe irunnathu bhaagyam kettu.",
    },
  ],
  "rain-stop": [
    { who: "A boy", text: "Mazha ninnu. Purathekku iranghaam." },
    { who: "An old man", text: "Mannu manam. Ithaanu nammude naadu." },
  ],
  night: [
    { who: "Somewhere in the dark", text: "Minnaminungu! Nokku, avide." },
    { who: "A neighbour", text: "Neram irundu. Sookshichu pokku." },
  ],
};

export const CONDUCTOR_LINES = [
  { who: "Conductor", text: "Kayari nilkku, kayari nilkku! Vandi vidum." },
  { who: "Conductor", text: "Ticket edutho? Chillara undo, chillara?" },
  { who: "Conductor", text: "Munnottu neengi nilkku, sthalam undu." },
  {
    who: "Conductor",
    text: "Right! Right!",
    gloss: "the call that sends the bus off",
  },
];

export const ARRIVAL_LINES = [
  { who: "Conductor", text: "Ethi. Irangikko." },
  { who: "Conductor", text: "Ivide irangamo? Sradhichu, pathukke." },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Chooses something worth overhearing for where the player is standing now.
export function overheardFor(context) {
  const near = OVERHEARD.filter((zone) => {
    if (zone.when && !zone.when(context)) return false;
    return Math.hypot(context.x - zone.x, context.z - zone.z) < zone.radius;
  });
  if (!near.length) return null;
  // Prefer the most specific zone the player is inside.
  const zone = near.reduce((a, b) => (a.radius <= b.radius ? a : b));
  return { ...pick(zone.lines), zone: zone.id };
}

export function weatherLine(kind) {
  const list = WEATHER_LINES[kind];
  return list ? { ...pick(list), zone: kind } : null;
}

export const conductorLine = () => ({ ...pick(CONDUCTOR_LINES), zone: "bus" });
export const arrivalLine = () => ({ ...pick(ARRIVAL_LINES), zone: "bus" });
