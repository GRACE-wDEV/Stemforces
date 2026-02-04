import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// General Exercises — Volume 3: 100 questions → 5 quizzes × 20 questions
const raw = [
  { text: `I have a high ….. of his character.`, options: ["intimate","estimate","elaborate","value"], correct: "estimate", explanation: `"High estimate" means a good opinion or judgment of someone's character.` },
  { text: `His attitudes and efforts really deserve much …..`, options: ["praise","enthusiasm","celebrity","fame"], correct: "praise", explanation: `"Deserve praise" means worthy of approval or admiration.` },
  { text: `My cousin is …. With some ideas that have full control over him.`, options: ["promised","disciplined","oppressed","obsessed"], correct: "obsessed", explanation: `"Obsessed with" means preoccupied or dominated by ideas.` },
  { text: `Her research in the last decade ….. these findings.`, options: ["promised","annihilated","anticipated","alleviated"], correct: "anticipated", explanation: `"Anticipated" means expected or predicted.` },
  { text: `Despite all my support and encouragement, he turned out to be an ….`, options: ["opponent","ingrate","ancestor","umpire"], correct: "ingrate", explanation: `"Ingrate" means an ungrateful person.` },
  { text: `The political party has a priority of ….. illiteracy and spreading education.`, options: ["illuminating","eliminating","specializing","enrolling"], correct: "eliminating", explanation: `"Eliminating illiteracy" means eradicating it.` },
  { text: `We …. Forget that tourism is important for our country.`, options: ["needn’t","oughtn’t","don’t need","mustn’t"], correct: "mustn’t", explanation: `"Mustn't" stresses not forgetting.` },
  { text: `Working in the ….. department in a hospital is really tiring.`, options: ["casualty","authority","validity","entity"], correct: "casualty", explanation: `"Casualty department" is the emergency room.` },
  { text: `I wish I …. By that swindler.`, options: ["had been deceived","had deceived","hadn’t deceived","hadn’t been deceived"], correct: "hadn’t been deceived", explanation: `"I wish + past perfect" expresses regret about a past event.` },
  { text: `This businessman is one of the ….. industrialists.`, options: ["lead","leading","misleading","led"], correct: "leading", explanation: `"Leading" means most important or prominent.` },
  { text: `Take your umbrella …. You need to use it.`, options: ["in case","provided","if","unless"], correct: "in case", explanation: `"In case" = as a precaution.` },
  { text: `Is this car battery …..`, options: ["recycle","recycling","recycles","recyclable"], correct: "recyclable", explanation: `"Recyclable" means able to be recycled.` },
  { text: `The news ….. by anyone.`, options: ["was heard","wasn’t heard","were heard","weren’t heard"], correct: "wasn’t heard", explanation: `"News" is uncountable so singular passive.` },
  { text: `Watch out! This ….. is full of mud.`, options: ["march","merchant","morgue","marsh"], correct: "marsh", explanation: `A "marsh" is a wetland.` },
  { text: `He …. A fortune from trade.`, options: ["did","formulated","made","campaigned"], correct: "made", explanation: `"Made a fortune" = earned a lot.` },
  { text: `….. is a synonym for enthusiasm.`, options: ["fervor","favor","flavor","endeavor"], correct: "fervor", explanation: `"Fervor" means intense feeling; matches enthusiasm.` },
  { text: `We presented a ….. to the council and they promised they would try to respond positively.`, options: ["competition","repetition","reputation","petition"], correct: "petition", explanation: `A "petition" is a formal request.` },
  { text: `After a very long argument, they ….. agreed.`, options: ["mutual","mutually","reluctant","reluctantly"], correct: "reluctantly", explanation: `"Reluctantly" = unwillingly.` },
  { text: `I hope you will all achieve …. Success.`, options: ["respectful","spectacular","skeptical","affluent"], correct: "spectacular", explanation: `"Spectacular success" = very impressive.` },
  { text: `This time next month, I ….. on the beach in Hurghada.`, options: ["will sunbathe","will have sunbathed","will be sunbathing","will have been sunbathed"], correct: "will be sunbathing", explanation: `Future continuous for action in progress at a future time.` },
  { text: `I ….. some friends to assist me.`, options: ["had","made","let","got"], correct: "got", explanation: `"Got someone to do something" = arranged/persuaded.` },
  { text: `Avoidable is an antonym to the word …..`, options: ["prominent","remarkable","distinguished","inevitable"], correct: "inevitable", explanation: `Opposite of avoidable is inevitable.` },
  { text: `After long rounds of negotiations, the two countries managed to reach a …..`, options: ["prominence","provision","confrontation","compromise"], correct: "compromise", explanation: `"Reach a compromise" = find middle ground.` },
  { text: `While the kids ….. at school, their parents were doing some shopping.`, options: ["were","were being","would be","had been"], correct: "were", explanation: `Simple past for a state during another past action.` },
  { text: `I think you’d rather ….. on putting this plan into effect.`, options: ["not to insist","not insisting","not for insisting","not insist"], correct: "not insist", explanation: `After "would rather" use base form.` },
  { text: `This was a great opportunity that (should seize- should be seized- should have seized- should have been seized)`, options: ["should seize","should be seized","should have seized","should have been seized"], correct: "should have been seized", explanation: `Expresses regret about missed opportunity (passive).` },
  { text: `He always argues with his wife about home expenses because he thinks she is …..`, options: ["obedient","extraordinary","exempted","extravagant"], correct: "extravagant", explanation: `"Extravagant" = spending too much.` },
  { text: `Success, progress and prosperity can only be ….. through hard work, patience and sleepless nights.`, options: ["achieved","aspired","attained","both a and c"], correct: "both a and c", explanation: `Both "achieved" and "attained" fit.` },
  { text: `By the time father arrives home, mother …… lunch.`, options: ["will have been prepared","will have prepared","will be preparing","will prepare"], correct: "will have prepared", explanation: `Future perfect indicates completion before another future event.` },
  { text: `Revolution …… but the aristocrats were totally indifferent.`, options: ["dwindled","faded","roared","loomed"], correct: "loomed", explanation: `"Loomed" = appeared as a threat.` },
  { text: `A big reward was offered as an ….. for anyone who can give valuable information about the gang.`, options: ["impediment","consideration","incentive","cease"], correct: "incentive", explanation: `A reward is an incentive.` },
  { text: `Do not distract yourself. ….. your efforts in one direction.`, options: ["renew","channel","reiterate","convince"], correct: "channel", explanation: `"Channel your efforts" = direct them.` },
  { text: `Doing things on a …. Usually leads to negative results.`, options: ["whim","whip","whirl","whistle"], correct: "whim", explanation: `"On a whim" = sudden impulse.` },
  { text: `It was not unintended. It was done …..`, options: ["by mistake","on duty","by accident","on purpose"], correct: "on purpose", explanation: `"On purpose" = intentionally.` },
  { text: `Idealists are often shocked with realities. They have their heads in the …..`, options: ["planets","atmosphere","crowds","clouds"], correct: "clouds", explanation: `"Head in the clouds" = unrealistic.` },
  { text: `He got all the praise. He completely stole the ….`, options: ["crew","replacement","show","blow"], correct: "show", explanation: `"Steal the show" = attract most attention.` },
  { text: `If there are challenges, ….. to attain your hopes and ambitions.`, options: ["Deprive","Renovate","Revive","Strive"], correct: "Strive", explanation: `"Strive" = make great efforts.` },
  { text: `January is ….. than March.`, options: ["more colder","coldest","much colder","slightly cold"], correct: "much colder", explanation: `Comparative: "much colder."` },
  { text: `Paper money wears ….. by use.`, options: ["away","off","on","down"], correct: "away", explanation: `"Wear away" = become thinner by use.` },
  { text: `He is ….. in his field of specialization. He surpasses all his peers.`, options: ["unparalleled","unprecedented","unfortunate","uncontrollable"], correct: "unparalleled", explanation: `"Unparalleled" = unmatched.` },
  { text: `He ….. the claim as he thought it was highly improbable.`, options: ["confirmed","dissuaded","distorted","dismissed"], correct: "dismissed", explanation: `"Dismissed" = rejected.` },
  { text: `Love of life and survival is ….. into human nature.`, options: ["ingrained","installed","invested","investigated"], correct: "ingrained", explanation: `"Ingrained" = deeply fixed.` },
  { text: `A lot of the novels of Charles Dickens are of ….. interest.`, options: ["decreasing","enveloping","enduring","encircling"], correct: "enduring", explanation: `"Enduring interest" = lasting.` },
  { text: `Do you have any ….. of what I’m referring to?`, options: ["motion","caution","devotion","notion"], correct: "notion", explanation: `"Notion" = idea.` },
  { text: `My cousin is greatly interested in the ….. of science.`, options: ["principle","realm","generation","crux"], correct: "realm", explanation: `"Realm of science" = field.` },
  { text: `The cases we saw in hospital ….. our sympathy.`, options: ["raised","rose","arose","aroused"], correct: "aroused", explanation: `"Aroused sympathy" = awakened feelings.` },
  { text: `It is very important to consider reclaiming and cultivating ….. land.`, options: ["fertile","affluent","barren","burdensome"], correct: "barren", explanation: `"Barren land" = unproductive land.` },
  { text: `What a suspenseful end of the chapter! It’s a …..`, options: ["megalomania","predicament","cliff","cliffhanger"], correct: "cliffhanger", explanation: `"Cliffhanger" = suspenseful ending.` },
  { text: `I can’t find my wallet. It …..`, options: ["must have stolen","should have stolen","must have been stolen","could have been stolen"], correct: "must have been stolen", explanation: `Deduction about a past passive action.` },
  { text: `He is really bold and daring. He is …..`, options: ["priceless","dauntless","merciless","ruthless"], correct: "dauntless", explanation: `"Dauntless" = fearless.` },
  { text: `Use this ointment. It will greatly ….. the pain.`, options: ["increase","seize","soothe","writhe"], correct: "soothe", explanation: `"Soothe" = relieve pain.` },
  { text: `The breeze has a ….. effect on me.`, options: ["benign","strenuous","resentful","empathic"], correct: "benign", explanation: `"Benign" = gentle, favorable.` },
  { text: `The enemy’s army imposed a military and economic ….. on the city.`, options: ["siege","entertainment","pilgrimage","thrill"], correct: "siege", explanation: `"Siege" = military blockade.` },
  { text: `We are in bad need of doing some ….. activities to renew our energy.`, options: ["factual","lingual","vital","recreational"], correct: "recreational", explanation: `"Recreational activities" = leisure.` },
  { text: `The two world wars are extremely ……`, options: ["meditating","appalling","revealing","satisfactory"], correct: "appalling", explanation: `"Appalling" = shocking.` },
  { text: `It is unreal. It is …..`, options: ["contrived","imaginative","both a and b","neither a nor b"], correct: "both a and b", explanation: `Both "contrived" and "imaginative" can fit.` },
  { text: `We are still optimistic even if we just have a ….. of hope.`, options: ["glimpse","grain","toil","tolerance"], correct: "glimpse", explanation: `"A glimpse of hope" = slight sign of hope.` },
  { text: `It is not my favorite. It isn’t really my cup of …..`, options: ["coffee","tea","juice","milk"], correct: "tea", explanation: `Idiom: not my cup of tea.` },
  { text: `Always put some money …. Just in case.`, options: ["off","forward","away","aside"], correct: "aside", explanation: `"Put aside" = save.` },
  { text: `He showed great ….. to his opponent.`, options: ["demonstration","defiance","encouragement","correspondence"], correct: "defiance", explanation: `"Defiance" = open resistance.` },
  { text: `Because of his creative abilities, he is always able to introduce new ….. in his field of specialization.`, options: ["innovations","foundations","constitutions","certificates"], correct: "innovations", explanation: `"Innovations" = new ideas.` },
  { text: `These predictions are not based on clear evidence. They are mere …..`, options: ["identities","circumstances","speculations","responsibilities"], correct: "speculations", explanation: `"Speculations" = guesses.` },
  { text: `….. to the rules is a must here.`, options: ["reforming","informing","forming","conforming"], correct: "conforming", explanation: `"Conforming to the rules" = complying.` },
  { text: `Hadi is very good at portraying things. He is an …..`, options: ["editor","illustrator","entrepreneur","ambassador"], correct: "illustrator", explanation: `"Illustrator" = portrays with drawings.` },
  { text: `Maya is sensitive and ….. She sympathizes with the suffering of people.`, options: ["apathetic","enthusiastic","conscientious","empathic"], correct: "empathic", explanation: `"Empathic" = understanding others' feelings.` },
  { text: `They were waiting with ….. breath during the operation performed on their mother’s heart.`, options: ["rated","choked","faded","bated"], correct: "bated", explanation: `"With bated breath" = anxious anticipation.` },
  { text: `Money should never be an end in itself. It should be just a …..`, options: ["method","technique","slogan","means"], correct: "means", explanation: `Money is a means to an end.` },
  { text: `The main theme of King Lear is filial …..`, options: ["denial","infiltration","ingratitude","instability"], correct: "ingratitude", explanation: `"Filial ingratitude" = children ungratefulness.` },
  { text: `This mall has a wide ….. of clothes of different sizes.`, options: ["vary","various","variety","varying"], correct: "variety", explanation: `"A wide variety of" = range.` },
  { text: `My younger brother …… while I am studying.`, options: ["always sing","has always sung","was always singing","is always singing"], correct: "is always singing", explanation: `Present continuous + always = repeated annoying action.` },
  { text: `When I heard the joke, I couldn’t help …..`, options: ["laugh","to laugh","being laughed","laughing"], correct: "laughing", explanation: `"Couldn't help + gerund"` },
  { text: `Joining this faculty means ….. hard.`, options: ["studying","to study","to studying","having studied"], correct: "studying", explanation: `After "means" use gerund.` },
  { text: `Try ….. breaks between study sessions. This will refresh you and renew your energy.`, options: ["to take","taking","being taken","to be taken"], correct: "taking", explanation: `"Try + gerund" = experiment.` },
  { text: `You …. Yesterday. The mobile was with me all day and it was not made silent.`, options: ["must have phoned","should have phoned","couldn’t have phoned","can’t be phoning"], correct: "couldn’t have phoned", explanation: `Deduction about past impossibility.` },
  { text: `The manager …. Us to stay until we finish all the required tasks.`, options: ["made","had","threatened","forced"], correct: "forced", explanation: `"Forced" = compelled.` },
  { text: `How long …. Did you finish this report?`, options: ["for","since","ago","time"], correct: "ago", explanation: `"How long ago" asks time in past.` },
  { text: `….. he became famous, his books have been translated into many languages.`, options: ["since","for","until","as long as"], correct: "since", explanation: `"Since" + point in time.` },
  { text: `Adham has …. The United States and will return in a month’s time.`, options: ["been","gone","been to","gone to"], correct: "gone to", explanation: `"Has gone to" = currently there.` },
  { text: `I …. My passport! What should I do?`, options: ["have lost","lost","had lost","was losing"], correct: "have lost", explanation: `Present perfect for present relevance.` },
  { text: `I almost made it. When I reached the station, the train …..`, options: ["left","has just left","had left","had been leaving"], correct: "had left", explanation: `Past perfect indicates earlier action.` },
  { text: `The news ….. until we have solved the problem.`, options: ["won’t release","won’t be realized","won’t realize","won’t be released"], correct: "won’t be released", explanation: `Passive future.` },
  { text: `Literary works can have different …..`, options: ["interruptions","interpretations","collocations","statements"], correct: "interpretations", explanation: `Multiple interpretations.` },
  { text: `The patient would rather ….. to hospital now. It’s urgent.`, options: ["take","to take","be taken","to be taken"], correct: "be taken", explanation: `"Would rather" + base passive = "be taken".` },
  { text: `Trees have been planted on ….. sides of the road.`, options: ["both","all","each","every"], correct: "both", explanation: `Road has two sides.` },
  { text: `You should be …. Towards your parents.`, options: ["respectable","respected","respective","respectful"], correct: "respectful", explanation: `"Respectful" = showing respect.` },
  { text: `This is the best seafood I have ….. tasted.`, options: ["Never","ever","yet","already"], correct: "ever", explanation: `"Have ever tasted" = at any time.` },
  { text: `When the police arrived, the robbers ……`, options: ["had already escaped","have already escaped","were escaping","did escape"], correct: "had already escaped", explanation: `Past perfect.` },
  { text: `I …. This car for six years before I sold it.`, options: ["had been having","have had","had","had had"], correct: "had had", explanation: `Past perfect "had had" for ownership.` },
  { text: `I sometimes find some difficulties but my friends are always ….. to me.`, options: ["encouraging","encouraged","encourages","encouragement"], correct: "encouraging", explanation: `"Encouraging" = giving support.` },
  { text: `After buying the t-shirt, he can ….. on it.`, options: ["get printed","get something printed","has something printed","get something to print"], correct: "get something printed", explanation: `"Get something printed" structure.` },
  { text: `On receiving the news, I ….. my parents.`, options: ["was phoned","had phoned","was phoning","phoned"], correct: "phoned", explanation: `Simple past after receiving the news.` },
  { text: `The device was so expensive. However, he insisted ….. it.`, options: ["to buy","on buying","buying","to buying"], correct: "on buying", explanation: `"Insist on + gerund."` },
  { text: `I …. About nanotechnology when I was at first secondary.`, options: ["had first known","first knew","have first known","was first known"], correct: "first knew", explanation: `Simple past at a specific time.` },
  { text: `The children are asleep. They ….. making noise.`, options: ["must be","shouldn’t be","can’t have been","can’t be"], correct: "can’t be", explanation: `Present impossibility.` },
  { text: `Fancy ….. you here!`, options: ["meeting","to meet","for meeting","to be meeting"], correct: "meeting", explanation: `"Fancy meeting you here!" set phrase.` },
  { text: `Don’t call him at that time. He …..`, options: ["will have slept","Will be slept","will be sleeping","was sleeping"], correct: "will be sleeping", explanation: `Future continuous.` },
  { text: `Satellites enable us ….. different things such as communications and weather forecasting.`, options: ["from doing","to doing","to do","doing"], correct: "to do", explanation: `"Enable someone to do something."` },
  { text: `It’s a waste of time …. To persuade him to change his mind.`, options: ["to try","try","to trying","trying"], correct: "trying", explanation: `"It’s a waste of time + gerund."` },
  { text: `He is always willing ….. by others.`, options: ["to help","for helping","helping","to be helped"], correct: "to be helped", explanation: `Passive infinitive needed.` },
  { text: `Can you show me ….. for channels on this tv?`, options: ["to search","searching","how to search","what to search"], correct: "how to search", explanation: `"Show someone how to do something."` }
];

