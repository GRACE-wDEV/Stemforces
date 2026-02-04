import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// General Exercises — Volume 1: 100 questions → 5 quizzes × 20 questions
const raw = [
  { text: `This is a job full of complexities. It needs much …..`, options: ["procrastination","challenges","contamination","perseverance"], correct: 3, explanation: `"Perseverance" means continued effort despite difficulties, which is needed for a complex job.` },
  { text: `The demand ….. water is expected to increase sharply in the next decades.`, options: ["on","for","with","at"], correct: 1, explanation: `The correct preposition with "demand" is "for" (demand for something).` },
  { text: `The synonym of the phrasal verb “make up for” is …..`, options: ["commemorate","investigate","compensate","eliminate"], correct: 2, explanation: `"Make up for" means to compensate for something.` },
  { text: `I kept persuading him to come with me. However, he was …..`, options: ["flexible","obedient","reluctance","reluctant"], correct: 3, explanation: `"Reluctant" means unwilling or hesitant.` },
  { text: `Due to insufficiently studied economic policies, some ….. had occurred on different levels.`, options: ["perspectives","repercussions","statistics","reforms"], correct: 1, explanation: `"Repercussions" means unintended consequences.` },
  { text: `These trees are ….. tall.`, options: ["phenomenon","phenomena","phenomenal","phenomenally"], correct: 3, explanation: `"Phenomenally" is an adverb meaning extremely.` },
  { text: `Though they exerted much effort, the results were not that …..`, options: ["convinced","convince","conviction","convincing"], correct: 3, explanation: `"Convincing" means persuasive or believable.` },
  { text: `It is important to ….. a clear goal for yourself and try to achieve it.`, options: ["sit","get","set","score"], correct: 2, explanation: `"Set a goal" is the correct collocation.` },
  { text: `After the interruption, the professor carried ….. quickly to finish her lecture before noon.`, options: ["out","on","through","forward"], correct: 1, explanation: `"Carry on" means to continue.` },
  { text: `Time wore …. Because we were waiting for something important.`, options: ["on","away","down","off"], correct: 0, explanation: `"Wear on" means to pass slowly.` },
  { text: `Wars disseminate ….. and consternation among people.`, options: ["crux","suffer","nuisance","dismay"], correct: 3, explanation: `"Dismay" means distress or alarm.` },
  { text: `All the attendants were greatly disturbed by this ….. news.`, options: ["satisfactory","disconcerting","neutral","insignificant"], correct: 1, explanation: `"Disconcerting" means unsettling or disturbing.` },
  { text: `….. efforts were exerted to make this dream come true.`, options: ["priceless","notorious","simultaneous","strenuous"], correct: 3, explanation: `"Strenuous" means requiring great effort.` },
  { text: `The patient took a long time to ….. after the operation.`, options: ["co-operate","recreate","reiterate","recuperate"], correct: 3, explanation: `"Recuperate" means recover from illness.` },
  { text: `He has difficulty in sleeping. He has …..`, options: ["amnesia","mania","insomnia","inertia"], correct: 2, explanation: `"Insomnia" is a sleep disorder.` },
  { text: `This place is not frequently visited although it is amazing. It is off the ….. track.`, options: ["bitten","beaten","deserted","isolated"], correct: 1, explanation: `"Off the beaten track" means remote or less traveled.` },
  { text: `At last, justice …. And the prisoners were released.`, options: ["retailed","prevailed","published","revealed"], correct: 1, explanation: `"Justice prevailed" means justice was victorious.` },
  { text: `Thanks to his wise ….., He could solve the crisis in a way that satisfied all concerned.`, options: ["reproach","assault","consult","approach"], correct: 3, explanation: `"Approach" means method or way of handling something.` },
  { text: `Many problems arose because of the …..`, options: ["chaos","purposes","confidence","conservation"], correct: 0, explanation: `"Chaos" means disorder, which causes problems.` },
  { text: `The antonym of the word pros is …..`, options: ["advantages","drawbacks","downsides","both b and c"], correct: 3, explanation: `"Pros" means advantages, so antonyms are drawbacks or downsides.` },
  { text: `Developing the economy must be one of the top ….. of any country.`, options: ["priorities","depositories","stratagems","requirements"], correct: 0, explanation: `"Top priorities" are most important objectives.` },
  { text: `The antonym of postpone is ….`, options: ["retreat","delay","advance","put off"], correct: 2, explanation: `"Postpone" means delay; its opposite is "advance".` },
  { text: `The final exams ….. in June as usual.`, options: ["begins","will begin","begin","would begin"], correct: 2, explanation: `For scheduled events the simple present "begin" is used.` },
  { text: `My younger brother ….. me while I’m studying. This is very annoying to me.`, options: ["always interrupts","is always interrupted","has always interrupted","is always interrupting"], correct: 3, explanation: `Present continuous + "always" expresses a repeated annoying action.` },
  { text: `While I …. At the meeting, I felt dizzy.`, options: ["was","was being","have been","being"], correct: 0, explanation: `Past continuous "was" is used for an action in progress.` },
  { text: `I ….. eight cups of tea before leaving the office.`, options: ["had been drinking","have drunk","had drunk","have been drinking"], correct: 2, explanation: `Past perfect "had drunk" indicates an action completed before another past time.` },
  { text: `I’d rather you ….. everything before noon.`, options: ["will finish","finish","finished","having finished"], correct: 2, explanation: `After "I'd rather," use the past subjunctive ("finished").` },
  { text: `I remember ….. you in the conference the other day.`, options: ["to see","seen","to have seen","seeing"], correct: 3, explanation: `"Remember + verb-ing" refers to a past memory.` },
  { text: `I strongly ….. to making any amendments to the plan.`, options: ["disagreed","refused","contributed","objected"], correct: 3, explanation: `"Object to" is the correct phrasal verb meaning oppose.` },
  { text: `She ….. this appliance. It cost so much money and she could do without it.`, options: ["needn’t buy","didn’t have to buy","can’t have bought","needn’t have bought"], correct: 3, explanation: `"Needn't have bought" expresses an unnecessary past action.` },
  { text: `You …. Come round and visit us.`, options: ["have to","must","should","ought"], correct: 1, explanation: `"Must" expresses a strong suggestion or invitation.` },
  { text: `Have you ….. making a different plan?`, options: ["thought","regarded","implied","considered"], correct: 3, explanation: `"Consider + verb-ing" means think about doing.` },
  { text: `I regret …… that. I should have done it.`, options: ["to do","not to do","doing","not doing"], correct: 3, explanation: `"Regret + not doing" expresses regret about a past action not done.` },
  { text: `By 2030, a cure for cancer …… , Who knows?`, options: ["will have discover","will have been discovered","might have been discovering","might have been discovered"], correct: 3, explanation: `"Might have been discovered" expresses possibility.` },
  { text: `Many ….. figures are expected to attend the economic conference.`, options: ["stagnant","prominent","ineffective","inefficient"], correct: 1, explanation: `"Prominent" means important or well-known.` },
  { text: `A ….. of bees was flying near the field.`, options: ["beehive","nectar","swarm","queens"], correct: 2, explanation: `A group of bees is called a "swarm".` },
  { text: `My uncle’s company is well-established with a very good …..`, options: ["repetition","fame","salutation","reputation"], correct: 3, explanation: `"Reputation" means the opinion people have about something.` },
  { text: `After committing the crime, the gang felt ….. of being arrested and put in jail.`, options: ["comprehensive","reprehensive","apprehensive","extensive"], correct: 2, explanation: `"Apprehensive" means anxious or fearful.` },
  { text: `The synonym of infectious is …..`, options: ["indigenous","contagious","ingenious","contaminated"], correct: 1, explanation: `"Infectious" and "contagious" both refer to diseases that spread.` },
  { text: `The prisoner was set free after further investigations. The court had ….. him.`, options: ["acquired","inquired","acquitted","accentuated"], correct: 2, explanation: `"Acquitted" means declared not guilty.` },
  { text: `….. had he finished all the required tasks when he was asked to travel abroad.`, options: ["No sooner","Never","Neither","Hardly"], correct: 3, explanation: `"Hardly...when" is a structure meaning "as soon as."` },
  { text: `I cannot ….. him to do something which he doesn’t want to do.`, options: ["comply","compact","confess","compel"], correct: 3, explanation: `"Compel" means force.` },
  { text: `All the information we got ….. useful and effective.`, options: ["were","have been","are","was"], correct: 3, explanation: `"Information" is uncountable, so use singular verb "was."` },
  { text: `The last scene I saw for myself has ….. all my doubts.`, options: ["dispelled","repelled","discarded","disarmed"], correct: 0, explanation: `"Dispelled" means eliminated doubts.` },
  { text: `The synonym of the noun “encouragement” is …..`, options: ["settlement","reinforcement","recruitment","supplement"], correct: 1, explanation: `"Reinforcement" means support or strengthening.` },
  { text: `When the season starts, hundreds of tourists and citizens ….. the museum.`, options: ["will have visited","are going to visit","will visit","will be visiting"], correct: 2, explanation: `Simple future "will visit" is used for predictions.` },
  { text: `All his relatives, friends, colleagues and acquaintances admire him because of his …..`, options: ["rumors","scandals","integration","integrity"], correct: 3, explanation: `"Integrity" means honesty and strong moral principles.` },
  { text: `He has become affluent as his business is ……`, options: ["lucrative","luxurious","wealthy","depressed"], correct: 0, explanation: `"Lucrative" means profitable.` },
  { text: `Spreading false …… often affects the soundness and stability of societies.`, options: ["Rumors","celebrities","suspicions","milestones"], correct: 0, explanation: `"False rumors" can harm society.` },
  { text: `Employers always depend on ….. and reliable employees.`, options: ["conscious","conscience","conspicuous","conscientious"], correct: 3, explanation: `"Conscientious" means diligent and careful.` },
  { text: `It is an ….. note. No names were written in it.`, options: ["anonymous","unanimous","anomalous","synonymous"], correct: 0, explanation: `"Anonymous" means without a name.` },
  { text: `The synonym of pressing is …..`, options: ["stressful","urgent","relaxing","perplexing"], correct: 1, explanation: `"Pressing" means requiring immediate attention.` },
  { text: `After a long time of ….., the police managed to arrest all the criminals.`, options: ["survey","survival","surveillance","supervision"], correct: 2, explanation: `"Surveillance" means close observation.` },
  { text: `The earthquake has had a ….. effect on the city.`, options: ["divastated","devastating","embarrassed","embarrassing"], correct: 1, explanation: `"Devastating" means highly destructive.` },
  { text: `When the season finishes, a thousand tourists ……. The museum.`, options: ["will visit","will have been visited","will have visited","Will have been visiting"], correct: 2, explanation: `Future perfect "will have visited" indicates completion.` },
  { text: `A synonym of the adjective “famous” is …..`, options: ["renowned","celebrated","both a and b","neither a nor b"], correct: 2, explanation: `Both "renowned" and "celebrated" are synonyms of "famous."` },
  { text: `The results of the experiment ….. the curiosity of the scientist.`, options: ["raised","rose","arose","aroused"], correct: 3, explanation: `"Aroused" means stimulated or awakened.` },
  { text: `We should always try to help the needy to alleviate their …..`, options: ["certificates","burdens","themes","coasts"], correct: 1, explanation: `"Alleviate burdens" means reduce difficulties.` },
  { text: `“Confusing” is synonymous for …..`, options: ["baffling","puzzling","perplexing","all mentioned"], correct: 3, explanation: `All options mean confusing.` },
  { text: `She is very inquisitive. She always wants to ….. on the walls to know what’s happening.`, options: ["jump","climb","run","fly"], correct: 3, explanation: `"Fly on the walls" is part of the idiom meaning an unnoticed observer.` },
  { text: `Salah is a respectable person who always does his best to ….. the gap between any people who are not in good terms.`, options: ["fill","bridge","widen","broaden"], correct: 1, explanation: `"Bridge the gap" is an idiom meaning reduce differences.` },
  { text: `Manar is a reliable person who is always ….. to her word.`, options: ["connected","permitted","committed","indebted"], correct: 2, explanation: `"Committed to her word" means she keeps her promises.` },
  { text: `Students who play ….. are seldom successful in their studies.`, options: ["tricks","truants","roles","chaos"], correct: 1, explanation: `"Play truant" means skip school.` },
  { text: `Some foods can ….. our immunity more than others.`, options: ["boost","boast","post","boom"], correct: 0, explanation: `"Boost immunity" means strengthen it.` },
  { text: `The right ….. is the first step of the process of treatment.`, options: ["hypothesis","amnesia","hepatitis","diagnosis"], correct: 3, explanation: `"Diagnosis" means identifying a disease.` },
  { text: `….. is treatment by sticking needles into the body.`, options: ["puncture","biofeedback","acupuncture","infrastructure"], correct: 2, explanation: `"Acupuncture" is treatment using needles.` },
  { text: `Policemen wear a/an ….. uniform.`, options: ["appreciative","distinctive","vindictive","informative"], correct: 1, explanation: `"Distinctive" means easily recognizable.` },
  { text: `The committee is holding a series of meetings in the next ten days to ….. the situation and make the required recommendations.`, options: ["process","assassinate","compress","assess"], correct: 3, explanation: `"Assess" means evaluate.` },
  { text: `“Declare” is the antonym of …..`, options: ["comply","instill","install","conceal"], correct: 3, explanation: `"Declare" means make public; its opposite is "conceal".` },
  { text: `They decided to move to a more ….. flat.`, options: ["auspicious","conspicuous","pernicious","spacious"], correct: 3, explanation: `"Spacious" means having a lot of space.` },
  { text: `I don’t like people who always ….. about their accomplishments.`, options: ["complain","satisfy","boast","take pride"], correct: 2, explanation: `"Boast" means brag.` },
  { text: `I’m willing to place everything at your ….. to achieve the desired results.`, options: ["proposal","colossal","denial","disposal"], correct: 3, explanation: `"At your disposal" means available for your use.` },
  { text: `It is a must to keep ….. the challenges and overcome them all.`, options: ["up with","off","up","down"], correct: 0, explanation: `"Keep up with" means stay abreast of or manage.` },
  { text: `Randa is always ….. about what she does.`, options: ["keen","interested","enthusiastic","exciting"], correct: 2, explanation: `"Enthusiastic" means showing intense enjoyment.` },
  { text: `The visitors were ….. by what they had seen.`, options: ["impressive","impressed","impression","impress"], correct: 1, explanation: `"Impressed" means feeling admiration.` },
  { text: `Hend opened her purse to know if she had enough money for the ….. of the taxi.`, options: ["hear","fair","fees","fare"], correct: 3, explanation: `"Fare" is the money paid for a journey.` },
  { text: `The ….. of Charles Dickens expressed how some British suffered during the industrial revolution.`, options: ["work","career","morals","works"], correct: 3, explanation: `"Works" refers to literary creations.` },
  { text: `The speed of vehicles can be ….. by radars.`, options: ["deduced","detected","predicted","conducted"], correct: 1, explanation: `"Detected" means discovered or measured.` },
  { text: `Nelson Mandela ….. his life to the issue of fighting racial discrimination.`, options: ["indicated","confiscated","authenticated","dedicated"], correct: 3, explanation: `"Dedicated his life" means devoted his life.` },
  { text: `To practice rowing is to use ….. to move a boat.`, options: ["ores","roars","oars","forces"], correct: 2, explanation: `"Oars" are used for rowing.` },
  { text: `It was not unintended. They did it …..`, options: ["accidentally","remarkably","deliberate","deliberately"], correct: 3, explanation: `"Deliberately" means intentionally.` },
  { text: `There is really an intense competition between the …..`, options: ["contestants","participations","contaminants","pollutants"], correct: 0, explanation: `"Contestants" are competitors.` },
  { text: `At last, they realized it is not true at all. It was just a ……`, options: ["fiction","fallacy","fact","theories"], correct: 1, explanation: `"Fallacy" means a mistaken belief.` },
  { text: `It was …… good advice that it completely solved the problem.`, options: ["such a","such","so a","enough"], correct: 1, explanation: `"Such" is used before uncountable nouns like "advice."` },
  { text: `He is …… a fast reader.`, options: ["so","such","enough","too"], correct: 1, explanation: `"Such a" is used with adjective + noun ("a fast reader").` },
  { text: `…… she arrive at any moment, tell her to contact me at once.`, options: ["If","Were","Had","Should"], correct: 3, explanation: `"Should she arrive" is an inverted conditional.` },
  { text: `….. he known the truth, he’d have acted differently.`, options: ["If","Had","Were","Should"], correct: 1, explanation: `"Had he known" is inverted form of third conditional.` },
  { text: `Not only …… the mountain but he reached its summit as well.`, options: ["John climbed","John did climb","did John climbed","did john climb"], correct: 3, explanation: `After "Not only," inversion is used: "did john climb".` },
  { text: `A …. Is a formal organized discussion.`, options: ["debt","debit","bait","debate"], correct: 3, explanation: `"Debate" is a formal discussion.` },
  { text: `I spoke to the manager and …… a complaint.`, options: ["did","performed","made","make"], correct: 2, explanation: `"Make a complaint" is the correct collocation.` },
  { text: `He said that China …… a densely-populated country.`, options: ["is","was","has","have"], correct: 0, explanation: `For general truths the present tense "is" is used.` },
  { text: `You’d rather …. About that again.`, options: ["don’t think","not to think","not think","didn’t think"], correct: 2, explanation: `After "would rather," use the base form: "not think".` },
  { text: `I’m reading a novel ….. the main character is a man of principles among some swindlers, showing the conflict between good and evil.`, options: ["whose","about whom","in which","in that"], correct: 2, explanation: `"In which" refers to the novel.` },
  { text: `The food ….. in the blue pot turned bad.`, options: ["leaving","which left","was left","left"], correct: 3, explanation: `"Left" is used as past participle adjective.` },
  { text: `I’m going to the oculist to …..`, options: ["test my eyes","having my eyes tested","get tested my eyes","get my eyes tested"], correct: 3, explanation: `"Get my eyes tested" is correct.` },
  { text: `He is ….. late. We didn’t wait a lot.`, options: ["extremely","terribly","slightly","really"], correct: 2, explanation: `"Slightly late" means a little late.` },
  { text: `Do you think this battery is …..?`, options: ["recycle","recycling","recycles","recyclable"], correct: 3, explanation: `"Recyclable" means able to be recycled.` },
  { text: `When I was young, I ….. to the amusement park.`, options: ["am used to going","usually went","used to going","used for going"], correct: 1, explanation: `"Usually went" means regularly went in the past.` },
  { text: `Under no circumstances ….. to do that again.`, options: ["you are allowed","are you being allowed","are you aloud","are you allowed"], correct: 3, explanation: `Inversion: "are you allowed".` },
  { text: `….. of them describes the festival in a different way.`, options: ["Both","Every","Each","All"], correct: 2, explanation: `"Each" is singular and matches "describes."` }
];

async function seedGeneralExercisesVolume1() {
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
      title: `General Vol1 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: i === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: genCategory._id,
      source: "General-Volume1",
      tags: ["general","volume1"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} General Exercises Volume 1 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "General-Volume1" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing General-Volume1 quizzes`);

    const chunk = 20; // 5 quizzes of 20 each
    const created = [];
    for (let i = 0; i < 5; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Volume 1, Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `General Exercises — Volume 1 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "General-Volume1",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: genCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} General Exercises quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding General Exercises Volume 1:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedGeneralExercisesVolume1();
