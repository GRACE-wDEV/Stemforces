import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const extra = [
  { num: 101, text: "Losing weight is a great way to ______ your confidence.", options: ["boost", "push", "shape", "foster"], correct: 0, explanation: "Boost confidence = increase it." },
  { num: 102, text: "The number ______ you can get out of these figures is in the millions.", options: ["complications", "permutations", "transformations", "incarnations"], correct: 1, explanation: "Permutations = different possible arrangements." },
  { num: 103, text: "Having to travel so far to work and back every day is beginning to wear me ______.", options: ["off", "through", "down", "in"], correct: 2, explanation: "Wear someone down = make tired/discouraged." },
  { num: 104, text: "Even though it started to rain, Pete carried ______ watering the garden.", options: ["through", "in", "over", "on"], correct: 3, explanation: "Carried on = continued." },
  { num: 105, text: "Even though Joe tries to be nice, he always rubs me up the wrong ______.", options: ["side", "way", "end", "time"], correct: 1, explanation: "Rubs me up the wrong way = irritates me." },
  { num: 106, text: "I was thinking of going out tonight, but on ______ thoughts, it might be better to stay in.", options: ["stronger", "second", "better", "deeper"], correct: 1, explanation: "On second thoughts = after reconsidering." },
  { num: 107, text: "John's face was ______ when he heard he had won first prize.", options: ["glistening", "glaring", "beaming", "flashing"], correct: 2, explanation: "Beaming = smiling brightly." },
  { num: 108, text: "Rob ______ so good an impression at the interview that they offered him the job on the spot.", options: ["made", "passed", "sent", "offered"], correct: 0, explanation: "Make an impression = create an effect." },
  { num: 109, text: "Although he wasn't the star of the film, Keanu Reeves ______ the show.", options: ["took", "robbed", "grabbed", "stole"], correct: 3, explanation: "Stole the show = attracted the most attention." },
  { num: 110, text: "My boss expects his instructions to be carried ______ to the letter.", options: ["out", "in", "off", "down"], correct: 0, explanation: "Carried out to the letter = followed exactly." },
  { num: 111, text: "As the day wore ______, I began to feel more and more uncomfortable in their company.", options: ["out", "on", "off", "down"], correct: 1, explanation: "Wore on = passed gradually." },
  { num: 112, text: "My parents have always disapproved ______ my friends.", options: ["out", "on", "of", "off"], correct: 2, explanation: "Disapprove of = not approve." },
  { num: 113, text: "I felt ashamed ______ myself for losing my temper like that over nothing.", options: ["from", "on", "of", "off"], correct: 2, explanation: "Ashamed of = feeling shame about." },
  { num: 114, text: "Ann isn't very keen ______ camping; she prefers staying in hotels.", options: ["at", "on", "in", "about"], correct: 1, explanation: "Keen on = interested in." },
  { num: 115, text: "Lorna never benefited ______ her parents' wealth; she's always had to work for a living.", options: ["at", "on", "in", "from"], correct: 3, explanation: "Benefit from = gain advantage from." },
  { num: 116, text: "I wasn't involved ______ the argument, so I have no idea what it was about.", options: ["at", "on", "in", "of"], correct: 2, explanation: "Involved in = take part in." },
  { num: 117, text: "Joanne's diet consists ______ junk food and fizzy drinks; no wonder she's overweight.", options: ["at", "of", "off", "from"], correct: 1, explanation: "Consist of = be made up of." },
  { num: 118, text: "I strongly object ______ being forced to pay for carrier bags in supermarkets.", options: ["at", "to", "into", "towards"], correct: 1, explanation: "Object to = oppose." },
  { num: 119, text: "The airline compensated us in full ______ the loss of our luggage.", options: ["about", "with", "for", "towards"], correct: 2, explanation: "Compensate for = pay/make up for." },
  { num: 120, text: "At last, a 5-0 victory gives England's supporters something to ______ about.", options: ["shout", "scream", "roar", "moan"], correct: 0, explanation: "Shout about = boast/talk proudly about." },
  { num: 121, text: "She was feeling on top of the ______ when she got the first prize.", options: ["mountain", "cliff", "world", "hill"], correct: 2, explanation: "On top of the world = extremely happy." },
  { num: 122, text: '"Was Helen pleased about getting that job?" "Pleased? She was on cloud ______!"', options: ["six", "seven", "eight", "nine"], correct: 3, explanation: "On cloud nine = extremely happy." },
  { num: 123, text: 'The new president was greeted by an ______ crowd.', options: ["static", "ecstatic", "exterior", "eccentric"], correct: 1, explanation: "Ecstatic = extremely happy/excited." },
  { num: 124, text: 'They were ______ with grief when their baby died.', options: ["overwhelmed", "overloaded", "overacted", "overrated"], correct: 0, explanation: "Overwhelmed with grief = extremely sad." },
  { num: 125, text: 'He\'s trying to ______ memories of the accident.', options: ["find out", "set out", "block out", "give out"], correct: 2, explanation: "Block out = try not to remember." },
  { num: 126, text: "His economic policies have won widespread ______ for reducing government debt.", options: ["maze", "pride", "freeze", "praise"], correct: 3, explanation: "Won widespread praise = received approval." },
  { num: 127, text: "Those children are well ______.", options: ["disciplined", "displayed", "disqualified", "disorganised"], correct: 0, explanation: "Well-disciplined = behave well." },
  { num: 128, text: "The letters had been placed in ______ piles, one for each letter of the alphabet.", options: ["disorganised", "organized", "disciplined", "organic"], correct: 1, explanation: "Organized piles = arranged systematically." },
  { num: 129, text: "There are tests which can establish a baby's genetic ______.", options: ["tournament", "endowment", "indemnity", "endurance"], correct: 1, explanation: "Genetic endowment = inherited traits." },
  { num: 130, text: "He's ______ about money.", options: ["possessive", "processing", "obsessive", "obstetric"], correct: 2, explanation: "Obsessive about = overly concerned." },
  { num: 131, text: "The latest promotional material is all part of a recruitment ______.", options: ["drive", "derive", "deprive", "driving"], correct: 0, explanation: "Recruitment drive = effort to hire." },
  { num: 132, text: "The education director is ______ in his attempt to obtain additional funding for the school.", options: ["prescribing", "persecuting", "personalizing", "persevering"], correct: 3, explanation: "Persevering = continuing despite difficulty." },
  { num: 133, text: "The aim of the association is to ______ the skills of traditional furniture design.", options: ["propel", "perpetuate", "perplex", "persevere"], correct: 1, explanation: "Perpetuate = keep alive." },
  { num: 134, text: "I'll never get all this work done in a week - I'm not ______!", options: ["human", "humane", "humanitarian", "superhuman"], correct: 3, explanation: "Not superhuman = can't do impossible." },
  { num: 135, text: "It is a group providing ______ for STEM students.", options: ["self-help", "self-assembly", "self-absorption", "self-awareness"], correct: 0, explanation: "Self-help = support to improve oneself." },
  { num: 136, text: "Since the recent improvements to the service, the buses are running like ______.", options: ["clock", "clockwise", "clockwork", "anti-clockwise"], correct: 2, explanation: "Running like clockwork = working smoothly." },
  { num: 137, text: "They have finished ______ the legislation.", options: ["formulating", "regulating", "formatting", "fortifying"], correct: 0, explanation: "Formulating legislation = drafting laws." },
  { num: 138, text: "Companies are going to have to be more ______ about environmental management.", options: ["productive", "predictive", "proactive", "indicative"], correct: 2, explanation: "Proactive = take action in advance." },
  { num: 139, text: "Many ______ customers are waiting for a fall in prices before buying.", options: ["potent", "essential", "potential", "potentate"], correct: 2, explanation: "Potential customers = possible future customers." },
  { num: 140, text: "It's tough for a woman to get ______ in politics.", options: ["away", "out", "ahead", "down"], correct: 2, explanation: "Get ahead = succeed/advance." },
  { num: 141, text: "It's a good idea to read ______ on a company before going for an interview.", options: ["out", "up", "in", "ahead"], correct: 1, explanation: "Read up on = research the company." }
];

async function seedExtras() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminUser = await mongoose.connection.db.collection("users").findOne({ role: "admin" });
    if (!adminUser) throw new Error("No admin user found. Create one first.");

    const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
    const upstreamCategory = await Category.findOne({ subject: "English", name: "Upstream" });
    if (!upstreamCategory) throw new Error("No Upstream category found for English");

    const Question = mongoose.model(
      "Question",
      new mongoose.Schema({}, { strict: false, timestamps: true })
    );

    const docs = extra.map((q) => ({
      title: `Upstream MCQ #${q.num}`,
      question_text: q.text,
      choices: q.options.map((opt, idx) => ({ id: String(idx + 1), text: opt, is_correct: idx === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: upstreamCategory._id,
      source: "Upstream",
      tags: ["vocab", "upstream"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    const res = await Question.insertMany(docs);
    console.log(`✅ Inserted ${res.length} extra Upstream questions (101-141)`);

    // update category count (add inserted count)
    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { questionCount: res.length } });

  } catch (err) {
    console.error("❌ Error seeding extras:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedExtras();
