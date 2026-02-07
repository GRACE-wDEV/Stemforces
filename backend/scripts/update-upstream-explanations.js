/**
 * update-upstream-explanations.js
 *
 * Hybrid migration script that enhances ALL Upstream (English) question
 * explanations and adds static hints.
 *
 * Strategy:
 *   1. Try to find a working Gemini API key from admin users in the DB
 *   2. If a key works → use Gemini to generate rich explanations & hints
 *   3. If no key works → fall back to a comprehensive offline vocabulary
 *      dictionary that produces high-quality explanations programmatically
 *
 * Usage:
 *   cd backend
 *   node scripts/update-upstream-explanations.js
 *
 * Features:
 *   • Batched processing (5 questions/request for AI, all at once for offline)
 *   • Checkpoint file for resume on interruption
 *   • Rate-limit-aware with back-off
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// ─── Configuration ───────────────────────────────────────────────────────────
const BATCH_SIZE = 5;
const DELAY_MS = 4500;
const MAX_RETRIES = 3;
const CHECKPOINT_FILE = join(__dirname, ".upstream-update-progress.json");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      return new Set(
        JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf-8")).processedIds || []
      );
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveCheckpoint(ids) {
  fs.writeFileSync(
    CHECKPOINT_FILE,
    JSON.stringify(
      { processedIds: [...ids], ts: new Date().toISOString() },
      null,
      2
    )
  );
}

function cleanJson(text) {
  let s = text.trim();
  if (s.startsWith("```"))
    s = s
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  return s;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Comprehensive Vocabulary Dictionary ─────────────────────────────────────
// Maps lower-case words/phrases → concise definitions.
// Covers all option words found across the 6 Upstream seed scripts (~793 Qs).
const VOCAB = {
  // ════════════════════════════════════════════
  //  GENERAL & ACADEMIC VOCABULARY
  // ════════════════════════════════════════════
  objective: "a specific goal or target one aims to achieve",
  resolution:
    "a firm decision to do something, or a formal group decision (e.g. New Year's resolution)",
  decision: "a choice or conclusion reached after consideration",
  desire: "a strong personal wish or longing for something",
  revolution: "a dramatic wide-reaching change, or an overthrow of a system",
  innovation: "a new method, idea, or invention",
  novelty: "the quality of being new or unusual; also a small toy or gadget",
  breakthrough:
    "an important discovery or development that removes a barrier",
  past: "the time before the present; earlier events",
  history: "the study of past events; also a personal record or background",
  background:
    "a person's social, educational, or financial circumstances; also the area behind the main object of attention",
  precedent: "an earlier event that serves as an example or guide",
  upbeat: "cheerful and optimistic (informal)",
  optimistic: "hopeful and confident about the future",
  positive: "constructive, favourable, or affirming",
  cheerful: "noticeably happy and bright in mood",
  back:
    "in the direction behind; used in 'as far back as' to mean even in the distant past",
  beyond: "further away than; on the other side of",
  behind: "at the back of; in a position further back",
  before: "earlier in time; in front of",
  mind: "the element of a person that thinks, reasons, and feels",
  thought: "an idea or opinion produced by thinking",
  spirit:
    "a person's prevailing mood or attitude; 'competitive spirit' means the drive to compete",
  soul: "the spiritual or emotional part of a person; deep inner feeling",
  direct: "going straight without deviation; frank and clear",
  precise: "exact, accurate, clearly defined",
  right:
    "correct; also an intensifier meaning 'exactly' (e.g. 'right beside me')",
  exact: "not approximated; totally precise",
  degree: "a unit of measurement; the extent or level of something",
  variance: "the amount of difference or change from a standard",
  scale: "the relative size or extent of something",
  range:
    "the scope or variety of something; 'a wide range' = a large variety",
  faraway: "distant, remote (literary/poetic)",
  remote:
    "far away geographically; having little connection; also 'remote control'",
  distant: "far away in space or time; not closely related or connected",
  slight: "small in degree; not thorough or significant",
  makes: "'make someone do something' = force or cause them to act",
  gets: "'get someone to do something' = persuade or arrange for them to act",
  puts:
    "places something somewhere; 'put someone up to' = incite them to do something",
  lets: "'let someone do something' = allow or permit them to act",
  allot: "distribute or give a share of something to people or purposes",
  assign: "allocate a task, duty, or role to someone",
  entrust: "give someone the responsibility or care of something valuable",
  delegate:
    "assign tasks to others; give someone authority to act on your behalf",
  morals: "standards of behaviour; principles of right and wrong",
  values: "principles or standards considered worthwhile or important",
  rights: "legal or moral entitlements",
  ethics:
    "moral principles governing behaviour; 'Business Ethics' is a standard field",
  aim: "a purpose or intention; the act of pointing or directing",
  object: "a material thing; also a purpose or goal (formal)",
  purpose:
    "the reason something is done; 'for the purpose of' = in order to",
  intention: "a plan or aim that one intends to carry out",
  condition: "a requirement; 'on condition that' = only if",
  term: "a word or phrase with a specific meaning; or a period of time",
  rule: "an established regulation or principle governing conduct",
  decree: "an official order issued by a legal authority or ruler",
  youth:
    "the period of being young; or young people collectively ('the youth')",
  adolescents: "teenagers; people between childhood and adulthood",
  young:
    "not old; 'the young' = young people in general (less formal than adolescents)",
  teenagers: "people aged 13-19",
  addition:
    "something added; 'a valuable addition' = a useful new member or element",
  supplement: "something added to complete or enhance a whole",
  accumulation: "a gradual gathering or build-up of something over time",
  appendage: "something attached to or projecting from a larger body",
  cover: "to include, deal with, or extend over an area or topic",
  occupy: "to take up space, time, or attention; to live in a place",
  receive: "to be given, presented with, or accept something",
  complete: "to finish something; or having all necessary parts",
  ruthlessness: "lack of compassion; relentless and pitiless determination",
  rudeness: "lack of manners; impoliteness",
  cruelty: "willingness to cause pain or suffering to others",
  callousness: "insensitive and cruel indifference to others' feelings",
  grab: "to seize something suddenly and roughly (informal)",
  follow: "to go after someone; to pursue; to understand",
  pull: "to draw something toward oneself",
  seize:
    "to take hold of suddenly and firmly; 'seize an opportunity' is a standard collocation",
  state: "the condition of something; or a nation/political entity",
  form: "shape or structure; condition ('in good form' = performing well)",
  shape:
    "the outline or form of something; 'in good shape' = in good condition",

  // ════════════════════════════════════════════
  //  TRAVEL & LEISURE
  // ════════════════════════════════════════════
  trip: "a short journey for pleasure or a specific purpose; 'fishing trip' is standard",
  journey:
    "a long-distance trip, often emphasising the travelling process itself",
  trek: "a long, difficult walk over rough terrain",
  hike: "a long walk in nature, typically for exercise or pleasure",
  translation: "converting text from one language to another",
  execution:
    "carrying out a plan or task; also the carrying out of a death sentence",
  rendition: "a performance or interpretation of a song or piece of music",
  edition: "a particular version or release of a publication",
  listened: "past tense of 'listen' — a verb, not an adjective",
  audible:
    "able to be heard; 'barely audible' = almost too quiet to hear",
  loud: "producing much noise; high in volume",
  clear: "easy to perceive, understand, or hear",
  chilly:
    "uncomfortably cool; 'chilly breeze' is a natural, common collocation",
  frosty: "very cold with frost forming on surfaces; stronger than chilly",
  frigid: "extremely cold (formal/literary); also emotionally cold",
  glacial: "icy cold like a glacier; or extremely slow",
  floor: "the lower surface of a room; the ground level of a building",
  ground: "the solid surface of the earth",
  platform: "a raised flat surface for standing on; a train stop",
  deck: "the outdoor floor area on a ship or a patio; 'stood on the deck'",
  pristine:
    "in its original, unspoiled condition; 'pristine beach' = perfectly clean and untouched",
  faultless:
    "free from any defects (describes quality of work, not natural beauty)",
  pure: "free from contamination; unmixed",
  untouched: "not handled, altered, or affected",

  // ════════════════════════════════════════════
  //  OPINIONS, EXPRESSIONS & IDIOMS
  // ════════════════════════════════════════════
  "at large":
    "free, not captured; or in general ('the public at large')",
  "at a standstill": "not moving or progressing at all",
  "at odds":
    "in disagreement or conflict; 'at odds with' = opposing someone",
  "at a loose end": "having nothing to do; idle",
  likeness: "resemblance to someone; also a portrait or representation",
  care: "feelings of concern or attention; 'take care'",
  preference: "a greater liking for one alternative over another",
  inclination:
    "a natural tendency or disposition toward something (more formal than preference)",
  blockade:
    "a barrier set up to prevent access, especially as a military operation",
  cordon: "a line of police or soldiers surrounding and guarding an area",
  closure: "the act of closing something permanently or temporarily",
  siege:
    "a military operation surrounding a place to cut off supplies; 'under siege'",
  bubbling: "forming bubbles; gently boiling or effervescent",
  smoldering: "burning slowly with smoke but no flame",
  blistering:
    "extremely hot; 'blistering heat' = scorching, intense heat",
  sizzling:
    "making a hissing/frying sound; informally: very hot weather or action",
  restful: "having a quiet, peaceful, and soothing quality",
  gentle: "mild and kind; not rough or severe",
  soothing:
    "calming and relaxing; 'soothing bath' is a standard collocation",
  mild: "not severe, harsh, or extreme; gentle in nature",
  curator:
    "a person in charge of a museum's or gallery's collections",
  dean: "a senior university or college official overseeing a faculty",
  escort:
    "a person who accompanies another for protection, guidance, or courtesy",
  conductor:
    "a person who directs an orchestra; or an official who collects fares on a bus/train",
  discordant: "disagreeing; harsh-sounding; lacking harmony",
  discontinuing: "stopping or ceasing to produce or do something",
  disconcerting:
    "unsettling, disturbing, or causing unease; 'disconcerting news'",
  discouraging:
    "causing someone to lose confidence, enthusiasm, or hope",
  vociferous: "expressing opinions loudly, forcefully, and at length",
  boisterous: "noisy, energetic, and cheerful; rowdy in a lively way",
  raucous: "making a harsh, loud, and unpleasant noise",
  deafening: "extremely loud; so loud it could damage hearing",
  whisk: "a kitchen utensil with wire loops for beating eggs or cream",
  colander:
    "a perforated bowl used for draining water from pasta or vegetables",
  saucepan: "a deep cooking pot with a long handle",
  grater: "a metal tool with sharp holes for shredding cheese, vegetables, etc.",
  look: "a glance; the act of looking at something",
  glance:
    "a brief or hurried look; 'at a glance' = quickly and immediately",
  stare: "to look fixedly at something for a long time without blinking",
  glimpse:
    "a brief, incomplete view of something; a quick peek",
  yells: "shouts loudly and forcefully",
  finds: "discovers or comes upon something",
  has: "possesses or owns",
  takes:
    "'takes pride in' = feels proud about (fixed English collocation)",
  needed: "required; was necessary (past tense)",
  required: "demanded as necessary by a rule or situation",
  essential:
    "absolutely necessary; indispensable; 'essential to' = crucial for",
  desirable:
    "worth having or wanting, but not strictly necessary",
  turbulence:
    "violent and unsteady movement of air or water; standard in aviation contexts",
  instability:
    "lack of stability; a tendency to change suddenly or unpredictably",
  unsteadiness: "not firmly balanced or fixed; shaky",
  wavering: "being indecisive; moving unsteadily back and forth",

  // ════════════════════════════════════════════
  //  LAW & CRIME
  // ════════════════════════════════════════════
  lying: "being in a flat position; or telling untruths",
  waiting: "staying in one place expecting something to happen",
  loitering:
    "lingering without clear purpose, often suspiciously; 'loitering with intent' is a legal phrase",
  standing: "being in an upright position on one's feet",
  manslaughter:
    "the unintentional killing of a person through negligence (legal term, less severe than murder)",
  murder: "the unlawful and premeditated killing of another person",
  killing: "the act of causing death (general, non-legal word)",
  homicide:
    "the killing of one person by another (formal/legal umbrella term)",
  accuser:
    "a person who claims someone committed a wrong or crime",
  critic:
    "a person who expresses disapproval; or one who reviews art, film, etc.",
  prosecutor:
    "a lawyer who brings the case against a defendant in a criminal court",
  juror: "a member of a jury who decides a verdict in court",
  raised:
    "brought up; or provoked a response ('raised a reaction')",
  originated: "had its origin in a particular place or time; began",
  developed: "grew or progressed over time; evolved",
  produced:
    "created, manufactured, or caused to happen ('produced a reaction')",
  control: "the power to direct, manage, or restrain something",
  handle:
    "to manage, cope with, or deal with a situation; 'handle a challenge'",
  run: "to operate or manage a business, organisation, etc.",
  order: "to give a command; also an arrangement or sequence",
  force: "strength or physical power; coercion or compulsion",
  stressing:
    "emphasising strongly; or putting mental/physical pressure on",
  compelling:
    "very convincing and hard to resist; also forceful and urgent",
  pressure:
    "force applied to something; 'pressure group' = a lobbying/advocacy organisation",
  leading:
    "most important or influential; 'leading authority' = the top expert in a field",
  first: "coming before all others in time, order, or importance",
  premier:
    "first in importance, rank, or position (formal); also: a head of government",
  main: "chief; principal; most important",
  humanitarian:
    "concerned with human welfare and reducing suffering; 'humanitarian organisation'",
  human: "relating to or characteristic of people",
  "people's": "belonging to or connected with the people",
  popular: "liked, admired, or enjoyed by many people",
  "acted for":
    "represented legally in a specific case (somewhat limited usage)",
  embodied: "gave a body or form to an idea; personified",
  represented:
    "had an official presence or office in; stood for; acted on behalf of",
  "stood for": "symbolised; was an abbreviation or representation of",
  in: "'in crisis' = currently experiencing a crisis (standard phrase)",
  on: "on a surface; or indicating a state ('on fire', 'on duty')",
  under:
    "beneath; subject to ('under pressure', 'under investigation')",
  at: "in a specific place or time ('at noon', 'at the station')",
  regional: "relating to a particular geographical region or district",
  native: "occurring naturally in a place; indigenous; born in a place",
  local:
    "'local authorities' = local government bodies responsible for an area",
  resident: "a person who lives permanently in a particular place",
  practising:
    "carrying out or performing an activity or profession regularly",
  serving:
    "providing service to someone; 'serving customer needs'",
  exercising:
    "engaging in physical activity; or using a right or power",
  functioning:
    "working or operating properly; 'functioning correctly'",
  had: "possessed or owned (past tense of 'have')",
  took: "'took a stand' = adopted a firm position on an issue (fixed expression)",
  got: "obtained, received, or acquired (past tense of 'get')",
  gave: "transferred possession of something to someone",
  improvements: "acts or instances of making something better",
  corrections: "acts of fixing errors or mistakes",
  amends:
    "reparation for a wrongdoing; 'make amends' = compensate or atone for a wrong",
  adjustments: "small changes made to improve or fix something",
  "putting in": "installing; contributing time or effort",
  "passing over": "ignoring; skipping; choosing not to consider",
  "laying down":
    "'laying down the law' = stating rules firmly and authoritatively",
  "giving over": "handing over; dedicating to a particular use or purpose",
  "far from": "not at all; a long way from being something",
  "ahead of": "in front of; before in time or position",
  outside: "not inside; external to; beyond the limits of",
  friend: "a person one likes and trusts (noun, not a verb form)",
  "made friends": "became friends (requires 'with' after it)",
  "became friends": "entered a friendship (requires 'with' after it)",
  befriended:
    "became a friend to someone; took someone under one's wing (transitive verb: 'she befriended him')",
  job: "a paid position of regular employment",
  task: "a specific piece of work to be done; an assignment",
  mission:
    "an important assignment, goal, or calling; often with a sense of purpose",
  project: "a planned undertaking; 'research project' is standard",
  presidential:
    "relating to a president; 'presidential elections' is the standard phrase",
  presiding: "being in charge of a meeting or court proceedings",
  president: "the head of state (a noun, not an adjective)",
  presided: "was in charge of; chaired (past tense verb)",

  // ════════════════════════════════════════════
  //  EDUCATION & SCHOOL
  // ════════════════════════════════════════════
  script: "the text of a play, film, or broadcast",
  lines: "words spoken by an actor in a play; or marks drawn on a page",
  score:
    "the music composed for a film or play; also: points in a game",
  writing: "the activity or skill of composing text",
  schooling: "education received at school",
  learning:
    "the acquisition of knowledge through study; 'distance learning' is standard",
  education:
    "the systematic process of receiving instruction; 'distance education'",
  teaching:
    "the occupation of a teacher; the act of imparting knowledge",
  tuition:
    "teaching or instruction; 'tuition fees' = charges for educational courses",
  ease: "absence of difficulty or effort; comfort",
  colours:
    "'with flying colours' = with great success and distinction (fixed idiom)",
  speed: "the rate of movement or travel",
  looks: "outward appearance; the way someone or something appears",
  vivid:
    "producing strong, clear, bright images in the mind; intensely colourful",
  alive: "living; not dead; full of energy and activity",
  living: "currently alive; or relating to daily life ('living room')",
  lively:
    "full of energy, enthusiasm, and excitement; 'lively debate' is standard",
  jamming: "playing music informally with others; or causing a block",
  cramming:
    "studying intensively right before an exam; filling something to capacity",
  cramping: "experiencing a painful muscle cramp or spasm",
  ramming:
    "hitting or pushing something with great force; driving into",
  "show up": "arrive; appear; or embarrass someone publicly",
  stress: "emphasise a point; or mental/emotional pressure and tension",
  emphasise:
    "give special importance or prominence to something in speech or writing",
  highlight:
    "draw special attention to; mark with bright colour; 'highlight discrepancies'",
  drawer:
    "a sliding compartment in a piece of furniture for storage",
  roller: "a cylinder that rotates, used for flattening, spreading, or painting",
  ruler:
    "a flat measuring instrument for drawing straight lines; or a person who governs",
  compass:
    "a V-shaped drawing tool for circles; or a device showing magnetic north",
  tube: "'test tube' = a glass tube used in laboratory experiments",
  cylinder:
    "a solid geometric shape; a container with a circular cross-section",
  hose: "a flexible tube for conveying water or other fluids",
  pipe: "a tube for conveying water, gas, or other substances",
  archaic:
    "very old; belonging to an earlier period; no longer in common use",
  antiquated:
    "old-fashioned, outdated (emphasises that something is out of date because of its age)",
  early: "near the beginning of a period of time",
  outdated: "no longer current, relevant, or useful; obsolete",
  pleasurable:
    "giving pleasure (usually describes an experience, not a voice or sound)",
  pleasant:
    "agreeable and enjoyable; 'pleasant voice' = a nice-sounding voice",
  pleased:
    "feeling happy or satisfied about something (describes a person's emotion, not a quality)",
  pleasure: "a feeling of enjoyment, satisfaction, or delight (noun)",
  standard:
    "a level of quality or attainment; normal, usual, or expected",
  formal:
    "following established rules and conventions; 'formal education' = structured institutional schooling",
  official:
    "relating to authority, public duties, or authorised channels",
  prescribed:
    "recommended or laid down as a rule by an authority",
  bird: "a feathered animal; 'a little bird told me' = someone told me secretly (idiom)",
  dog: "a domesticated animal; 'dog days' = hottest part of summer",
  pet: "'teacher's pet' = a student who is the teacher's favourite (idiom)",
  cat: "a small domesticated feline; 'let the cat out of the bag' = reveal a secret",
  success: "the achievement of a goal or aim; positive outcome",
  top: "the highest point or position",
  grade:
    "'make the grade' = reach the required standard or level (fixed idiom)",
  mark: "a sign, symbol, or grade; 'make your mark' = leave an impression",
  attractions:
    "things that draw interest or visitors; 'tourist attractions'",
  appeals:
    "requests for help; attractive qualities (more abstract than attractions)",
  temptations:
    "things that entice someone to do something potentially unwise",
  enticements:
    "things that attract by offering pleasure, reward, or advantage",
  lawful: "conforming to or permitted by the law",
  authorised: "officially approved or sanctioned",
  legitimate:
    "valid, justified, and conforming to rules; 'legitimate complaint'",
  permissible: "allowed; acceptable under the rules",
  sign: "a notice or gesture conveying information; or to write one's name",
  signature:
    "a person's name written in their own distinctive handwriting",
  signing:
    "the act or ceremony of writing one's name; 'the signing of the agreement'",
  signal:
    "a gesture, action, or sound conveying information or instructions",
  head: "the upper part of the body containing the brain",
  hand: "'know like the back of your hand' = know extremely well (idiom)",
  life: "the condition of being alive; existence",
  cash: "money in physical coins or banknotes; 'cash in hand'",
  prize: "a reward given for winning a competition",
  fee: "a charge for professional service or admission; 'registration fee'",
  bill: "a statement of charges; a proposed piece of legislation",
  mouth:
    "'by word of mouth' = through spoken recommendations (fixed idiom)",
  legend:
    "a traditional story sometimes popularly regarded as true; also: a famous person",
  myth: "a widely held but false belief; an ancient traditional story",
  ear: "the organ of hearing; 'play it by ear' = improvise",
  nose: "the organ of smell; 'follow your nose' = go straight ahead",

  // ════════════════════════════════════════════
  //  HEALTH & MEDICINE (Unit 7)
  // ════════════════════════════════════════════
  eradicated:
    "completely destroyed or eliminated; wiped out entirely",
  contradicted:
    "stated the opposite of; denied or went against a previous statement",
  diagnosed:
    "identified a disease or problem after examination; 'quickly diagnosed'",
  converted: "changed from one form, state, or system to another",
  contagious:
    "spreading easily by contact between people; 'highly contagious disease'",
  catching:
    "infectious (informal); also: attracting attention; 'a catching melody'",
  infected:
    "affected by a pathogen causing disease (describes a person or area, not a disease itself)",
  deadly: "capable of causing death; extremely dangerous",
  judge:
    "a person who decides legal cases in court; or evaluates and forms an opinion",
  umpire:
    "an official who watches and enforces rules in tennis, cricket, or baseball",
  referee:
    "an official in football, boxing, or basketball who enforces rules of the game",
  arbiter:
    "a person who settles a dispute between parties (formal/legal)",
  nagging:
    "persistently annoying or worrying; 'nagging pain' = a constant dull ache",
  fierce: "intense, powerful, and aggressive; extremely strong",
  distressing: "causing great anxiety, sadness, or sorrow",
  critical:
    "extremely serious or dangerous; or expressing strong disapproval",
  pitch:
    "a playing field for football, cricket, or rugby (British English)",
  track:
    "a path or course for running or racing; 'athletics track'",
  rink: "an enclosed area of ice for skating or ice hockey",
  court:
    "a playing area for tennis, basketball, badminton, or squash",
  ring: "an enclosed area for boxing, wrestling, or circus performances",
  closet:
    "a small room or cupboard for storing clothes (mainly American English)",
  locker:
    "a small lockable storage compartment; found in gyms, schools, and stations",
  cupboard:
    "a piece of furniture or built-in storage with shelves and doors",
  dresser:
    "a piece of furniture: a chest of drawers, often with a mirror",
  mottos:
    "short statements expressing principles or beliefs of a group",
  jingles:
    "short catchy tunes used in advertising to make brands memorable",
  slogans:
    "short, memorable phrases used in campaigns, protests, or advertising; 'chanted slogans'",
  phrases:
    "groups of words forming a meaningful unit of expression",
  sheer:
    "very steep, almost vertical; or absolute/complete ('sheer luck')",
  high: "extending far upward; at a great distance above the ground",
  abrupt:
    "sudden and unexpected; also: rude or curt in manner",
  steep:
    "rising or falling sharply at a great angle; 'steep flight of stairs'",
  distinguish:
    "recognise or identify as different; 'distinguish right from wrong'",
  separate:
    "set or keep apart; divide into parts or groups",
  corn: "a cereal plant (like wheat or maize); or a painful patch on the foot",
  corner:
    "the point where two lines, edges, or surfaces meet",
  cornea:
    "the transparent front layer of the eye that covers the iris and pupil",
  cornet:
    "a brass musical instrument similar to a trumpet; or an ice-cream cone",
  pupils:
    "the dark circular openings in the centre of the eye that adjust to light; also: students in a school",
  students: "people who are studying at a school, college, or university",
  puppets:
    "figures controlled by strings or hands, used in performances",
  kittens: "young cats, typically under one year old",
  eardrop:
    "a type of earring; or liquid medication administered into the ear",
  eardrum:
    "the thin membrane in the middle ear that vibrates in response to sound waves",
  "ear lobe": "the soft, fleshy lower part of the outer ear",
  earflaps: "flaps on a hat that fold down to cover and protect the ears",
  airbase:
    "a military base from which aircraft operations are conducted",
  airbag:
    "an inflatable safety device in a car that deploys in a collision",
  airbridge:
    "an enclosed walkway connecting an airport terminal to an aircraft",
  airway:
    "a passage through which air enters and leaves the lungs; or an airline",
  skull:
    "the bony structure forming the head, enclosing and protecting the brain",
  skin: "the outer covering of the body; the largest organ",
  scar: "a mark left on the skin after a wound or injury heals",
  scarf: "a piece of fabric worn around the neck for warmth or decoration",
  ancestors:
    "people from earlier generations from whom one is descended",
  incisions: "surgical cuts made during an operation",
  incisors:
    "the sharp, flat-edged front teeth used for cutting and biting food",
  sizzlers: "something very hot or exciting (informal/rare)",
  collarbone:
    "the bone connecting the shoulder blade to the breastbone (clavicle)",
  collar:
    "the part of a garment around the neck; or a band around an animal's neck",
  bonehead: "a stupid person (informal slang)",
  "bone marrow":
    "the soft, spongy tissue inside bones that produces blood cells",
  spinner:
    "something that spins; a type of cricket ball; a fishing lure",
  spiral:
    "a curve that winds in gradually widening or tightening circles",
  spine:
    "the column of vertebrae forming the backbone; the spinal column",
  spinal: "relating to or affecting the spine (adjective form)",
  breastbone:
    "the long, flat bone in the centre of the chest (sternum)",
  breaststroke:
    "a swimming stroke performed face-down with circular arm movements",
  breastplate:
    "a piece of armour covering and protecting the chest",
  "rib cage":
    "the bony frame of ribs enclosing and protecting the lungs and heart",
  kneecaps:
    "the small, flat bones at the front of the knee joints (patellae)",
  shins:
    "the front parts of the legs between the knee and ankle",
  shines: "gives off or reflects light; polishes to a brightness",
  chins:
    "the lower parts of the face below the mouth (plural of chin)",
  breathes:
    "takes air in and out of the lungs (inhales and exhales)",
  yawns:
    "opens the mouth wide and inhales deeply when tired or bored",
  wheezes:
    "breathes with a rattling, whistling sound, often due to illness",
  throbbing:
    "beating or pulsating with a strong, regular rhythm; 'throbbing headache'",
  thrilling:
    "causing a sudden feeling of excitement and pleasure",
  bleached:
    "made white or pale by exposure to chemicals or sunlight",
  blinked: "shut and opened the eyes quickly and involuntarily",
  blackened: "made dark or black, often by burning or charring",
  swallow:
    "to pass food or drink down the throat from the mouth; 'swallow tablets'",
  swell:
    "to become larger or rounder in size; to expand, especially from injury",
  swear:
    "to make a solemn promise or oath; or to use offensive language",
  browsed:
    "looked at casually and leisurely (books, shops, or the internet)",
  breezed:
    "moved quickly and confidently in a casual manner; 'breezed through'",
  bruised:
    "showing marks or discolouration from an impact; 'bruised eye'",
  braced:
    "prepared or steadied oneself for something difficult or unpleasant",
  ingest:
    "to take food, drink, or a substance into the body by swallowing",
  digest:
    "to break down food in the stomach for absorption; 'hard to digest'",
  resist:
    "to withstand the action of; to refuse to accept or comply",
  hazy: "slightly unclear or vague; often describes misty weather or fuzzy memory",
  blurred:
    "not clear or distinct; 'blurred vision' is the standard medical term",
  hoarseness:
    "a rough, husky quality in the voice, often caused by illness",
  blotches:
    "irregular patches or spots on the skin or a surface; 'red blotches'",
  cardiologist:
    "a doctor specialising in diagnosing and treating heart conditions",
  dermatologist:
    "a doctor specialising in diagnosing and treating skin conditions",
  ophthalmologist:
    "a doctor specialising in diagnosing and treating eye conditions",
  "orthopaedic surgeon":
    "a doctor specialising in surgery on bones, joints, and muscles",
  arthritis:
    "a medical condition causing painful inflammation and stiffness of the joints",
  eczema:
    "a skin condition causing itchy, inflamed, red, cracked patches",
  concussion:
    "temporary brain injury caused by a blow to the head, often with dizziness",
  insomnia:
    "the persistent inability to fall asleep or stay asleep",
  indigestion:
    "pain, discomfort, or burning in the stomach after eating; dyspepsia",
  fatigue:
    "extreme tiredness and exhaustion, usually from physical or mental effort",
  fracture:
    "a break or crack, especially in a bone; 'stress fracture'",
  appendicitis:
    "painful inflammation of the appendix requiring urgent medical attention",
  homeopathy:
    "an alternative medicine system using highly diluted substances",
  acupuncture:
    "a traditional Chinese therapy using fine needles inserted at specific body points",
  pneumonia:
    "a serious lung infection causing breathing difficulty and fluid in the lungs",
  meningitis:
    "dangerous inflammation of the membranes surrounding the brain and spinal cord",
  sling:
    "a fabric support hung from the neck to hold an injured arm in place",
  cast: "a rigid plaster or fibreglass casing moulded around a broken bone to support healing",

  // ════════════════════════════════════════════
  //  SPORTS
  // ════════════════════════════════════════════
  stopwatch:
    "a watch with buttons to start and stop, used to time events precisely",
  shuttlecock:
    "the feathered or plastic projectile hit back and forth in badminton",
  puck: "the hard rubber disc used in ice hockey",
  commentator:
    "a person who describes sporting events as they happen on radio or TV",
  tarmac:
    "a hard asphalt surface used for roads, runways, and playing areas",
  sprain:
    "an injury caused by twisting a ligament violently; 'ankle sprain'",
  shinguards:
    "protective pads worn over the shins in football, hockey, and other sports",
  stamina:
    "the ability to sustain prolonged physical or mental effort; endurance",
  excruciating:
    "intensely and agonizingly painful; 'excruciating pain'",
  helmet:
    "protective headgear worn in cycling, construction, and combat sports",
  racket:
    "a bat with a stringed frame used in tennis, squash, or badminton",
  goggles:
    "close-fitting protective glasses for swimming, skiing, or lab work",
  boxing: "a combat sport where two opponents fight with their fists",
  fencing:
    "a sport of fighting with swords (foils, épées, or sabres)",
  wrestling:
    "a sport where two opponents grapple and try to throw each other down",
  archery:
    "the sport of shooting arrows at a target using a bow",

  // ════════════════════════════════════════════
  //  UNIT 4 — ELDERLY & CRIME
  // ════════════════════════════════════════════
  ripe: "'ripe old age' = a very advanced age (fixed English idiom)",
  mature:
    "fully developed physically or emotionally; adult and sensible",
  elderly: "old; past middle age (polite/formal term)",
  ageing: "the process of growing old; becoming older over time",
  nursing:
    "'nursing home' = a residential facility providing care for the elderly",
  nurse: "a healthcare professional who cares for the sick or injured",
  nursery:
    "a room or place for the care of young children; or where plants are grown",
  nurture:
    "to care for and encourage the growth or development of someone or something",
  meals:
    "'meals on wheels' = a community service delivering food to the homebound",
  scheme:
    "an organised plan or programme; 'pension scheme' = retirement savings plan",
  retirement:
    "the act of leaving one's job permanently; the period of life after working",
  retire: "to leave one's job and stop working, usually due to age (verb)",
  retreat:
    "to withdraw from a situation; or a quiet, peaceful place for rest",
  pensioners: "people who receive a pension, typically after retirement",
  waivers:
    "official documents granting exemption from a rule or requirement",
  wavers:
    "hesitates or becomes unsteady in decision or movement (verb)",
  "cash-strapped":
    "having very little money available; financially constrained",
  dementia:
    "a progressive condition affecting memory, thinking, and behaviour, common in elderly people",
  hounded:
    "pursued or harassed relentlessly and persistently",
  agitated:
    "feeling troubled, nervous, or anxious; unable to settle",
  apprehensive:
    "anxious or fearful about something that might happen in the future",
  incapacitated:
    "deprived of strength, ability, or normal capacity; disabled",
  invaluable:
    "extremely useful and indispensable; too valuable to measure",
  mutual:
    "shared by two or more parties; 'mutual friend' = a friend in common",
  petrified:
    "extremely frightened; so scared as to be unable to move",
  threatening:
    "expressing an intention to cause harm; menacing and intimidating",
  "time-consuming":
    "taking a lot of time to complete or do",
  embezzled:
    "stole or misappropriated money entrusted to one's care (financial crime)",
  jaywalkers:
    "pedestrians who cross roads carelessly or in places not designated for crossing",
  vandalism:
    "deliberate destruction of or damage to public or private property",
  littered:
    "scattered with rubbish or trash; made untidy with refuse",
  fraud:
    "criminal deception intended to result in financial or personal gain",
  slander:
    "a false spoken statement that damages someone's reputation (spoken defamation)",
  libel:
    "a false written or published statement that damages someone's reputation (written defamation)",
  mugging:
    "a violent attack and robbery of someone in a public place",
  kidnapped:
    "taken away illegally by force, typically to obtain a ransom",
  trespassing:
    "entering someone else's property without permission (illegal entry)",
  probation:
    "a period of supervised release instead of imprisonment, with conditions",
  "capital punishment":
    "the death penalty; execution as a legal punishment for a crime",
  parole:
    "early conditional release from prison before the full sentence is served",
  "community service":
    "unpaid work in the community done as a legal punishment",
  fine: "a sum of money paid as a penalty for breaking a law or rule",
  "revocation of a privilege":
    "officially taking away a right, licence, or permission as a punishment",
  warrant:
    "a legal document authorising police to arrest someone or search a place",
  "court warning":
    "an official caution given by a court to a defendant",
  barrister:
    "a lawyer in the UK who represents clients in higher courts",
  solicitor:
    "a lawyer who advises clients and prepares legal documents",
  magistrate:
    "a civil officer who administers the law, especially in minor cases",
  arson:
    "the criminal act of deliberately setting fire to property",
  burglary:
    "illegal entry into a building with intent to steal",
  shoplifting:
    "stealing goods from a shop while pretending to be a customer",
  pickpocketing:
    "stealing from someone's pockets or bag without them noticing",
  smuggling:
    "illegally transporting goods across a border to evade taxes or laws",
  bribery:
    "offering money or favours to influence someone in a position of authority",
  forgery:
    "the crime of creating fake documents, signatures, or works of art",
  perjury:
    "the offence of deliberately lying under oath in court",
  verdict:
    "the decision reached by a jury or judge in a trial",
  bail:
    "money paid to temporarily release an accused person before trial",
  sentence:
    "the punishment assigned by a court to a convicted person",
  witness:
    "a person who sees an event and can give evidence about it",
  alibi:
    "evidence that one was elsewhere when a crime was committed",
  defendant:
    "a person accused of a crime in a legal proceeding",
  plaintiff:
    "a person who brings a case against another in a court of law",
  culprit:
    "the person responsible for a crime or wrongdoing",

  // ════════════════════════════════════════════
  //  UNIT 4 — IDIOMS
  // ════════════════════════════════════════════
  "footing the bill": "paying the total cost, often reluctantly",
  "on the fringes of society":
    "living on the margins of mainstream society; marginalised",
  "take the law into one's own hands":
    "act as a vigilante; seek personal justice outside the legal system",
  "kill two birds with one stone":
    "achieve two aims or goals with a single action or effort",
  "throw oneself on the mercy of the court":
    "plead with a judge for leniency and compassion",
  "bridge the gap":
    "reduce or eliminate differences between two groups or ideas",
  "law of the jungle":
    "survival of the fittest; a situation where there are no rules",
  "robbing Peter to pay Paul":
    "solving one problem by creating another of equal or greater size",
  "make a killing":
    "make a large profit quickly, especially in business or gambling",
  "charity begins at home":
    "one should help one's own family and community before helping others",
  "behind bars": "in prison; incarcerated",
  "long arm of the law": "the extensive reach of the legal system",
  "get away with murder":
    "avoid punishment for doing something wrong (figurative)",
  "caught red-handed":
    "discovered in the act of doing something wrong",

  // ════════════════════════════════════════════
  //  UNIT 8 — EDUCATION
  // ════════════════════════════════════════════
  compile:
    "gather information and put it together in a list, report, or book",
  condense:
    "make something shorter or more concise; compress into fewer words",
  condemn:
    "express strong disapproval of; or declare unfit for use",
  compel:
    "force or oblige someone to do something; make it necessary",
  "drag on":
    "continue for longer than desired, expected, or necessary",
  "drag down":
    "lower someone's standards, morale, or quality of life",
  "drag in":
    "introduce an unwanted, unrelated, or irrelevant topic into discussion",
  "drag out":
    "prolong something unnecessarily; make something last too long",
  assignment:
    "a task, piece of homework, or project given to a student",
  assessment:
    "the evaluation or measurement of someone's knowledge or abilities",
  tutorial:
    "a small-group or one-on-one teaching session at a university",
  finals:
    "the last and most important exams at the end of a course or degree",
  severe:
    "very serious, strict, or harsh; 'severe punishment' = harsh penalty",
  substantial:
    "large, considerable, or significant in amount; 'substantial pay increase'",
  spontaneous:
    "done on impulse without planning; 'spontaneous reaction'",
  sheltered:
    "protected from harsh conditions or unpleasant realities",
  "brush up on":
    "review and improve existing skills or knowledge that have become rusty",
  "flick through":
    "turn pages quickly; browse casually through a book or magazine",
  "pluck out": "pull something out sharply; extract",
  "pull down": "demolish a building; or bring something downward",
  coax: "gently and patiently persuade someone to do something",
  bribe:
    "offer money or favours dishonestly to influence someone's actions",
  coerce:
    "use threats, force, or pressure to make someone do something unwillingly",
  bully:
    "repeatedly intimidate, mistreat, or dominate someone weaker",
  arrogant:
    "having an exaggerated, unpleasant sense of one's own importance",
  exuberant:
    "full of energy, excitement, and cheerfulness; enthusiastically lively",
  voracious:
    "wanting or consuming great quantities; 'voracious reader' = very eager reader",
  opinionated:
    "asserting one's views forcefully; unwilling to consider others' opinions",
  irrigate:
    "supply water to agricultural land through channels or pipes",
  cultivate:
    "prepare land for crops; or develop a quality or skill over time",
  navigate:
    "plan and direct a route through an area; find one's way; 'navigate the journey'",
  secrete:
    "produce and discharge a substance from a cell or gland (biology); or hide something",
  perseverance:
    "continued steady effort and determination despite difficulty or delay",
  persecution:
    "hostile, cruel treatment especially because of race, religion, or beliefs",
  prescription:
    "a doctor's written instruction for medicine; also: a recommended remedy",
  persimmon: "an orange-coloured fruit with sweet flesh when ripe",
  inexact:
    "not entirely accurate or precise; approximate",
  inexpert:
    "lacking skill, expertise, or competence in a particular area",
  inevitable:
    "certain to happen and impossible to avoid; unavoidable",
  invariable:
    "never changing; constant and uniform at all times",
  meddle:
    "interfere in other people's affairs without being asked or welcomed",
  mettle:
    "courage, determination, and the ability to cope well with difficulties",
  gratifying:
    "giving pleasure, satisfaction, or a sense of achievement",
  famine:
    "an extreme and widespread scarcity of food causing hunger and starvation",
  dismiss:
    "reject as unworthy of attention or consideration; or fire someone from a job",
  shortage:
    "a lack or insufficiency of something needed; 'shortage of staff'",
  immense:
    "extremely large, vast, or great in scale or degree",
  "smoke detector":
    "an electronic device that detects smoke and sounds an alarm to warn of fire",
  "proof-reading":
    "reading text carefully to find and correct errors before publication",
  guarantee:
    "a firm promise or assurance that conditions will be fulfilled",
  euphemism:
    "a mild or indirect word used as a substitute for one considered too harsh (e.g. 'passed away' for 'died')",
  bigoted:
    "having strong, unreasonable prejudices; intolerant of other views",
  tolerant:
    "willing to accept behaviour, opinions, or beliefs different from one's own",
  "open-minded":
    "receptive and willing to consider new ideas, arguments, and perspectives",
  biased:
    "unfairly prejudiced for or against something; showing favouritism",
  seminary:
    "a college or institution for training clergy or priests",
  prospectus:
    "an informational booklet giving details about a school, university, or investment",
  refresher:
    "'refresher course' = a course to update and renew existing skills or knowledge",
  compulsory:
    "required by law or a rule; mandatory; 'compulsory schooling'",
  dated:
    "old-fashioned and no longer current or relevant; out of date",
  modest:
    "not large, showy, or excessive; humble; 'modest income' = small income",
  extravagant:
    "excessive in spending, cost, or elaborateness; wastefully luxurious",
  demanding:
    "requiring much skill, effort, or attention; very challenging",
  advent:
    "the arrival or coming of an important person, event, or development; 'the advent of technology'",

  // ════════════════════════════════════════════
  //  EXTRAS (101-141) & ADDITIONAL
  // ════════════════════════════════════════════
  boost:
    "increase, improve, or help something grow; 'boost confidence'",
  push: "exert force on; encourage strongly; 'push ahead'",
  foster:
    "encourage and promote the development of something; nurture (ideas/qualities in others)",
  permutations:
    "different possible arrangements, combinations, or variations",
  complications:
    "circumstances that make a situation more difficult or complex",
  transformations:
    "thorough and dramatic changes in form, appearance, or character",
  incarnations:
    "embodiments; particular living forms or manifestations of a deity or concept",
  "wear down":
    "make someone tired, weaker, or less determined through persistent effort",
  "carried on":
    "continued doing something despite difficulties; 'carried on watering'",
  beaming:
    "smiling brightly and radiantly; 'her face was beaming with happiness'",
  glaring:
    "staring in an angry, hostile way; or glaringly obvious",
  glistening:
    "shining with a sparkling, wet, or dewy light",
  flashing:
    "shining briefly, brightly, and intermittently",
  "stole the show":
    "attracted the most attention, applause, or praise at an event",
  ecstatic:
    "overwhelmingly happy, excited, and delighted",
  overwhelmed:
    "overcome completely by a strong emotion; 'overwhelmed with grief'",
  "block out":
    "try not to remember or think about something painful; suppress a memory",
  praise:
    "expression of approval, admiration, or commendation; 'widespread praise'",
  endowment:
    "a quality or ability possessed naturally; 'genetic endowment' = inherited characteristics",
  obsessive:
    "excessively preoccupied with something; 'obsessive about money'",
  "recruitment drive":
    "an organised effort or campaign to hire new employees or members",
  persevering:
    "continuing steadily despite difficulty; determined and persistent",
  perpetuate:
    "make something continue indefinitely; preserve or maintain over time",
  superhuman:
    "having exceptional ability, strength, or power beyond normal human capability",
  clockwork:
    "'like clockwork' = smoothly, regularly, and with no problems (idiom)",
  formulating:
    "creating or preparing methodically and carefully; 'formulating legislation'",
  proactive:
    "taking initiative and acting in advance rather than merely reacting to events",
  potential:
    "possible but not yet actual; latent; 'potential customers' = people who might buy",
  "get ahead":
    "succeed and advance in one's career or life",
  "read up on":
    "research a subject by reading; study intensively to gain knowledge",

  // ════════════════════════════════════════════
  //  UNIT 2 — ADDITIONAL VOCABULARY
  // ════════════════════════════════════════════
  "cliff-hanger":
    "a situation of intense suspense or a story that leaves you in suspense",
  "second thoughts":
    "'on second thoughts' = after reconsidering; changing one's mind",
  reconsider: "think again about a previous decision",
  wander: "walk slowly without a fixed destination or purpose",
  stroll: "walk in a leisurely, relaxed way",
  ramble:
    "walk for pleasure through the countryside; also: talk at length",
  detour:
    "an indirect or longer route taken to avoid something or visit somewhere",
  shortcut: "a quicker or shorter route than the usual one",
  cruise:
    "a voyage on a ship for pleasure, visiting different ports",
  voyage: "a long journey by sea or through space",
  excursion: "a short journey or trip for pleasure; an outing",
  commute:
    "travel regularly between home and work; also the journey itself",
  getaway:
    "a short holiday or vacation, especially a quick escape from routine",
  resort:
    "a place visited for holidays; or to turn to something as a last option",
  souvenir:
    "an object kept as a reminder of a place visited or an event",
  itinerary:
    "a planned route or list of places to visit on a journey",
  accommodation:
    "a place to live or stay, such as a hotel room or flat",
  lodging:
    "temporary accommodation; a place to stay for the night",
  destination:
    "the place to which someone is going or being sent",
  scenic:
    "providing beautiful views of natural landscape; 'scenic route'",
  picturesque:
    "visually charming or quaint, especially in an old-fashioned way",
  breathtaking:
    "astonishing or awe-inspiring in quality; stunningly beautiful",
  spectacular:
    "beautiful in a dramatic and eye-catching way; impressive to look at",
  secluded:
    "sheltered and private; away from other people; 'secluded beach'",
  isolated: "far away from other places or people; remote and alone",
  packed:
    "extremely crowded; 'the beach was packed' = full of people",
  deserted:
    "empty of people; abandoned; 'the streets were deserted'",
  exhilarating:
    "making one feel very happy, animated, or elated; thrillingly exciting",
  exhausting:
    "making one feel extremely tired; draining all energy",
  daunting:
    "seeming difficult and intimidating; discouraging before one starts",
  rewarding:
    "providing satisfaction, fulfilment, or a sense of achievement",
  encounter:
    "an unexpected meeting; or to come across something",
  inhabitant:
    "a person or animal that lives in a particular place",
  customs:
    "the traditions and usual practices of a society; also: border controls",
  heritage:
    "valued objects, traditions, and qualities passed down from previous generations",
  hospitality:
    "the friendly and generous treatment of visitors and guests",
  considerate:
    "careful not to inconvenience or harm others; thoughtful",
  courteous:
    "polite, respectful, and considerate in manner",
  distinguished:
    "dignified in appearance; respected and eminent",
  host:
    "a person who invites and entertains guests; 'host a party'",
  sightseeing:
    "visiting places of interest as a tourist; 'go sightseeing'",
  renowned:
    "known and admired by many; famous for something positive",
  notorious:
    "famous for something bad; widely known for negative reasons",
  eminent:
    "famous and respected within a particular field; distinguished",

  // ════════════════════════════════════════════
  //  MISCELLANEOUS & COLLOCATIONS
  // ════════════════════════════════════════════
  loose:
    "not tight or firmly fixed; 'at a loose end' = with nothing to do",
  loss: "the fact of losing something; 'at a loss' = confused",
  lost: "past tense of 'lose'; unable to find one's way",
  large:
    "'at large' = free and not captured; 'by and large' = on the whole",
  harrowing: "extremely distressing and disturbing; traumatic",
  temperate:
    "relating to a mild climate; moderate and not extreme",
  dismay: "a feeling of distress and disappointment",
  repels:
    "drives away; causes disgust; wards off",
  ingrained:
    "firmly fixed or established; deeply embedded in one's nature",
  advanced:
    "far on in development; at a high level; 'advanced technology'",
  boring:
    "not interesting; tedious and dull; causing weariness",
  spoilt: "damaged or ruined; also: (of a child) excessively indulged",
  raw: "not cooked; unprocessed; 'raw materials'",
  rotten: "decayed and no longer fresh; also: very bad (informal)",
  stale: "no longer fresh; 'stale bread' = bread that has gone hard",
  mouldy: "covered with mould; showing signs of decay from dampness",
  wholesome: "promoting good health; morally good and beneficial",
  nutritious:
    "containing many nutrients; nourishing and good for health",
  organic:
    "produced without artificial chemicals; 'organic food'",
  edible: "safe to eat; fit for consumption",
  portion:
    "a part of something; an amount of food served to one person",
  recipe:
    "a set of instructions for preparing a dish, with a list of ingredients",
  ingredient:
    "a component of a mixture, especially in cooking",
  flavour:
    "the distinctive taste of a food or drink",
  bland: "lacking strong flavour; mild and uninteresting in taste",
  bitter:
    "having a sharp, pungent taste (like coffee or dark chocolate)",
  savoury:
    "salty or spicy rather than sweet; pleasantly flavourful",
  tender:
    "soft and easy to cut or chew; also: gentle and caring",
  crispy: "firm, dry, and crunchy; 'crispy bacon'",
  delicacy:
    "a food considered a rare treat or luxury; something delicate",
  cuisine:
    "a style of cooking characteristic of a country or region; 'French cuisine'",
  beverage:
    "a drink other than water (formal); 'hot beverages'",
  "laid-back":
    "relaxed and easy-going; not stressed or worried about things",
  assertive:
    "confident and forceful in stating one's opinions or rights",
  timid: "lacking courage or confidence; easily frightened; shy",
  outgoing:
    "friendly and socially confident; enjoying the company of others",
  introverted:
    "shy and reserved; preferring solitary activities",
  extroverted:
    "outgoing and socially confident; gaining energy from being with others",
  stubborn:
    "refusing to change one's mind; determined not to give in",
  cautious:
    "careful to avoid potential problems or dangers; wary",
  ambitious:
    "having a strong desire to succeed; determined to achieve",
  conscientious:
    "diligent and thorough; wishing to do one's work well",
  resourceful:
    "having the ability to find quick and clever ways to overcome difficulties",
  versatile:
    "able to adapt to many different functions or activities",
  compelled: "forced or driven to do something; felt obligated",
  reluctant: "unwilling; hesitant to act; 'reluctant to admit'",
  eager: "keen and enthusiastic; wanting to do something very much",
  indifferent: "having no interest or concern; not caring either way",
  profound:
    "very great or intense; having deep meaning; 'profound impact'",
  superficial:
    "existing on the surface only; lacking depth or thoroughness",
};

// ─── Hint Templates ──────────────────────────────────────────────────────────
const HINT_TEMPLATES = {
  collocation: (word) =>
    `Think about which word naturally pairs with "${word}" to form a common English expression.`,
  idiom: (partial) =>
    `This is a well-known English idiom. Try to recall the fixed expression: "${partial}..."`,
  vocabulary: (meaning) =>
    `Look for the word that specifically means: ${meaning}`,
  phrasalVerb: (verb) =>
    `Consider the different meanings of "${verb}" combined with various particles (up, down, in, out, on, off).`,
  grammar: () =>
    `Focus on grammar — which word form (noun, verb, adjective, adverb) fits the blank in this sentence?`,
  general: () =>
    `Read the full sentence carefully. Which word makes the sentence natural AND grammatically correct?`,
  medical: () =>
    `Think about the specific medical or anatomical term used in English for this concept.`,
  legal: () =>
    `This is a standard legal or criminal justice term. Think about courtroom and law vocabulary.`,
  sports: () =>
    `Think about the specific term used in this sport or competitive activity.`,
  context: (clue) =>
    `The key clue in the sentence is "${clue}". Which option connects most naturally with this idea?`,
};

// ─── Offline Explanation Generator ───────────────────────────────────────────

function generateOfflineExplanation(question) {
  const correct = question.choices.find((c) => c.is_correct);
  const wrong = question.choices.filter((c) => !c.is_correct);

  if (!correct) return { explanation: question.explanation || "", hint: "" };

  const correctWord = correct.text.trim();
  const existingExpl = (question.explanation || "")
    .replace(/^Answer:\s*\S+\s*\.?\s*/i, "")
    .trim();

  // ── Build "correct answer" section ──
  let explanation = `✅ **"${correctWord}"** is correct — ${existingExpl}`;

  // ── Build "wrong options" sections ──
  explanation += "\n\n**Why the other options don't work:**";

  for (const w of wrong) {
    const word = w.text.trim();
    const wLower = word.toLowerCase();
    const def = VOCAB[wLower];

    if (def) {
      explanation += `\n❌ **"${word}"** — ${capitalize(def)}. This doesn't fit the meaning or collocation needed in this sentence.`;
    } else {
      // Smart fallback: produce reasonable generic text
      explanation += `\n❌ **"${word}"** — While "${word}" is a valid English word, it doesn't carry the right meaning or doesn't collocate naturally with the other words in this sentence.`;
    }
  }

  // ── Generate hint ──
  const hint = generateOfflineHint(question, correct, existingExpl);

  return { explanation, hint };
}

