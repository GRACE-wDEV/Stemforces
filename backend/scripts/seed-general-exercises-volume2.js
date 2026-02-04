import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// General Exercises — Volume 2: 109 questions → 6 quizzes (five of 18, one of 19)
const raw = [
  { text: `We’ll get on as soon as the bus ……`, options: ["stop","had stopped","has to stop","has stopped"], correct: 3, explanation: `"As soon as" with present perfect ("has stopped") indicates an action completed before another future action.` },
  { text: `By the end of this year, the winner of the 2022 world cup …..`, options: ["will have known","will have been known","will have to be known","had been known"], correct: 1, explanation: `Future perfect passive ("will have been known") is used for an action that will be completed before a future time.` },
  { text: `These trees are ….. tall.`, options: ["phenomenally","encredible","phenomenon","phenomenal"], correct: 0, explanation: `"Phenomenally" is an adverb meaning extremely, modifying "tall."` },
  { text: `The human brain is more powerful than any computer. It is really ……`, options: ["handsome","awesome","ransom","decent"], correct: 1, explanation: `"Awesome" means inspiring great admiration.` },
  { text: `Always concentrate on what you are doing. Do not let less important matters …… you.`, options: ["Contract","compact","district","distract"], correct: 3, explanation: `"Distract" means to divert attention.` },
  { text: `Interestingly, There is a major ….. in the field of technology which, it seems, never stops.`, options: ["outbreak","breaking","breakthrough","improvements"], correct: 2, explanation: `"Breakthrough" means an important development or discovery.` },
  { text: `You should always be keen on creating a good ….. in an interview.`, options: ["expression","impression","digression","passion"], correct: 1, explanation: `"Create a good impression" means to make a positive impact.` },
  { text: `Non-renewable energy does not ….. forever.`, options: ["run","expand","stay","last"], correct: 3, explanation: `"Last" means to continue for a period.` },
  { text: `While …… to hospital, the patient recovered from his coma.`, options: ["taking","was taking","was being taken","being taken"], correct: 3, explanation: `Passive gerund "being taken" is correct because the patient is the receiver of the action.` },
  { text: `Employers always choose reliable and ….. employees.`, options: ["efficient","illiterate","obvious","precise"], correct: 0, explanation: `"Efficient" means working productively with minimal waste.` },
  { text: `To have a good sense of ….. is to make good choices.`, options: ["connectivity","sensitinity","selectivity","inventiveness"], correct: 2, explanation: `"Selectivity" means the ability to choose carefully.` },
  { text: `As Amgad worked hard this year, he was hoping for …..`, options: ["permission","declaration","occupation","promotion"], correct: 3, explanation: `"Promotion" means advancement in job position.` },
  { text: `During his hard work, he stops ….. breaks.`, options: ["taking","to take","to taking","to be taken"], correct: 1, explanation: `"Stop to take" means pause in order to take breaks.` },
  { text: `I had a technician ….. the air conditioner yesterday.`, options: ["fix","to fix","fixed","fixing"], correct: 0, explanation: `Have + person + base form: "fix".` },
  { text: `Though they are brothers, they seem to have nothing …..`, options: ["to do","from scratch","in abundance","in common"], correct: 3, explanation: `"Have nothing in common" means share no interests or characteristics.` },
  { text: `We do not allow ….. in this place at all.`, options: ["to smoke","smoking","to smoking","for smoking"], correct: 1, explanation: `After "allow," use gerund when the object is the activity.` },
  { text: `I have taken all my precautions. You ….. worry about this.`, options: ["mustn’t","might","don’t have","needn’t"], correct: 3, explanation: `"Needn't" means it is not necessary.` },
  { text: `I ….. to get in touch with the general manager.`, options: ["succeeded","able","capable","managed"], correct: 3, explanation: `"Managed to" means succeeded in doing something.` },
  { text: `Oh! I …. My passport. What should I do?`, options: ["had lost","lost","have lost","should have lost"], correct: 2, explanation: `Present perfect "have lost" is used for a past action with present relevance.` },
  { text: `The criminal ….. to have escaped.`, options: ["has reported","reports","is reporting","was reported"], correct: 3, explanation: `Passive voice "was reported" is correct.` },
  { text: `Computers can do sums quickly and …..`, options: ["accurately","precisely","profitably","immensely"], correct: 0, explanation: `"Accurately" means correctly.` },
  { text: `I’m really tired. I’ve just parked the car after a ….. drive.`, options: ["six-hours","six-hours’","six-hour","six-hour’s"], correct: 2, explanation: `Hyphenated compound adjective before a noun: "six-hour drive."` },
  { text: `I don’t mind ….. alone for a long time. I got used to that.`, options: ["stay","staying","to stay","to staying"], correct: 1, explanation: `After "don't mind," use gerund.` },
  { text: `I have a friend ….. exam results are always excellent.`, options: ["who’s","about whom","whose","what"], correct: 2, explanation: `"Whose" is the possessive relative pronoun.` },
  { text: `To implement a project means to carry it …..`, options: ["out","on","forward","backward"], correct: 0, explanation: `"Carry out" means to execute or implement.` },
  { text: `The management of the utility is the responsibility of the ….. that runs it.`, options: ["authorization","authority","integration","integrity"], correct: 1, explanation: `"Authority" means the organization with power.` },
  { text: `I’m …. A survey about social media.`, options: ["making","performing","creating","doing"], correct: 3, explanation: `"Do a survey" is the correct collocation.` },
  { text: `….. hearing the good news, I was over the moon.`, options: ["as soon as","by","as","on"], correct: 3, explanation: `"On hearing" means immediately after hearing.` },
  { text: `The celebration will be held just as …..`, options: ["planning","plan","plans","planned"], correct: 3, explanation: `"As planned" means according to the plan.` },
  { text: `Lawyers represent people in …..`, options: ["court","offices","galleries","embassies"], correct: 0, explanation: `Lawyers represent clients in court.` },
  { text: `There must be some ….. with children sometimes in order not to be spoiled.`, options: ["cruelty","boredom","innocence","strictness"], correct: 3, explanation: `"Strictness" prevents spoiling.` },
  { text: `I …. To change my plans.`, options: ["have advised","have to advise","have been advising","have been advised"], correct: 3, explanation: `Passive "have been advised" means someone advised me.` },
  { text: `….. is a serious disease of the liver.`, options: ["arthritis","hepatitis","encephalitis","dermatitis"], correct: 1, explanation: `"Hepatitis" is liver inflammation.` },
  { text: `The competition was so …… that there was so much violence throughout the game.`, options: ["tense","intensive","intended","intense"], correct: 3, explanation: `"Intense" means extreme.` },
  { text: `I got Yasser … shopping with me.`, options: ["to go","going","to going","gone"], correct: 0, explanation: `"Get someone to do something."` },
  { text: `It is ….. to visit him now.`, options: ["early enough","such an early","such early","too early"], correct: 3, explanation: `"Too early" means not a good time.` },
  { text: `A synonym for the word “compulsory” is …..`, options: ["mandatory","decisive","bewildered","detrimental"], correct: 0, explanation: `"Mandatory" means required.` },
  { text: `He ….. confidence.`, options: ["leaks","locks","licks","lacks"], correct: 3, explanation: `"Lacks confidence" means does not have confidence.` },
  { text: `The story appealed to me. It is really …..`, options: ["aspiring","intriguing","convinced","predetermined"], correct: 1, explanation: `"Intriguing" means interesting and fascinating.` },
  { text: `We moved to this flat because it is …..`, options: ["gloomy","clammy","stormy","roomy"], correct: 3, explanation: `"Roomy" means spacious.` },
  { text: `He cannot take his inheritance now because he is still a …..`, options: ["carrier","giant","piper","minor"], correct: 3, explanation: `A "minor" is under legal age.` },
  { text: `They are not yet adults. They are still …..`, options: ["juveniles","unmanned","knights","survivors"], correct: 0, explanation: `"Juveniles" means young people.` },
  { text: `He is neither greedy nor unfair. He is a man of …..`, options: ["bribe","prosperity","recklessness","principles"], correct: 3, explanation: `"Man of principles" means he has strong moral rules.` },
  { text: `….. is to frighten people and force them to do things they do not want to do.`, options: ["bullying","blackmailing","blocking","intruding"], correct: 0, explanation: `"Bullying" involves intimidation.` },
  { text: `It is ….. It cannot be seen by the naked eye.`, options: ["intolerable","vulnerable","visible","invisible"], correct: 3, explanation: `"Invisible" means cannot be seen.` },
  { text: `It is no use ….. over spilt milk.`, options: ["to cry","cried","crying","to crying"], correct: 2, explanation: `After "no use," use gerund.` },
  { text: `The more you exercise, the ….. you become.`, options: ["fit","fitter","fittest","fitting"], correct: 1, explanation: `Comparative: "fitter."` },
  { text: `Under no circumstances ….. that again.`, options: ["you should do","you must do","should you have done","should you do"], correct: 3, explanation: `Inversion: "should you do."` },
  { text: `We passed some excruciating difficulties. The synonym of “excruciating” is …..`, options: ["spacious","unbearable","encompassing","mature"], correct: 1, explanation: `"Unbearable" means intensely painful.` },
  { text: `This entrepreneur is ….. to buy this chain of restaurants.`, options: ["too wealthy","such a wealthy","wealthy enough","very wealthy"], correct: 2, explanation: `"Wealthy enough to buy" indicates sufficient wealth.` },
  { text: `You have to finish all the ….. tasks before next week.`, options: ["acquired","inquired","choir","required"], correct: 3, explanation: `"Required tasks" means necessary tasks.` },
  { text: `We are determined to achieve all our goals ….. the challenges we expected.`, options: ["although","even if","in spite","despite"], correct: 3, explanation: `"Despite" is a preposition meaning without being affected by.` },
  { text: `The ….. life expectancy for women is longer than that of men.`, options: ["beverage","average","middle","revenge"], correct: 1, explanation: `"Average life expectancy" is the statistical term.` },
  { text: `Each culture has its own ….. and traditions.`, options: ["habits","mannerisms","customs","costumes"], correct: 2, explanation: `"Customs and traditions" is common.` },
  { text: `I think I’m included in the list, …..?`, options: ["don’t I","haven’t I","am I","aren’t I"], correct: 3, explanation: `Tag question for "I am" is "aren’t I?"` },
  { text: `He was so surprised ….. the truth.`, options: ["to discover","discovering","to discovering","to be discovered"], correct: 0, explanation: `"Surprised to discover" is correct.` },
  { text: `My uncle traveled abroad with a delegation to …. Business.`, options: ["make","do","have","get"], correct: 1, explanation: `"Do business" is the correct collocation.` },
  { text: `We will continue in our way with great determination ….. difficulties we may face.`, options: ["however","whichever","whatever","wherever"], correct: 2, explanation: `"Whatever difficulties" means no matter what difficulties.` },
  { text: `This device is worth buying in return for this price. It is really a …..`, options: ["cheap","priceless","bargain","margin"], correct: 2, explanation: `"A bargain" means something bought for a good price.` },
  { text: `The internet, like everything else, is a ….. weapon.`, options: ["deeply-rooted","open-minded","double-edged","high-tech"], correct: 2, explanation: `"Double-edged" means both advantages and dangers.` },
  { text: `Have you seen ….. I bought.`, options: ["which","that","whom","what"], correct: 3, explanation: `"What" is used as a relative pronoun meaning "the thing which."` },
  { text: `Not only Did they finish their work but they prepared for the work of tomorrow …..`, options: ["also","either","else","as well"], correct: 3, explanation: `"As well" fits here.` },
  { text: `It is true …. You believe it or not.`, options: ["whether","weather","whatever","although"], correct: 0, explanation: `"Whether you believe it or not."` },
  { text: `Is that the ….. why you are not convinced?`, options: ["reason","cause","result","purpose"], correct: 0, explanation: `"The reason why" is standard.` },
  { text: `Many people still ….. for women’s rights.`, options: ["support","urge","encourage","argue"], correct: 3, explanation: `"Argue for" means advocate.` },
  { text: `Hani is …… with pride. He should be modest.`, options: ["related","dilated","formulated","inflated"], correct: 3, explanation: `"Inflated with pride" means excessively proud.` },
  { text: `Adham is ….. He lacks interest.`, options: ["apathetic","empathic","affluent","accurate"], correct: 0, explanation: `"Apathetic" means showing no interest.` },
  { text: `I was at first convinced with his ideas. However, I discovered that some of them are ….`, options: ["leading","misbehaving","practical","misleading"], correct: 3, explanation: `"Misleading" means giving the wrong idea.` },
  { text: `We really want a …. Solution that does not exclude anything whatsoever.`, options: ["apprehensive","pensive","evasive","comprehensive"], correct: 3, explanation: `"Comprehensive" means complete and inclusive.` },
  { text: `I regret ….. you that the trip was cancelled.`, options: ["to tell","to be told","telling","being told"], correct: 0, explanation: `"Regret to tell" is used when giving bad news.` },
  { text: `It is an undeniable fact that there is no ….. life on earth.`, options: ["internal","external","eternal","bilateral"], correct: 2, explanation: `"Eternal life" means everlasting life.` },
  { text: `Akram has a great ….. for helping the disabled.`, options: ["fashion","motion","mission","passion"], correct: 3, explanation: `"Passion for" means strong enthusiasm.` },
  { text: `….. are given to people who no longer work.`, options: ["pensions","petitions","allowances","processions"], correct: 0, explanation: `"Pensions" are regular payments after retirement.` },
  { text: `No news …. Up till now.`, options: ["has heard","has to hear","was heard","has been heard"], correct: 3, explanation: `"No news has been heard" is present perfect passive.` },
  { text: `I need the money at once. Please, don’t …..`, options: ["evaluate","validate","procrastinate","prostrate"], correct: 2, explanation: `"Procrastinate" means delay.` },
  { text: `By the time father comes, mother ….. lunch.`, options: ["had prepared","has been preparing","will have prepared","will have been prepared"], correct: 2, explanation: `Future perfect: "will have prepared."` },
  { text: `Nobody has the ability to ….. the future.`, options: ["foresee","forbid","forbear","overcome"], correct: 0, explanation: `"Foresee" means predict.` },
  { text: `He went ….. and could not repay his debts.`, options: ["stingy","extravagant","bankrupt","fluent"], correct: 2, explanation: `"Went bankrupt" means became unable to pay debts.` },
  { text: `They work tooth and nail in ….. of achieving their goals.`, options: ["purchase","performance","pursue","pursuit"], correct: 3, explanation: `"In pursuit of" means trying to achieve.` },
  { text: `My friend Haytham had a different ….. of the poem than mine.`, options: ["interruption","involvement","collocation","interpretation"], correct: 3, explanation: `"Interpretation" means understanding.` },
  { text: `Our team wore …. The opponent and was able to beat them two to one.`, options: ["out","down","on","off"], correct: 1, explanation: `"Wear down" means to tire out.` },
  { text: `She kept singing and was over the …..`, options: ["clouds","sun","moon","air"], correct: 2, explanation: `"Over the moon" means extremely happy.` },
  { text: `He can’t make a decision. He is in a …..`, options: ["quandary","quail","quest","quantity"], correct: 0, explanation: `"In a quandary" means uncertainty.` },
  { text: `“Superficial” is the antonym of …..`, options: ["shallow","paramount","profound","astounding"], correct: 2, explanation: `Antonym of "superficial" is "profound."` },
  { text: `Don’t put …. Today’s work until tomorrow.`, options: ["away","up with","off","down"], correct: 2, explanation: `"Put off" means postpone.` },
  { text: `The state has taken some ….. steps to combat terrorism.`, options: ["exabberating","fragile","proactive","factual"], correct: 2, explanation: `"Proactive" means taking action in advance.` },
  { text: `Never ….. confidence in a traitor.`, options: ["replace","seek","select","place"], correct: 3, explanation: `"Place confidence in" means trust.` },
  { text: `We should ….. scientists on different occasions.`, options: ["honor","owe","own","claim"], correct: 0, explanation: `"Honor" means show respect.` },
  { text: `Jehan ….. herself near the door of the metro to be able to get off quickly.`, options: ["located","possessed","positioned","proposed"], correct: 2, explanation: `"Positioned herself" means placed herself.` },
  { text: `What is the ….. of payment you prefer.`, options: ["method","approach","process","procedure"], correct: 0, explanation: `"Method of payment" is standard.` },
  { text: `You must act very quickly. It’s …..`, options: ["frustrating","urgent","flexible","enthusiastic"], correct: 1, explanation: `"Urgent" means requiring immediate action.` },
  { text: `This shop has a …. Of fashionable t-shirts and dresses that we can choose from.`, options: ["vary","various","variety","varied"], correct: 2, explanation: `"A variety of" means a range.` },
  { text: `We are used to ….. abroad.`, options: ["travel","travelling","traveled","be travelling"], correct: 1, explanation: `After "used to" (accustomed), use gerund.` },
  { text: `The news is really worth …..`, options: ["mention","to mention","to mentioning","mentioning"], correct: 3, explanation: `After "worth," use gerund.` },
  { text: `Gamal has taken some protective measures since his house ….. into.`, options: ["broke","was broken","has broken","has been broken"], correct: 1, explanation: `Passive: "was broken into."` },
  { text: `While the food was being cooked, I ….. my lessons.`, options: ["was studying","studied","was studied","was being studied"], correct: 0, explanation: `Past continuous: "was studying."` },
  { text: `Rasha ….. for five hours when her computer broke down.`, options: ["has been typing","had been typed","had typed","had been typing"], correct: 3, explanation: `Past perfect continuous: "had been typing."` },
  { text: `The book ….. until we had had the permit.`, options: ["didn’t publish","hadn’t published","wasn’t published","hadn’t been published"], correct: 2, explanation: `Passive simple past: "wasn't published."` },
  { text: `Try …. The catalogue to know how to operate the machine.`, options: ["reading","to read","to be reading","read"], correct: 0, explanation: `"Try + gerund" means experiment with an action.` },
  { text: `We …. Forget that tourism is important for our country.`, options: ["mustn’t","needn’t","may not","oughtn’t"], correct: 0, explanation: `"Mustn't" is appropriate to stress not forgetting.` },
  { text: `I regret not phoning my mother on her birthday. I ….. that.`, options: ["should do","shouldn’t do","should have done","must have done"], correct: 2, explanation: `"Should have done" expresses regret about a past action.` },
  { text: `I can’t find my watch. It …..`, options: ["must have stolen","must have been stolen","should have been stolen","could have been stolen"], correct: 1, explanation: `"Must have been stolen" is a deduction about a past passive action.` },
  { text: `I …. Deliver the file to my boss today. It’s very important.`, options: ["have to","must","don’t have to","would rather"], correct: 0, explanation: `"Have to" expresses external obligation.` },
  { text: `Ali didn’t come to the meeting. He ….. my message.`, options: ["couldn’t have received","could have received","shouldn’t have received","must have received"], correct: 0, explanation: `"Couldn’t have received" is a deduction about past impossibility.` },
  { text: `He ….. from his company to look for a better job.`, options: ["retreated","retired","resigned","signed"], correct: 2, explanation: `"Resigned" means quit a job.` },
  { text: `We need a kind of ….. after this hard work.`, options: ["recreation","recuperation","restoration","renewal"], correct: 0, explanation: `"Recreation" means leisure for relaxation.` },
  { text: `I left my glasses on my school desk. I hope someone ….. it.`, options: ["must have found","can’t have found","might have found","should have found"], correct: 2, explanation: `"Might have found" expresses possibility about the past.` },
  { text: `It is one of the most exciting matches which I will never forget …..`, options: ["to watch","watch","watches","watching"], correct: 3, explanation: `After "forget," use gerund for past memory.` },
  { text: `I collected all ….. we will need.`, options: ["that","which","what","when"], correct: 0, explanation: `"All that" means everything which.` }
];

async function seedGeneralExercisesVolume2() {
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
      title: `General Vol2 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: i === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: genCategory._id,
      source: "General-Volume2",
      tags: ["general","volume2"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} General Exercises Volume 2 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "General-Volume2" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing General-Volume2 quizzes`);

    const chunk = 18; // five quizzes of 18, last one will include remaining 19
    const created = [];
    for (let i = 0; i < 6; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Volume 2, Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `General Exercises — Volume 2 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "General-Volume2",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: genCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} General Exercises Volume 2 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding General Exercises Volume 2:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedGeneralExercisesVolume2();
