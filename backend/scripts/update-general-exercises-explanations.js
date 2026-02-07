/**
 * update-general-exercises-explanations.js
 *
 * Hybrid migration script that enhances ALL General Exercises (English)
 * question explanations and adds static hints.
 *
 * Uses the same strategy as the Upstream enhancer:
 *   1. Try to find a working Gemini API key from admin users in the DB
 *   2. If a key works → use Gemini to generate rich explanations & hints
 *   3. If no key works → fall back to comprehensive offline dictionary
 *
 * Usage:
 *   cd backend
 *   node scripts/update-general-exercises-explanations.js
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
const CHECKPOINT_FILE = join(__dirname, ".general-exercises-update-progress.json");

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
// Covers words found in General Exercises volumes 1-4 (400+ questions)
const VOCAB = {
  // ════════════════════════════════════════════
  //  GENERAL & ACADEMIC VOCABULARY
  // ════════════════════════════════════════════
  procrastination: "the act of delaying or postponing tasks unnecessarily",
  challenges: "demanding tasks or situations that test one's abilities",
  contamination: "the process of making something impure by exposure to pollutants",
  perseverance: "continued effort and determination despite difficulties",
  objective: "a specific goal or target one aims to achieve",
  resolution: "a firm decision to do something, or a formal group decision",
  decision: "a choice or conclusion reached after consideration",
  desire: "a strong personal wish or longing for something",
  revolution: "a dramatic wide-reaching change, or an overthrow of a system",
  innovation: "a new method, idea, or invention",
  novelty: "the quality of being new or unusual; also a small toy or gadget",
  breakthrough: "an important discovery or development that removes a barrier",
  past: "the time before the present; earlier events",
  history: "the study of past events; also a personal record or background",
  background: "a person's social, educational, or financial circumstances",
  precedent: "an earlier event that serves as an example or guide",
  upbeat: "cheerful and optimistic (informal)",
  optimistic: "hopeful and confident about the future",
  positive: "constructive, favourable, or affirming",
  cheerful: "noticeably happy and bright in mood",
  mind: "the element of a person that thinks, reasons, and feels",
  thought: "an idea or opinion produced by thinking",
  spirit: "a person's prevailing mood or attitude; the drive to compete",
  soul: "the spiritual or emotional part of a person; deep inner feeling",
  direct: "going straight without deviation; frank and clear",
  precise: "exact, accurate, clearly defined",
  right: "correct; also an intensifier meaning 'exactly'",
  exact: "not approximated; totally precise",
  degree: "a unit of measurement; the extent or level of something",
  variance: "the amount of difference or change from a standard",
  scale: "the relative size or extent of something",
  range: "the scope or variety of something; a wide range = a large variety",
  remote: "far away geographically; having little connection",
  distant: "far away in space or time; not closely related or connected",
  slight: "small in degree; not thorough or significant",
  allot: "distribute or give a share of something to people or purposes",
  assign: "allocate a task, duty, or role to someone",
  entrust: "give someone the responsibility or care of something valuable",
  delegate: "assign tasks to others; give someone authority to act on your behalf",
  morals: "standards of behaviour; principles of right and wrong",
  values: "principles or standards considered worthwhile or important",
  rights: "legal or moral entitlements",
  ethics: "moral principles governing behaviour; Business Ethics is a standard field",
  aim: "a purpose or intention; the act of pointing or directing",
  object: "a material thing; also a purpose or goal (formal)",
  purpose: "the reason something is done; for the purpose of = in order to",
  intention: "a plan or aim that one intends to carry out",
  condition: "a requirement; on condition that = only if",
  term: "a word or phrase with a specific meaning; or a period of time",
  rule: "an established regulation or principle governing conduct",
  decree: "an official order issued by a legal authority or ruler",
  youth: "the period of being young; or young people collectively",
  adolescents: "teenagers; people between childhood and adulthood",
  teenagers: "people aged 13-19",
  addition: "something added; a valuable addition = a useful new member",
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
  seize: "to take hold of suddenly and firmly; seize an opportunity is standard",
  state: "the condition of something; or a nation/political entity",
  form: "shape or structure; condition ('in good form' = performing well)",
  shape: "the outline or form of something; in good shape = in good condition",
  translation: "converting text from one language to another",
  execution: "carrying out a plan or task; also the carrying out of a death sentence",
  rendition: "a performance or interpretation of a song or piece of music",
  edition: "a particular version or release of a publication",
  // ════════════════════════════════════════════
  //  GENERAL EXERCISES SPECIFIC VOCABULARY
  // ════════════════════════════════════════════
  repercussions: "unintended consequences of an action or decision",
  phenomenally: "to an extraordinary or remarkable degree (adverb)",
  phenomenal: "extraordinary; remarkably great",
  phenomena: "observable events or occurrences (plural of phenomenon)",
  phenomenon: "a remarkable event or occurrence",
  convincing: "persuasive; capable of making someone believe something",
  conviction: "a strong belief; or a finding of guilt in a criminal case",
  convinced: "feeling certain; persuaded that something is true",
  convince: "to persuade someone to believe or do something",
  disconcerting: "unsettling or disturbing; causing unease",
  satisfactory: "meeting expectations; adequate but not outstanding",
  neutral: "not taking sides; impartial",
  insignificant: "too small or unimportant to be worth consideration",
  strenuous: "requiring or using great effort and energy",
  priceless: "extremely valuable; beyond any price",
  notorious: "famous for something bad; widely known for negative reasons",
  simultaneous: "occurring at the same time",
  recuperate: "recover from illness, exhaustion, or a setback",
  insomnia: "habitual inability to sleep; a sleep disorder",
  amnesia: "partial or total loss of memory",
  mania: "an obsession or abnormally intense enthusiasm",
  inertia: "tendency to remain unchanged; resistance to motion or activity",
  prevailed: "proved more powerful; triumphed or became widespread",
  retailed: "sold goods directly to consumers",
  revealed: "made known; disclosed information previously hidden",
  published: "made content available to the public, especially in print",
  chaos: "complete disorder and confusion",
  priorities: "things regarded as more important than others",
  depositories: "places where things are stored for safekeeping",
  stratagems: "clever plans or tactics designed to achieve an advantage",
  requirements: "necessary conditions; things that are needed",
  apprehensive: "anxious or fearful about a future event",
  comprehensive: "complete and thorough; including all elements",
  reprehensive: "deserving blame or criticism (reprehensible)",
  extensive: "covering a large area; wide-ranging",
  contagious: "spread by contact; describing a disease that can be transmitted",
  indigenous: "native to a particular region or environment",
  ingenious: "clever, original, and inventive",
  contaminated: "made impure or poisonous by pollutants",
  acquitted: "declared not guilty of a criminal charge",
  acquired: "obtained or gained possession of something",
  inquired: "asked for information; made an investigation",
  accentuated: "made more noticeable or prominent",
  compel: "force or oblige someone to do something",
  comply: "act in accordance with a wish or command",
  compact: "closely and firmly packed together; small but complete",
  confess: "admit to a wrongdoing; declare one's sins",
  dispelled: "made a doubt or feeling disappear; drove away",
  repelled: "drove back an attacker; caused disgust",
  discarded: "thrown away; got rid of as no longer useful",
  disarmed: "took weapons away from; charmed or won over",
  reinforcement: "additional support or strengthening; backup troops",
  settlement: "an official agreement to resolve a dispute; a place where people live",
  recruitment: "the process of enlisting new members or employees",
  integrity: "the quality of being honest and having strong moral principles",
  integration: "combining parts into a unified whole",
  rumors: "unverified stories circulated among people; gossip",
  scandals: "actions or events regarded as morally wrong and causing outrage",
  lucrative: "producing a great deal of profit; financially rewarding",
  luxurious: "extremely comfortable and elegant; lavish",
  wealthy: "having a great deal of money or assets; rich",
  depressed: "very unhappy; suffering from depression; economically stagnant",
  conscientious: "diligent and careful; wishing to do what is right",
  conscious: "aware of and responding to one's surroundings",
  conscience: "an inner feeling of right and wrong; moral sense",
  conspicuous: "standing out; clearly visible or attracting attention",
  anonymous: "without a name; of unknown identity",
  unanimous: "fully agreed upon by everyone",
  anomalous: "deviating from what is standard or expected; irregular",
  synonymous: "having the same meaning; closely associated with",
  surveillance: "close observation, especially of a suspected criminal",
  survey: "a general view or examination; a questionnaire-based study",
  survival: "the state of continuing to live or exist, often in difficult conditions",
  supervision: "oversight and direction of an activity or person",
  devastating: "highly destructive or damaging",
  renowned: "known or talked about by many people; famous",
  celebrated: "greatly admired; famous and praised",
  aroused: "evoked or awakened a feeling or response",
  raised: "lifted up; brought up (children); increased (an amount)",
  arose: "came into being; emerged (past tense of arise)",
  rose: "moved upward; increased (past tense of rise — intransitive)",
  baffling: "impossible to understand; perplexing",
  puzzling: "causing confusion; difficult to understand",
  perplexing: "very confusing and bewildering",
  inquisitive: "curious; eager to know or learn something",
  bridge: "to connect or reduce the distance between; an arched structure over water",
  committed: "dedicated; pledged to a course of action or relationship",
  truants: "students who stay away from school without permission",
  boost: "help or encourage to increase or improve",
  boast: "talk about oneself with excessive pride; brag",
  diagnosis: "the identification of a disease or problem through examination",
  hypothesis: "a proposed explanation made on the basis of limited evidence",
  hepatitis: "inflammation of the liver (a medical condition)",
  acupuncture: "a treatment using thin needles inserted into the body at specific points",
  puncture: "a small hole made by a sharp object",
  biofeedback: "a technique using monitoring to gain control over bodily functions",
  infrastructure: "basic physical structures needed for society to function",
  distinctive: "uniquely characteristic; serving to distinguish from others",
  appreciative: "feeling or showing gratitude or pleasure",
  vindictive: "having a strong desire for revenge; spiteful",
  informative: "providing useful or interesting information",
  assess: "evaluate or estimate the nature, ability, or quality of something",
  process: "a series of actions to achieve a result; to deal with methodically",
  assassinate: "murder an important person, usually for political reasons",
  compress: "flatten by pressure; make more compact",
  conceal: "hide or keep secret; prevent from being seen",
  declare: "state officially; announce formally",
  install: "place or set up equipment for use",
  instill: "gradually establish an idea or attitude in a person's mind",
  spacious: "having ample room; large and comfortable",
  auspicious: "favourable; indicating a good chance of success",
  pernicious: "having a harmful effect, especially gradually",
  disposal: "the action of getting rid of something; the state of being available",
  proposal: "a plan or suggestion put forward for consideration",
  colossal: "extremely large; immense",
  denial: "a refusal to accept or believe something",
  boast: "talk about oneself with excessive pride; brag",
  enthusiastic: "showing intense interest and enjoyment",
  keen: "eager or enthusiastic; having a sharp edge or mind",
  impressed: "feeling admiration as a result of perceiving something remarkable",
  impressive: "evoking admiration through size, quality, or skill",
  fare: "the price paid for a journey on public transport",
  fees: "payments made for professional services",
  fair: "treating people equally; a public event with entertainment",
  works: "literary or artistic productions; the output of a creator",
  career: "an occupation or profession, especially one requiring training",
  detected: "discovered or identified the presence of something",
  deduced: "arrived at a conclusion by reasoning from evidence",
  predicted: "stated that something will happen in the future",
  conducted: "organized and carried out; directed an orchestra or experiment",
  dedicated: "devoted time and effort to a particular purpose or cause",
  indicated: "pointed out or showed; suggested",
  confiscated: "officially seized property, especially as a penalty",
  authenticated: "proved or shown to be genuine or valid",
  oars: "long poles with flat blades used for rowing boats",
  ores: "rocks or minerals from which metal can be extracted",
  deliberately: "intentionally; on purpose; in a careful and unhurried way",
  accidentally: "by chance; without intention",
  remarkably: "in a notably surprising way",
  contestants: "people who compete in a contest or competition",
  participations: "not standard — 'participants' means people who take part",
  contaminants: "substances that make something impure; pollutants",
  pollutants: "harmful substances introduced into the environment",
  fallacy: "a mistaken belief; a flawed reasoning",
  fiction: "literature describing imaginary events; something untrue",
  debate: "a formal discussion or argument on a particular topic",
  debt: "money owed to another party",
  debit: "an entry recording money owed or taken from an account",
  bait: "food used to entice fish or animals; something used to lure",
  // ════════════════════════════════════════════
  //  GRAMMAR-RELATED TERMS
  // ════════════════════════════════════════════
  reluctant: "unwilling; hesitant; not eager to do something",
  reluctance: "unwillingness or hesitancy (noun form)",
  flexible: "able to bend easily; willing to change or adapt",
  obedient: "willing to comply with orders or requests; dutiful",
  // ════════════════════════════════════════════
  //  ADDITIONAL GENERAL EXERCISES VOCABULARY
  // ════════════════════════════════════════════
  prominent: "important or well-known; standing out; noticeable",
  stagnant: "not flowing or moving; showing no activity or development",
  ineffective: "not producing any significant result",
  inefficient: "not achieving maximum productivity; wasteful",
  swarm: "a large group of insects (especially bees) moving together",
  beehive: "a structure where bees live and make honey",
  nectar: "sweet liquid produced by flowers, collected by bees",
  reputation: "the opinion that people have about someone or something",
  repetition: "the act of repeating something; doing or saying again",
  salutation: "a greeting; an expression of goodwill at the start of a letter",
  fame: "the state of being widely known; renown",
  indigenous: "native to a region; originating naturally in a particular place",
  dispelled: "made a doubt, fear, or belief disappear completely",
  absurd: "wildly unreasonable or illogical; ridiculous",
  outrageous: "shockingly bad or excessive; beyond acceptable limits",
  ridiculous: "deserving or inviting mockery; extremely silly",
  preposterous: "contrary to reason or common sense; utterly absurd",
  legitimate: "conforming to the law or to rules; justifiable",
  lawful: "conforming to, permitted by, or recognized by law",
  valid: "having a sound basis in logic or fact; legally acceptable",
  sustainable: "able to be maintained at a certain rate or level over time",
  renewable: "able to be renewed; (of resources) not depleted when used",
  conventional: "based on traditional practices; standard and customary",
  substantial: "of considerable importance, size, or worth",
  supplement: "something added to complete or enhance a whole",
  complement: "something that completes or goes well with something",
  implement: "to put into effect; carry out; execute a plan",
  fulfil: "to accomplish or carry out something; to meet a requirement",
  emerge: "to come into view or existence; to become apparent",
  immerse: "to dip or plunge something in liquid; to involve deeply",
  submerge: "to go or cause to go under water; to overwhelm",
  retrieve: "to get back; to recover; to find and bring back",
  consecutive: "following continuously; in unbroken succession",
  concurrent: "existing or happening at the same time",
  subsequent: "coming after something in time; following",
  preceding: "coming before something in time or order",
  diligent: "having or showing care and effort in one's work",
  resilient: "able to recover quickly from difficult conditions",
  persistent: "continuing firmly despite difficulty or opposition",
  consistent: "unchanging; acting in the same way over time",
  audacity: "bold or daring behaviour; willingness to take risks",
  tenacity: "the quality of being very determined; persistence",
  capacity: "the maximum amount something can contain; ability",
  velocity: "the speed of something in a given direction",
  contemplate: "look at thoughtfully; think deeply about",
  compensate: "give something to make up for a loss or injury",
  collaborate: "work jointly on an activity or project",
  deteriorate: "become progressively worse in condition",
  alleviate: "make suffering or a problem less severe; relieve",
  elaborate: "detailed and complicated; to develop in more detail",
  accumulate: "gather or acquire an increasing amount of something",
  interrogate: "ask questions of someone closely or aggressively",
  // ════════════════════════════════════════════
  //  PHRASAL VERBS & PREPOSITIONS
  // ════════════════════════════════════════════
  on: "preposition indicating contact, continuation, or position",
  for: "preposition indicating purpose, benefit, or duration",
  with: "preposition indicating accompaniment or instrument",
  at: "preposition indicating a specific point or location",
  out: "away from; used in phrasal verbs (e.g. carry out = perform)",
  off: "away from; used in phrasal verbs (e.g. put off = postpone)",
  up: "to a higher position; used in phrasal verbs (e.g. keep up = maintain pace)",
  down: "to a lower position; used in phrasal verbs (e.g. break down = stop functioning)",
  away: "to a distance; used in phrasal verbs (e.g. give away = donate)",
  through: "from one side to the other; used in phrasal verbs (e.g. go through = experience)",
  forward: "in the direction ahead; used in phrasal verbs (e.g. look forward to = anticipate)",
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
  tense: () =>
    `Focus on the time expression and other tense clues in the sentence to determine the correct verb form.`,
  wordForm: () =>
    `Look at the position of the blank in the sentence — is it asking for a noun, verb, adjective, or adverb?`,
  synonym: () =>
    `The question asks for a synonym. Think about which word has the closest meaning to the given word.`,
  antonym: () =>
    `The question asks for an antonym (opposite). Think about which word has the opposite meaning.`,
  conditional: () =>
    `This is a conditional sentence. Pay attention to which conditional type (zero, first, second, or third) is being used.`,
  modal: () =>
    `Think about which modal verb expresses the right degree of obligation, ability, or possibility here.`,
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

  // Detect synonym/antonym questions
  if (qText.toLowerCase().includes("synonym")) {
    return HINT_TEMPLATES.synonym();
  }
  if (qText.toLowerCase().includes("antonym") || qText.toLowerCase().includes("opposite")) {
    return HINT_TEMPLATES.antonym();
  }

  // Detect grammar/tense questions
  if (
    explLower.includes("tense") ||
    explLower.includes("past perfect") ||
    explLower.includes("past continuous") ||
    explLower.includes("present continuous") ||
    explLower.includes("simple present") ||
    explLower.includes("future") ||
    explLower.includes("subjunctive") ||
    explLower.includes("conditional")
  ) {
    return HINT_TEMPLATES.tense();
  }

  // Detect modal verb questions
  if (
    explLower.includes("modal") ||
    explLower.includes("needn't") ||
    explLower.includes("must") ||
    explLower.includes("should") ||
    explLower.includes("might") ||
    explLower.includes("could have")
  ) {
    return HINT_TEMPLATES.modal();
  }

  // Detect conditional questions
  if (
    explLower.includes("conditional") ||
    explLower.includes("inverted") ||
    qText.toLowerCase().includes("had he known") ||
    qText.toLowerCase().includes("should she")
  ) {
    return HINT_TEMPLATES.conditional();
  }

  // Detect word form questions
  if (
    explLower.includes("adverb") ||
    explLower.includes("adjective") ||
    explLower.includes("noun form") ||
    explLower.includes("verb form") ||
    explLower.includes("word form")
  ) {
    return HINT_TEMPLATES.wordForm();
  }

  // Detect idiom questions
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

  // Detect collocation questions
  if (
    explLower.includes("colloca") ||
    explLower.includes("common phrase") ||
    explLower.includes("correct collocation") ||
    explLower.includes("correct preposition") ||
    explLower.includes("naturally with") ||
    explLower.includes("pairs with")
  ) {
    const parts = qText.split(/_{2,}|\.{3,}|\.\.\./);
    const afterBlank = (parts[1] || "").trim().split(/\s+/)[0] || "";
    const beforeBlank = (parts[0] || "").trim().split(/\s+/).pop() || "";
    const contextWord = afterBlank.length > 1 ? afterBlank : beforeBlank;
    if (contextWord.length > 1) {
      return HINT_TEMPLATES.collocation(contextWord);
    }
  }

  // Detect phrasal verb questions
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

  // Medical/legal/sports categories
  if (
    explLower.includes("medical") || explLower.includes("disease") ||
    explLower.includes("treatment") || explLower.includes("sleep disorder")
  ) {
    return HINT_TEMPLATES.medical();
  }
  if (
    explLower.includes("legal") || explLower.includes("court") ||
    explLower.includes("guilty") || explLower.includes("crime")
  ) {
    return HINT_TEMPLATES.legal();
  }

  // Context-based hint using key words
  const keyWords = qText
    .replace(/_{2,}|\.{3,}/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  if (keyWords.length > 3) {
    const clue = keyWords.slice(-3).join(" ");
    return HINT_TEMPLATES.context(clue);
  }

  // Vocabulary-based hint using the explanation
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

2. A **hint** (1-2 sentences that guide thinking WITHOUT revealing the answer. E.g. "Think about which word naturally pairs with 'X' in English" or "This is about grammar — consider which tense is needed").

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
    "  📝 General Exercises Explanation & Hint Enhancer (Hybrid)"
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
  const User = mongoose.model(
    "User",
    new mongoose.Schema({}, { strict: false })
  );

  // ── Find "General Exercises" category under English ──
  const genExCat = await Category.findOne({
    subject: "English",
    name: "General Exercises",
  });
  if (!genExCat) {
    console.error("❌ No 'General Exercises' category found under 'English'.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`📂 Found General Exercises category: ${genExCat._id}\n`);

  // ── Fetch all General Exercises questions ──
  const allQ = await Question.find({
    subject: "English",
    category: genExCat._id,
    published: true,
  }).sort({ _id: 1 });

  console.log(`📊 Total General Exercises questions: ${allQ.length}\n`);

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

  // ── Try to activate Gemini ──
  let useAI = false;

  // 1. Try admin users with API keys
  const admins = await User.find({ role: "admin" }).select("+geminiApiKey");
  for (const admin of admins) {
    if (admin.geminiApiKey) {
      console.log(
        `🔑 Testing Gemini key from admin "${admin.name || admin.email || admin._id}"...`
      );
      useAI = await initGemini(admin.geminiApiKey);
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
            await sleep(DELAY_MS * (retries + 1));
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
        explanation = results[i].explanation;
        hint = results[i].hint || "";
        aiUsed++;
      } else {
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
  console.log(`  ✅ Updated:           ${okCount}`);
  console.log(`  ❌ Failed:            ${failCount}`);
  console.log(`  🤖 AI-generated:      ${aiUsed}`);
  console.log(`  📖 Offline-generated: ${offlineUsed}`);
  console.log(`  📁 Total processed:   ${processed.size}/${allQ.length}`);

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