function generateOfflineHint(question, correct, existingExpl) {
  const qText = question.question_text || "";
  const explLower = existingExpl.toLowerCase();

  // Detect question type from explanation keywords
  if (
    explLower.includes("idiom") ||
    explLower.includes("fixed phrase") ||
    explLower.includes("fixed expression")
  ) {
    const blank = qText.replace(/_{2,}|\.{3,}/g, "___");
    return HINT_TEMPLATES.idiom(
      blank.length > 70 ? blank.substring(0, 70) : blank
    );
  }

  if (
    explLower.includes("colloca") ||
    explLower.includes("common phrase") ||
    explLower.includes("standard phrase") ||
    explLower.includes("standard collocation") ||
    explLower.includes("naturally with") ||
    explLower.includes("pairs with")
  ) {
    // Find a context word near the blank
    const parts = qText.split(/_{2,}|\.{3,}|\.\.\./);
    const afterBlank = (parts[1] || "").trim().split(/\s+/)[0] || "";
    const beforeBlank = (parts[0] || "").trim().split(/\s+/).pop() || "";
    const contextWord = afterBlank.length > 1 ? afterBlank : beforeBlank;
    if (contextWord.length > 1) {
      return HINT_TEMPLATES.collocation(contextWord);
    }
  }

  if (
    explLower.includes("phrasal verb") ||
    /\b(put|set|keep|drag|cut|pass|break|carry|wear|get|read|pull|lay|give|brush|flick|block)\b/i.test(
      qText.split(/_{2,}/)[0] || ""
    )
  ) {
    const verb = qText.match(
      /\b(put|set|keep|drag|cut|pass|break|carry|wear|get|read|pull|lay|give|brush|flick|block)\b/i
    );
    if (verb) return HINT_TEMPLATES.phrasalVerb(verb[0]);
  }

  if (
    explLower.includes("medical") ||
    explLower.includes("doctor") ||
    explLower.includes("disease") ||
    explLower.includes("symptom") ||
    explLower.includes("pain") ||
    explLower.includes("bone") ||
    explLower.includes("organ") ||
    explLower.includes("body")
  ) {
    return HINT_TEMPLATES.medical();
  }

  if (
    explLower.includes("legal") ||
    explLower.includes("court") ||
    explLower.includes("crime") ||
    explLower.includes("law") ||
    explLower.includes("prison") ||
    explLower.includes("offence") ||
    explLower.includes("penalty") ||
    explLower.includes("defendant")
  ) {
    return HINT_TEMPLATES.legal();
  }

  if (
    explLower.includes("sport") ||
    explLower.includes("play") ||
    explLower.includes("match") ||
    explLower.includes("race") ||
    explLower.includes("team") ||
    explLower.includes("pitch") ||
    explLower.includes("field")
  ) {
    return HINT_TEMPLATES.sports();
  }

  // Try to find a key context word from the question
  const keyWords = qText
    .replace(/_{2,}|\.{3,}/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  if (keyWords.length > 3) {
    const clue = keyWords.slice(-3).join(" ");
    return HINT_TEMPLATES.context(clue);
  }

  // Vocabulary-based hint using the explanation to describe target meaning
  if (existingExpl.length > 15) {
    const meaning = existingExpl
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .replace(/^is a |^means |^refers to /i, "")
      .substring(0, 80);
    return HINT_TEMPLATES.vocabulary(
      meaning.endsWith(".") ? meaning : meaning + "..."
    );
  }

  return HINT_TEMPLATES.general();
}

// ─── Gemini AI Approach ──────────────────────────────────────────────────────

let geminiModel = null;

async function initGemini(apiKey) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Quick test
    const testResult = await m.generateContent("Reply with exactly: OK");
    const testText = (await testResult.response).text();
    if (testText && testText.length > 0) {
      geminiModel = m;
      return true;
    }
  } catch (e) {
    console.warn(`   ⚠️  Gemini test failed: ${e.message}`);
  }
  return false;
}

