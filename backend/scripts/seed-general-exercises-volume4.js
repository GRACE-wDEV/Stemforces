import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// General Exercises — Volume 4: 130 questions → 5 quizzes × 26 questions
const raw = [
  { text: `To be employable, you should always get ….. with the latest technology.`, options: ["knowledgeable","acquaintance","acquainted","promoted"], correct: "acquainted", explanation: `"Get acquainted with" means become familiar with.` },
  { text: `Some businessmen ….. some scholarships for clever and talented students.`, options: ["subside","subsidize","surpass","surmount"], correct: "subsidize", explanation: `"Subsidize" means to financially support.` },
  { text: `Hamdy was appointed as a ….. servant twenty years ago.`, options: ["civil","civilized","mineral","customary"], correct: "civil", explanation: `"Civil servant" is a government employee.` },
  { text: `Supposing we had no extra expenses, what …..?`, options: ["you will do","will you do","you would do","would you do"], correct: "would you do", explanation: `In hypothetical situations use "would" in the question form.` },
  { text: `I read a novel ….. the main character was a secret agent.`, options: ["whose","which","in which","about which"], correct: "in which", explanation: `"In which" refers to the novel's content or setting.` },
  { text: `He won’t phone us until he …. All the required tasks because there is a deadline.`, options: ["has finished","finish","had finished","was finished"], correct: "has finished", explanation: `"Until" with present perfect indicates completion before a later action.` },
  { text: `He reads a lot in different fields ….. he can be cultured and knowledgeable.`, options: ["so that","because","in order to","however"], correct: "so that", explanation: `"So that" expresses purpose.` },
  { text: `By the time he ….. from his European tour next week, his new series of books will have been published.`, options: ["returned","had returned","returns","will return"], correct: "returns", explanation: `Use present simple in the subordinate clause after "by the time" for future reference.` },
  { text: `The whole family were ….. by the alarming news.`, options: ["delighted","shocking","amputated","agitated"], correct: "agitated", explanation: `"Agitated" means anxious or disturbed.` },
  { text: `We warned him and asked him not to take matters lightly but he ….. his shoulders indifferently.`, options: ["shook","shrugged","contested","twisted"], correct: "shrugged", explanation: `"Shrugged his shoulders" = gesture of indifference.` },
  { text: `Regretting making mistakes and the primk of conscience are healthy …..`, options: ["phantoms","amenities","demerits","symptoms"], correct: "symptoms", explanation: `Regret and conscience are signs (symptoms) of moral health.` },
  { text: `The building has a ….. dome that gives it a magnificent appearance.`, options: ["colossal","tiny","grim","minute"], correct: "colossal", explanation: `"Colossal" = huge, suitable for a magnificent dome.` },
  { text: `Yehia is ….. conscientious employee I have ever seen. He is really efficient.`, options: ["least","more","most","the most"], correct: "the most", explanation: `Use superlative "the most" with "I have ever seen".` },
  { text: `He is nosy. He does not stop ….. in other people’s affairs.`, options: ["meddling","conflicting","blackmailing","comprehending"], correct: "meddling", explanation: `"Meddle in" = interfere.` },
  { text: `We usually use ….. to avoid being harsh.`, options: ["criticism","mannerism","escapism","euphemism"], correct: "euphemism", explanation: `A "euphemism" is a mild term used to avoid harshness.` },
  { text: `My ….. object in this struggle is to save the union.`, options: ["trivial","cowardly","paramount","mundane"], correct: "paramount", explanation: `"Paramount" = most important.` },
  { text: `They asked the secretary why ….. prepared the reports.`, options: ["she hasn’t","hasn’t she","she hadn’t","she didn’t"], correct: "she hadn’t", explanation: `Backshift in reported speech: present perfect -> past perfect.` },
  { text: `New bridges ….. in different parts of our country recently.`, options: ["had been built","have been built","were built","are being built"], correct: "have been built", explanation: `Present perfect passive for recent actions with present relevance.` },
  { text: `I assure you that what happened was not arranged beforehand. It was sheer …..`, options: ["commencement","coincidence","calamity","carelessness"], correct: "coincidence", explanation: `"Sheer coincidence" = pure chance.` },
  { text: `Rapidness is one of the undeniable features of our ….. age.`, options: ["temporary","permanent","extemporaneous","contemporary"], correct: "contemporary", explanation: `"Contemporary age" = present time.` },
  { text: `Do you remember ….. to the circus?`, options: ["being taken","to be taken","taking","to take"], correct: "being taken", explanation: `"Remember + gerund" refers to a past memory; passive gerund if you were taken.` },
  { text: `I ….. for Canada next Monday. Everything is prepared.`, options: ["am going to leave","am leaving","will leave","leave"], correct: "am leaving", explanation: `Present continuous for fixed future plans.` },
  { text: `As soon as the plane ….. off, he felt dizzy.`, options: ["has taken","has been taken","had taken","had been taken"], correct: "had taken", explanation: `Past perfect for an action completed before another past action.` },
  { text: `This is the neighbor in ….. house we met yesterday.`, options: ["what","which","where","whose"], correct: "whose", explanation: `"In whose house" = possessive relative pronoun.` },
  { text: `“Undertake” is synonymous to the phrasal verb take …..`, options: ["off","on","down","to"], correct: "on", explanation: `"Take on" = undertake.` },
  { text: `His reassuring words as a sincere friend ….. all my fears and doubts.`, options: ["repelled","dispelled","compelled","complied"], correct: "dispelled", explanation: `"Dispelled" = drove away fears.` },
  { text: `His approach in dealing with the problem turned out to be an ….. remedy.`, options: ["evolutionary","nutritious","cautious","efficacious"], correct: "efficacious", explanation: `"Efficacious" = effective.` },
  { text: `What an ….. day! I had a much better job and met my fiancée.`, options: ["evident","evasive","eventful","uneventful"], correct: "eventful", explanation: `"Eventful" = full of events.` },
  { text: `….. is pain and inflammation of the joints.`, options: ["encephalitis","arthritis","hepatitis","dermatitis"], correct: "arthritis", explanation: `"Arthritis" = joint inflammation.` },
  { text: `Although it has a kind of risk, his investments proved to be …..`, options: ["lucrative","permeable","ridiculous","ludicrous"], correct: "lucrative", explanation: `"Lucrative" = profitable.` },
  { text: `Cameras were installed in different angles for …..`, options: ["surveys","surrender","survival","surveillance"], correct: "surveillance", explanation: `Cameras used for surveillance = monitoring.` },
  { text: `The antonym of the word innocence is …..`, options: ["release","jail","guilt","gist"], correct: "guilt", explanation: `Opposite of innocence is guilt.` },
  { text: `We looked for him everywhere but there is no …… of him whatsoever.`, options: ["grace","brace","trace","bracelet"], correct: "trace", explanation: `"No trace" = no sign.` },
  { text: `I ….. you yesterday but I thought you might be busy.`, options: ["could visit","could have visited","must have visited","can’t have visited"], correct: "could have visited", explanation: `"Could have visited" = past possibility not acted upon.` },
  { text: `There was a trade ….. after the new policies had taken effect.`, options: ["loom","boom","doom","cone"], correct: "boom", explanation: `"Trade boom" = rapid growth.` },
  { text: `The word “announcement” is a synonym of the word …..`, options: ["advertisement","reclamation","declaration","deprivation"], correct: "declaration", explanation: `"Declaration" = formal statement.` },
  { text: `The doctor gave the employee a ….. sick leave.`, options: ["three-days","three-day’s","three-days’","three-day"], correct: "three-day", explanation: `Hyphenated compound adjective: "three-day sick leave."` },
  { text: `Look at the fuel ….. to see when we will need petrol.`, options: ["cage","rage","adage","gauge"], correct: "gauge", explanation: `"Fuel gauge" measures fuel level.` },
  { text: `We were made …. The homework again because there were a lot of mistakes in it.`, options: ["do","to be done","to do","be doing"], correct: "to do", explanation: `Passive: be made to do something.` },
  { text: `I’m so sorry. I really didn’t mean ….. your feelings.`, options: ["to hurt","to have been hurt","hurting","to hurting"], correct: "to hurt", explanation: `"Didn't mean to hurt" = no intent.` },
  { text: `The map can tell you about the …. Of the region.`, options: ["calligraphy","topography","oceanography","historiography"], correct: "topography", explanation: `"Topography" = physical features on a map.` },
  { text: `Time lost cannot be …..`, options: ["gained","remained","regarded","regained"], correct: "regained", explanation: `"Regained" = recovered.` },
  { text: `The project ….. out last year provided many job opportunities.`, options: ["carried","was carried","which carried","which was carrying"], correct: "carried", explanation: `Reduced relative clause: "project carried out."` },
  { text: `This university was ….. fifty years ago.`, options: ["finding","found","founded","founding"], correct: "founded", explanation: `"Founded" = established.` },
  { text: `He went here and there ….. the shops for a bargain.`, options: ["liftering","brawling","rolling","trawling"], correct: "trawling", explanation: `"Trawling the shops" = searching thoroughly.` },
  { text: `This issue has been ….. for years.`, options: ["voted","mooted","boosted","notified"], correct: "mooted", explanation: `"Mooted" = proposed or debated.` },
  { text: `The antonym of “permit” is …..`, options: ["foretell","forbid","forsake","embezzle"], correct: "forbid", explanation: `Opposite of permit is forbid.` },
  { text: `He was accused of …..`, options: ["flourishment","embezzlement","entertainment","refreshment"], correct: "embezzlement", explanation: `"Embezzlement" = theft of funds by a trustee.` },
  { text: `Police patrols arrested a gang who ….. people.`, options: ["mugged","plumbed","flustered","stole"], correct: "mugged", explanation: `"Mugged" = attacked and robbed.` },
  { text: `A new tax was …. On high-tech devices.`, options: ["supposed","composed","posed","imposed"], correct: "imposed", explanation: `"Imposed a tax" = levied.` },
  { text: `Everyone has the right ….. their own beliefs.`, options: ["in","for","to","at"], correct: "to", explanation: `"Right to" = correct preposition.` },
  { text: `The shock was too intense to ….. them.`, options: ["collapse","devastate","illuminate","mislead"], correct: "devastate", explanation: `"Devastate" = emotionally destroy.` },
  { text: `The ….. stood before the lawcourt and were waiting for the sentence.`, options: ["promoters","fliers","voters","culprits"], correct: "culprits", explanation: `"Culprits" = those accused of crime.` },
  { text: `There must be severe punishments for ….. of the law.`, options: ["violence","violation","evolution","vandalism"], correct: "violation", explanation: `"Violation of the law" = breaking the law.` },
  { text: `Nihal forgot …. Her homework, so she did it again.`, options: ["doing","to do","to doing","done"], correct: "doing", explanation: `"Forget + gerund" = forgot a past action.` },
  { text: `Some people are fond of raising ….. animals.`, options: ["wild","gigantic","domestic","contagious"], correct: "domestic", explanation: `"Domestic animals" = pets or farm animals.` },
  { text: `The car ….. on the freeway.`, options: ["shaped","campaigned","rated","stalled"], correct: "stalled", explanation: `"Stalled" = engine stopped.` },
  { text: `This car has a ... exhaust pipes.`, options: ["dual","loyal","ruling","bilingual"], correct: "dual", explanation: `"Dual exhaust" = two pipes.` },
  { text: `Who is the data …. By?`, options: ["prescribed","indebted","compiling","compiled"], correct: "compiled", explanation: `"Compiled by" = put together by someone.` },
  { text: `The antonym of “strict” is …..`, options: ["brilliant","cruel","obvious","lenient"], correct: "lenient", explanation: `Opposite of strict is lenient.` },
  { text: `They are too ….. to stay with them for a long time.`, options: ["bored","boring","interested","interesting"], correct: "boring", explanation: `They cause boredom -> "boring."` },
  { text: `I, as well as my friends, ….. good at English.`, options: ["am","are","be","have"], correct: "am", explanation: `Subject is "I", so verb is "am."` },
  { text: `They spent the whole day ….. for the exam of chemistry.`, options: ["to study","studying","to studying","of studying"], correct: "studying", explanation: `After "spend time" use gerund.` },
  { text: `The policeman threatened ….. the punishment for the law breakers.`, options: ["to punish","to be punished","punishing","being punished"], correct: "to punish", explanation: `"Threaten to do" = warn of intention.` },
  { text: `I feel like ….. tea.`, options: ["to drink","drink","having drunk","drinking"], correct: "drinking", explanation: `"Feel like + gerund."` },
  { text: `This place is worth ….. even though it is off the beaten track.`, options: ["to visit","visiting","visit","visited"], correct: "visiting", explanation: `After "worth" use gerund.` },
  { text: `Nuclear weapons are usually used as power for …..`, options: ["armament","essence","deterrence","reference"], correct: "deterrence", explanation: `Nuclear weapons function as deterrence.` },
  { text: `Ramy was up in ….. when he was fired from his work without doing anything wrong.`, options: ["elbows","arms","chests","ears"], correct: "arms", explanation: `"Up in arms" = angry/protesting.` },
  { text: `….. care must be given to this vital issue.`, options: ["raw","less","few","due"], correct: "due", explanation: `"Due care" = proper care.` },
  { text: `Many people think that human resources are the most important …… for progress and prosperity.`, options: ["mayors","tellers","pillars","merchandise"], correct: "pillars", explanation: `"Pillars" = key supports.` },
  { text: `Despite the countless challenges, he won against all ……`, options: ["roads","currents","moods","odds"], correct: "odds", explanation: `"Against all odds" = despite difficulties.` },
  { text: `All I want is to ….. the gap between them to become good friends again.`, options: ["wield","stitch","widen","bridge"], correct: "bridge", explanation: `"Bridge the gap" = reduce differences.` },
  { text: `If the law of the ….. spreads, Chaos will surely dominate the scene.`, options: ["ring","jungle","well","will"], correct: "jungle", explanation: `"Law of the jungle" = survival of strongest.` },
  { text: `I’m fully committed to ….. my promises and pledges.`, options: ["fulfill","fulfilling","fulfilled","fulfills"], correct: "fulfilling", explanation: `"Committed to" takes gerund.` },
  { text: `The medical committee ….. the supposed miracle drug.`, options: ["generated","debunked","detested","resuscitated"], correct: "debunked", explanation: `"Debunked" = exposed as false.` },
  { text: `The ….. is the hard outside part of a tree.`, options: ["park","bark","ring","root"], correct: "bark", explanation: `"Bark" = tree's outer layer.` },
  { text: `“Dilate” is the antonym of …..`, options: ["expand","extend","contract","vomit"], correct: "contract", explanation: `Opposite of dilate is contract.` },
  { text: `It’s time you ….. now.`, options: ["stop","stopped","have stopped","are stopping"], correct: "stopped", explanation: `"It's time" + past subjunctive => "stopped."` },
  { text: `Travelling by train isn’t …… comfortable as travelling by plane.`, options: ["such","too","enough","so"], correct: "so", explanation: `Negative comparison uses "not so...as."` },
  { text: `We ….. because of drowsiness, fatigue or boredom.`, options: ["separate","smuggle","yawn","wheeze"], correct: "yawn", explanation: `"Yawn" = due to tiredness.` },
  { text: `He had a slight ….. in his ankle.`, options: ["spread","scuffle","restraint","sprain"], correct: "sprain", explanation: `"Sprain" = joint injury.` },
  { text: `…… is a lung disease.`, options: ["insomnia","pneumonia","mania","amnesia"], correct: "pneumonia", explanation: `"Pneumonia" = lung infection.` },
  { text: `After ….. the situation, they began to make the plan.`, options: ["assessing","investing","associating","arguing"], correct: "assessing", explanation: `"Assessing" = evaluating.` },
  { text: `His voice is so ….. that you can easily recognize it.`, options: ["conscientious","instinctive","immediate","distinctive"], correct: "distinctive", explanation: `"Distinctive" = unique/recognizable.` },
  { text: `“Conscientious” is one of the synonyms of …..`, options: ["diligent","intelligent","intellectual","practical"], correct: "diligent", explanation: `"Conscientious" = diligent.` },
  { text: `We all ….. for a better life but this must be accompanied by hard work and discipline.`, options: ["tear","succumb","belong","yearn"], correct: "yearn", explanation: `"Yearn for" = desire strongly.` },
  { text: `His reply was ….. and to the point.`, options: ["successive","superstitious","suppressive","succinct"], correct: "succinct", explanation: `"Succinct" = concise.` },
  { text: `Do not let anyone provoke you. Be calm and have nerves of …..`, options: ["steal","steel","iron","diamond"], correct: "steel", explanation: `"Nerves of steel" idiom.` },
  { text: `He was jealous of his colleague as he received all the …..`, options: ["credit","debit","demerits","ticket"], correct: "credit", explanation: `"Receive credit" = get recognition.` },
  { text: `Charles Babbage, the inventor of the calculator, was a maths …..`, options: ["ancestor","descendant","progeny","prodigy"], correct: "prodigy", explanation: `"Prodigy" = person with exceptional talent.` },
  { text: `The verb (exclude) is an antonym for …..`, options: ["compass","encompass","conclude","influence"], correct: "encompass", explanation: `Opposite of exclude is encompass (include).` },
  { text: `You must ….. a balance between family and work.`, options: ["do","perform","require","strike"], correct: "strike", explanation: `"Strike a balance" idiom.` },
  { text: `…… in mind that revision before exams is very important and fruitful.`, options: ["Consider","Stuff","Raise","Bear"], correct: "Bear", explanation: `"Bear in mind" = remember.` },
  { text: `He knew it like the ….. of his hand.`, options: ["side","front","back","palm"], correct: "back", explanation: `"Back of one's hand" idiom.` },
  { text: `To accomplish all my hopes and wishes, I will leave everything at your ……`, options: ["disposal","proposal","refusal","dismissal"], correct: "disposal", explanation: `"At your disposal" = available for use.` },
  { text: `You should always keep ….. your principles and morals.`, options: ["to","on","up with","back"], correct: "to", explanation: `"Keep to" = adhere to.` },
  { text: `We should ….. the way for what we want to do.`, options: ["save","prove","approve","pave"], correct: "pave", explanation: `"Pave the way" = prepare.` },
  { text: `To summarize something is to make it …..`, options: ["conscious","disguise","comprise","concise"], correct: "concise", explanation: `"Concise" = brief.` },
  { text: `He was honoured ….. to achieving brilliant success.`, options: ["because","thanking","owing","owning"], correct: "owing", explanation: `"Owing to" = because of.` },
  { text: `Your work is really ….., Samy!`, options: ["impress","impressed","impression","impressive"], correct: "impressive", explanation: `"Impressive" = admirable.` },
  { text: `My mother went on a shopping …..`, options: ["tour","expedition","excursion","picnic"], correct: "expedition", explanation: `"Shopping expedition" = trip for shopping.` },
  { text: `One of the synonyms of the word “genuine” is …..`, options: ["genius","synthetic","enthusiastic","authentic"], correct: "authentic", explanation: `"Authentic" = genuine.` },
  { text: `I couldn’t reach my destination at all. It was really a …..`, options: ["phase","breeze","phrase","maze"], correct: "maze", explanation: `"Maze" = confusing network.` },
  { text: `The …… of the queen was so fantastic and so many people attended it.`, options: ["procession","succession","prohibition","process"], correct: "procession", explanation: `"Procession" = parade.` },
  { text: `It is a ….. evidence about which there is no doubt.`, options: ["cutting","cute","clear-cut","contradictory"], correct: "clear-cut", explanation: `"Clear-cut" = definite.` },
  { text: `They smiled at me …..`, options: ["friend","friendly","in friendly","in a friendly way"], correct: "in a friendly way", explanation: `Adverbial phrase describing how they smiled.` },
  { text: `I was frightened when someone knocked at the door …..`, options: ["hard","hardy","hardness","hardly"], correct: "hard", explanation: `"Knocked hard" = forcefully.` },
  { text: `It is ….. honour for me. I’m so proud of it.`, options: ["such","such a","such an","so"], correct: "such an", explanation: `"Such an honour" (honour starts with vowel sound).` },
  { text: `This topic deserves …… interest.`, options: ["much","many","a lot","few"], correct: "much", explanation: `"Interest" uncountable -> "much."` },
  { text: `It is ….. fast a train that we never travel in our car.`, options: ["so","such","too","enough"], correct: "so", explanation: `"So fast a train" structure.` },
  { text: `It’s ….. early to visit them now.`, options: ["early enough","such an early","too early","very early"], correct: "too early", explanation: `"Too early" = not a good time.` },
  { text: `…. Of the five tourists can speak Arabic.`, options: ["every","both","neither","each"], correct: "each", explanation: `"Each of the five" = individual.` },
  { text: `How …. Time do you need to finish this task?`, options: ["many","long","much","often"], correct: "much", explanation: `"How much time" for uncountable time.` },
  { text: `Have a seat. There is ….. news I want to tell you.`, options: ["much","many","plenty","any"], correct: "much", explanation: `"News" uncountable -> "much."` },
  { text: `He refused to take ….. money though he was in bad need of it.`, options: ["some","any","few","a"], correct: "any", explanation: `"Any" used in negative/refusal contexts.` },
  { text: `Never ….. that again!`, options: ["you should do","should do","should you do","do you should do"], correct: "should you do", explanation: `Inversion after negative introductory adverb: "should you do."` },
  { text: `I’d rather you ….. that again.`, options: ["do","did","doing","to do"], correct: "did", explanation: `After "I'd rather" use past subjunctive.` },
  { text: `This is the man from ….. I got the information.`, options: ["who","where","whose","whom"], correct: "whom", explanation: `Object of preposition "from" -> whom.` },
  { text: `She was very pleased with ….. she had heard.`, options: ["which","that","whom","what"], correct: "what", explanation: `"What" = the thing which.` },
  { text: `The area …. I visited yesterday is really pleasant.`, options: ["where","when","which","what"], correct: "which", explanation: `"Which" as object of visited.` },
  { text: `Charles Dickens is a novelist ….. works appeal to many people worldwide.`, options: ["who","whom","who’s","whose"], correct: "whose", explanation: `"Whose" possessive.` },
  { text: `…. He leave now, he will arrive on time.`, options: ["If","Had","Were","Should"], correct: "Should", explanation: `Inverted conditional: "Should he leave..."` },
  { text: `Do you remember the day ….. you got your phd?`, options: ["on that","in which","on which","on whom"], correct: "on which", explanation: `"On which" refers to the day.` },
  { text: `Ramzy is not ….. to buy this villa.`, options: ["too rich","so rich","enough rich","rich enough"], correct: "rich enough", explanation: `"Rich enough" = sufficient wealth.` },
  { text: `He said that China ….. the most densely- populated country in the world.`, options: ["is","was","had been","would be"], correct: "is", explanation: `General truth uses present tense.` },
  { text: `He is ….. kind to everyone that we all appreciate him.`, options: ["too","so","such","such a"], correct: "so", explanation: `"So kind that" structure.` },
  { text: `Mount Everest is ….. high.`, options: ["extreme","incredible","extremity","extremely"], correct: "extremely", explanation: `Adverb modifies "high."` },
  { text: `They can hardly walk and ….. can i.`, options: ["so","either","none","neither"], correct: "neither", explanation: `"Neither can I" = negative agreement.` },
  { text: `She didn’t leave home today and I didn’t, …..`, options: ["too","either","neither","also"], correct: "either", explanation: `Negative agreement uses "either."` }
];

async function seedGeneralExercisesVolume4() {
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
      title: `General Vol4 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: opt.toLowerCase().trim() === q.correct.toLowerCase().trim() })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: genCategory._id,
      source: "General-Volume4",
      tags: ["general","volume4"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} General Exercises Volume 4 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "General-Volume4" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing General-Volume4 quizzes`);

    const chunk = 26; // 5 quizzes of 26 => 130 total
    const created = [];
    for (let i = 0; i < 5; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Volume 4, Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `General Exercises — Volume 4 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "General-Volume4",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: genCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} General Exercises Volume 4 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding General Exercises Volume 4:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedGeneralExercisesVolume4();