async function seedGeneralExercisesVolume3() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminUser = await mongoose.connection.db.collection("users").findOne({ role: "admin" });
    if (!adminUser) throw new Error("No admin user found. Create one first.");

    const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
    let genCategory = await Category.findOne({ subject: "English", name: "General Exercises" });
    if (!genCategory) {
      console.log("Creating General Exercises category...");
      genCategory = await Category.create({ name: "General Exercises", subject: "English", description: "General English exercises", quizCount: 0, questionCount: 0, active: true, created_by: adminUser._id });
    }

    const Question = mongoose.model("Question", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const docs = raw.map((q, idx) => ({
      title: `General Vol3 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: opt.toLowerCase().trim() === q.correct.toLowerCase().trim() })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: genCategory._id,
      source: "General-Volume3",
      tags: ["general","volume3"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} General Exercises Volume 3 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "General-Volume3" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing General-Volume3 quizzes`);

    const chunk = 20; // 5 quizzes of 20
    const created = [];
    for (let i = 0; i < 5; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Volume 3, Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `General Exercises — Volume 3 — Part ${i + 1} (${slice.length} questions)`,
        subject: "English",
        category: genCategory._id,
        questions: slice,
        total_time: slice.length * 60,
        per_question_time: 60,
        randomized: true,
        show_results: true,
        allow_review: true,
        passing_score: 60,
        published: true,
        attempts: 0,
        avg_score: 0,
        source: "General-Volume3",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: genCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} General Exercises Volume 3 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding General Exercises Volume 3:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedGeneralExercisesVolume3();