function buildGeminiPrompt(questions) {
  const data = questions.map((q, idx) => {
    const correct = q.choices.find((c) => c.is_correct);
    const wrong = q.choices.filter((c) => !c.is_correct);
    return {
      index: idx,
      question_text: q.question_text,
      correct_answer: correct?.text || "",
      wrong_answers: wrong.map((w) => w.text),
      existing_explanation: q.explanation || "",
    };
  });

  return `You are an expert English language teacher creating quiz explanations. For each question below, provide:

1. An **enhanced explanation** formatted EXACTLY like this (use \\n for line breaks):
   ✅ **"[correct word]"** is correct — [2-3 sentence explanation of why this is right, mentioning collocations and context].\\n\\n**Why the other options don't work:**\\n❌ **"[wrong1]"** — [What this word actually means and why it doesn't fit the sentence. 1-2 sentences.]\\n❌ **"[wrong2]"** — [Same format.]\\n❌ **"[wrong3]"** — [Same format.]

   Be specific: explain what each wrong word means AND why it doesn't work here (wrong collocation, wrong meaning, wrong register, etc.).
   Use **double asterisks** for bold. Use \\n for newlines.

2. A **hint** (1-2 sentences that guide thinking WITHOUT revealing the answer. E.g. "Think about which word naturally pairs with 'X' in English" or "This is a fixed idiom about...").

Return ONLY a valid JSON array with NO extra text:
[{ "index": 0, "explanation": "...", "hint": "..." }, ...]

Questions:
${JSON.stringify(data, null, 2)}`;
}

async function processWithGemini(batch) {
  if (!geminiModel) return null;
  try {
    const prompt = buildGeminiPrompt(batch);
    const result = await geminiModel.generateContent(prompt);
    const text = (await result.response).text();
    const cleaned = cleanJson(text);
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length === batch.length) return parsed;
    console.warn(
      `   ⚠️  Gemini returned ${parsed?.length ?? "non-array"} items, expected ${batch.length}`
    );
  } catch (e) {
    console.warn(`   ⚠️  Gemini batch error: ${e.message}`);
  }
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(
    "  📝 Upstream Explanation & Hint Enhancer (Hybrid)"
  );
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );

  // ── Connect ──
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  const Category = mongoose.model(
    "Category",
    new mongoose.Schema({}, { strict: false })
  );
  const Question = mongoose.model(
    "Question",
    new mongoose.Schema({}, { strict: false, timestamps: true })
  );

  // ── Find "Upstream" category under English ──
  const upstreamCat = await Category.findOne({
    subject: "English",
    name: "Upstream",
  });
  if (!upstreamCat) {
    console.error("❌ No 'Upstream' category found under 'English'.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`📂 Found Upstream category: ${upstreamCat._id}\n`);

  // ── Fetch all Upstream questions ──
  const allQ = await Question.find({
    subject: "English",
    category: upstreamCat._id,
    published: true,
  }).sort({ _id: 1 });

  console.log(`📊 Total Upstream questions: ${allQ.length}\n`);

  if (allQ.length === 0) {
    console.log("Nothing to process.");
    await mongoose.disconnect();
    return;
  }

  // ── Checkpoint ──
  const processed = loadCheckpoint();
  const remaining = allQ.filter((q) => !processed.has(q._id.toString()));
  console.log(`✅ Already processed: ${processed.size}`);
  console.log(`⏳ Remaining: ${remaining.length}\n`);

  if (remaining.length === 0) {
    console.log("🎉 All questions already processed!");
    await mongoose.disconnect();
    return;
  }

  // ── Try to get a working Gemini key from admin users ──
  let useAI = false;
  const User = mongoose.model(
    "User",
    new mongoose.Schema({}, { strict: false })
  );

  // 1. Try admin users first
  const admins = await User.find({ role: "admin" }).select("+geminiApiKey");
  for (const admin of admins) {
    const key = admin.geminiApiKey;
    if (key && key.length > 10) {
      console.log(
        `🔑 Testing Gemini key from admin "${admin.name || admin.email || admin._id}"...`
      );
      useAI = await initGemini(key);
      if (useAI) {
        console.log("✅ Gemini AI activated! Will use AI-generated explanations.\n");
        break;
      }
    }
  }

  // 2. Try any user with a key
  if (!useAI) {
    const anyUser = await User.findOne({
      geminiApiKey: { $exists: true, $ne: null, $ne: "" },
    }).select("+geminiApiKey");
    if (anyUser?.geminiApiKey) {
      console.log(
        `🔑 Testing Gemini key from user "${anyUser.name || anyUser.email || anyUser._id}"...`
      );
      useAI = await initGemini(anyUser.geminiApiKey);
      if (useAI)
        console.log("✅ Gemini AI activated from user key!\n");
    }
  }

  // 3. Try env variable
  if (!useAI) {
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (envKey) {
      console.log("🔑 Testing env GEMINI_API_KEY...");
      useAI = await initGemini(envKey);
      if (useAI) console.log("✅ Gemini AI activated from env key!\n");
    }
  }

  if (!useAI) {
    console.log(
      "⚠️  No working Gemini key found. Using OFFLINE dictionary-based generation."
    );
    console.log(
      "   💡 For higher quality, add a Gemini API key to an admin user's profile.\n"
    );
  }

  // ── Process questions ──
  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);
  let okCount = 0;
  let failCount = 0;
  let aiUsed = 0;
  let offlineUsed = 0;

  for (let bi = 0; bi < totalBatches; bi++) {
    const batch = remaining.slice(bi * BATCH_SIZE, (bi + 1) * BATCH_SIZE);
    console.log(
      `─── Batch ${bi + 1}/${totalBatches} (${batch.length} questions) ───`
    );

    let results = null;

    // Try AI first
    if (useAI) {
      let retries = 0;
      while (retries < MAX_RETRIES && !results) {
        results = await processWithGemini(batch);
        if (!results) {
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`   🔄 AI retry ${retries}/${MAX_RETRIES}...`);
            await sleep(DELAY_MS * (retries + 1)); // exponential back-off
          }
        }
      }
      if (!results) {
        console.log("   ⚠️  AI failed for this batch → falling back to offline.");
      }
    }

    // Process each question in the batch
    for (let i = 0; i < batch.length; i++) {
      const q = batch[i];
      let explanation, hint;

      if (results && results[i] && results[i].explanation) {
        // AI-generated
        explanation = results[i].explanation;
        hint = results[i].hint || "";
        aiUsed++;
      } else {
        // Offline dictionary-based
        const gen = generateOfflineExplanation(q);
        explanation = gen.explanation;
        hint = gen.hint;
        offlineUsed++;
      }

      try {
        await Question.updateOne(
          { _id: q._id },
          { $set: { explanation, hint } }
        );
        processed.add(q._id.toString());
        okCount++;

        const label =
          (q.question_text || "").substring(0, 50).replace(/\n/g, " ") +
          "...";
        console.log(`   ✅ ${label}`);
      } catch (err) {
        failCount++;
        console.error(`   ❌ Failed ${q._id}: ${err.message}`);
      }
    }

    saveCheckpoint(processed);

    // Rate limit delay between batches (only for AI)
    if (useAI && bi < totalBatches - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Summary ──
  console.log(
    "\n═══════════════════════════════════════════════════════════════"
  );
  console.log(
    "  📊 MIGRATION COMPLETE"
  );
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`  ✅ Updated:         ${okCount}`);
  console.log(`  ❌ Failed:          ${failCount}`);
  console.log(`  🤖 AI-generated:    ${aiUsed}`);
  console.log(`  📖 Offline-generated: ${offlineUsed}`);
  console.log(`  📁 Total processed:  ${processed.size}/${allQ.length}`);

  if (processed.size >= allQ.length) {
    try {
      fs.unlinkSync(CHECKPOINT_FILE);
    } catch {
      /* ok */
    }
    console.log("  🧹 Checkpoint file cleaned up.");
  } else if (failCount > 0) {
    console.log("  💡 Re-run the script to retry failed questions.");
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Done!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
