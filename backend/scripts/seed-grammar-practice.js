import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Grammar Practice: 140 questions -> 7 quizzes x 20
const raw = [
  { text: `Everyone .... to do something useful in their life, don't they?`, options: ["want","is wanting","wants","wanted"], correct: "wants", explanation: `"Everyone" is singular, so the verb must be singular: "wants."` },
  { text: `Ali .... the homework. When he has finished, he will go to bed.`, options: ["do","is doing","does","was doing"], correct: "is doing", explanation: `Present continuous "is doing" is used for an action happening now.` },
  { text: `I'm bored with you. You never let a day .... without asking for money.`, options: ["pass","passing","passes","to pass"], correct: "pass", explanation: `After "let," use the base form: "let a day pass."` },
  { text: `I don't like being with her. She .... agrees with me.`, options: ["doesn't","isn't","don't","never"], correct: "never", explanation: `"Never" means not at any time, fitting the context.` },
  { text: `When he had money, he always .... me.`, options: ["give","gave","gives","given"], correct: "gave", explanation: `Past habitual action uses past simple: "gave."` },
  { text: `When did Professor Yacoub retire? _ Twenty years ago, i .... .`, options: ["think","am thinking","thought","was thinking"], correct: "think", explanation: `Present simple "think" used for a current opinion.` },
  { text: `I know it was tiring. How long .... it take you to do it?`, options: ["is","was","does","did"], correct: "did", explanation: `Past simple "did" because the action is completed.` },
  { text: `What .... this time, yesterday?`, options: ["were you doing","have you done","are you doing","you did"], correct: "were you doing", explanation: `Past continuous for an action at a specific past time.` },
  { text: `My sister .... Biology at Cairo University. She is going to finish next year.`, options: ["has studied","studied","is studying","was studying"], correct: "is studying", explanation: `Present continuous for a current ongoing action.` },
  { text: `For how long .... this mobile? Aren't you going to buy a new one?`, options: ["do you have","have you got","are you having","have you had"], correct: "have you had", explanation: `Present perfect "have you had" for possession from past to present.` },
  { text: `Let me show you pictures of places in Egypt that you have never ....`, options: ["been","been to","gone","gone to"], correct: "been to", explanation: `"Have been to" means visited.` },
  { text: `I started a month ago. Since then I .... any time to see my friends.`, options: ["don't have","haven't had","didn't have","hadn't had"], correct: "haven't had", explanation: `"Since then" requires present perfect: "haven't had."` },
  { text: `My mother fell asleep while .... a film on TV.`, options: ["watching","was watching","watches","is watching"], correct: "watching", explanation: `After "while" a gerund or past continuous is possible; gerund fits.` },
  { text: `It has been more than five years since I .... you.`, options: ["see","have seen","saw","had seen"], correct: "saw", explanation: `After "since" use past simple for the starting point.` },
  { text: `Don't let children stand by you while you ....`, options: ["are cooking","have been cooking","were cooking","had been cooking"], correct: "are cooking", explanation: `Present continuous for action happening at same time.` },
  { text: `.... he always late for school? Yes, he never comes early.`, options: ["Is","Has","Does","Had"], correct: "Is", explanation: `"Is he late?" is correct because "late" is an adjective.` },
  { text: `I arrived here .... five o'clock, what time is it now?`, options: ["at","since","for","ago"], correct: "at", explanation: `Use "at" for specific times: "at five o'clock."` },
  { text: `He's lost a lot of weight .... he went into hospital.`, options: ["after","before","since","when"], correct: "since", explanation: `"Since" indicates from a past point to now.` },
  { text: `If you ask why .... out his money, he will say he likes helping people.`, options: ["does he give","he gives","did he give","has he given"], correct: "he gives", explanation: `In indirect questions use normal word order: "why he gives."` },
  { text: `I don't think he studies hard .... he has an exam.`, options: ["although","while","however","because"], correct: "although", explanation: `"Although" introduces contrast.` },
  { text: `When it rains, it .... me longer to get to school.`, options: ["has taken","takes","had taken","took"], correct: "takes", explanation: `Present simple for habitual action.` },
  { text: `He's paid well for the work he does, ....?`, options: ["isn't he","doesn't he","does he","hasn't he"], correct: "isn't he", explanation: `"He's paid" -> "isn't he?"` },
  { text: `By the time I go to the stadium, I .... that all the tickets 'd been sold.`, options: ["have told","was told","had told","had been telling"], correct: "was told", explanation: `Past simple passive "was told."` },
  { text: `.... you feel tired in the morning is that you go to bed late.`, options: ["Although","If","Because","The reason"], correct: "The reason", explanation: `"The reason ... is that" is correct.` },
  { text: `Phone on 2020 to know the answers to your questions and more .... our specialists.`, options: ["than","of","from","for"], correct: "from", explanation: `"From our specialists" means provided by them.` },
  { text: `I'd rather .... books and CDs online.`, options: ["to buy","buying","buy","to buying"], correct: "buy", explanation: `After "would rather" use base form.` },
  { text: `Gold is always the same price .... you buy it from this shop or that one.`, options: ["where","whether","which","either"], correct: "whether", explanation: `"Whether ... or" introduces alternatives.` },
  { text: `He refused .... by car, so we took a taxi.`, options: ["to go","go","going","goes"], correct: "to go", explanation: `After "refuse" use infinitive: "refused to go."` },
  { text: `Milk is not safe to drink .... you boil it.`, options: ["if","so that","unless","however"], correct: "unless", explanation: `"Unless" means except if.` },
  { text: `You work very hard. That's .... I want to go to a good university.`, options: ["why","if","because","so"], correct: "because", explanation: `"That's because" gives the reason.` },
  { text: `We .... work soon. Some equipment has already arrived on the site.`, options: ["will start","going to start","have started","are starting"], correct: "are starting", explanation: `Present continuous for a fixed plan.` },
  { text: `The wind is getting stronger. There .... a thunderstorm.`, options: ["is being","is going to be","will be","have been"], correct: "is going to be", explanation: `"Going to" for predictions based on evidence.` },
  { text: `Alexandria is the second .... city in Egypt after Cairo.`, options: ["large","larger","largest","very large"], correct: "largest", explanation: `"Second largest" is correct.` },
  { text: `Which is .... above sea level, Everest or Kilimanjaro?`, options: ["farthest","far","farther","far from"], correct: "farther", explanation: `Comparative "farther" for two items.` },
  { text: `I can't stay any .... although I'd like to. The kids are all alone at home.`, options: ["longest","long","longer","very long"], correct: "longer", explanation: `"Any longer" = any more time.` },
  { text: `The lion is .... stronger than the wolf.`, options: ["more","very","most","much"], correct: "much", explanation: `"Much" intensifies comparatives.` },
  { text: `Leila speaks English as .... as Riham.`, options: ["quick","good","soon","well"], correct: "well", explanation: `Use adverb "well" in comparisons.` },
  { text: `Ayman is .... tall than Hani.`, options: ["as","more","much","less"], correct: "less", explanation: `"Less tall than" means not as tall.` },
  { text: `I've answered very well. I've never taken a .... easy exam than this one.`, options: ["less","very","more","same"], correct: "less", explanation: `"Less easy" = more difficult.` },
  { text: `The .... dress you have ever bought me was the one from Paris.`, options: ["very beautiful","beautiful","more beautiful","most beautiful"], correct: "most beautiful", explanation: `Superlative "most beautiful."` },
  { text: `Nothing is .... exciting than traveling into space.`, options: ["as","most","very","more"], correct: "more", explanation: `Comparative "more exciting."` },
  { text: `How .... coffee did you drink? Two cups.`, options: ["many","much","a lot","a lot of"], correct: "much", explanation: `Coffee is uncountable -> "how much."` },
  { text: `China, .... is a country in Asia, has the fastest growing economy.`, options: ["where","what","which","that"], correct: "which", explanation: `Non-defining clause uses "which."` },
  { text: `People .... in gold often make a lot of money.`, options: ["trade","traded","trades","trading"], correct: "trading", explanation: `Reduced relative clause: "people trading."` },
  { text: `Most of the goods .... in China are sold in Africa and Europe.`, options: ["produce","produced","produces","producing"], correct: "produced", explanation: `Past participle passive: "produced."` },
  { text: `The supermarket chain .... she works for is the largest in Ireland.`, options: ["when","that","where","what"], correct: "that", explanation: `Defining relative clause: "that she works for."` },
  { text: `The factory .... my father works is a long way from our house.`, options: ["where","which","that","whose"], correct: "where", explanation: `"Where" refers to place.` },
  { text: `People .... work needs to be done at night, don't often have much sleep.`, options: ["who","which","that","whose"], correct: "whose", explanation: `Possessive relative: "whose work."` },
  { text: `I can not find the homework .... last night.`, options: ["which I did it","I did","that I did it","I did it"], correct: "I did", explanation: `Reduced relative clause: "the homework I did."` },
  { text: `This is the place .... I feel most comfortable.`, options: ["which","who","where","that"], correct: "where", explanation: `"Where" refers to a place.` },
  { text: `This is the place in .... the criminal was arrested.`, options: ["where","when","which","that"], correct: "which", explanation: `Formal "in which."` },
  { text: `She has four daughters and a son, .... means she has a lot to do at home.`, options: ["which","who","what","whom"], correct: "which", explanation: `"Which" refers to the whole previous clause.` },
  { text: `The woman .... hair is long and fair is the manager's new secretary.`, options: ["whose","that","which","who"], correct: "whose", explanation: `Possessive "whose hair."` },
  { text: `European and African customers are buying more things .... in China.`, options: ["that are making","made","were made","that made"], correct: "made", explanation: `Past participle passive: "made."` },
  { text: `A company in one country can sell .... it produces to other countries.`, options: ["what","which","that","where"], correct: "what", explanation: `"What" = the things which.` },
  { text: `At the weekend, I'll take you all to a place .... you have never been to.`, options: ["that","where","who","when"], correct: "that", explanation: `"That" as object of preposition "to."` },
  { text: `He used to be a millionaire. All people know he .... lots of money.`, options: ["has","has had","had","is having"], correct: "had", explanation: `Past simple "had" matches "used to be."` },
  { text: `She .... use to enjoy going to balls.`, options: ["isn't","doesn't","wasn't","didn't"], correct: "didn't", explanation: `Negative of "used to" is "didn't use to."` },
  { text: `My grandmother .... wears any of her jewellery.`, options: ["is used to","used to","was used to","no longer"], correct: "no longer", explanation: `"No longer wears" = she doesn't wear it anymore.` },
  { text: `Things are no longer cheap as they .... used to be.`, options: ["are","have","were","no word"], correct: "no word", explanation: `Correct phrase: "as they used to be."` },
  { text: `Oil .... to make plastic.`, options: ["uses","is used","used","using"], correct: "is used", explanation: `Passive: "Oil is used to make plastic."` },
  { text: `I .... English all day.`, options: ["revise","have revised","revises","have been revising"], correct: "have been revising", explanation: `Present perfect continuous emphasizes duration.` },
  { text: `We have .... France, Italy and Spain this summer.`, options: ["been visiting","visited","been visited","visiting"], correct: "visited", explanation: `Present perfect for completed actions with present relevance.` },
  { text: `Have you done the homework? Yes, I .... it an hour ago.`, options: ["have been doing","have done","have been done","did"], correct: "did", explanation: `Past simple with specific past time.` },
  { text: `I .... three cups of tea this morning.`, options: ["drink","have drunk","drank","have been drinking"], correct: "drank", explanation: `Past simple for completed actions in finished time period.` },
  { text: `It is the first time she .... a medal in the Olympic Games since 1988.`, options: ["wins","has been winning","is winning","has won"], correct: "has won", explanation: `Present perfect with "the first time."` },
  { text: `Since we started work yesterday, nothing useful has ....`, options: ["done","been done","does","been doing"], correct: "been done", explanation: `Present perfect passive.` },
  { text: `Arab traders have visited India and China .... the fourteenth century.`, options: ["since","in","at","for"], correct: "since", explanation: `Point in time with present perfect.` },
  { text: `Mathilde wanted to go to the ball but she didn't have a .... dress to wear.`, options: ["such good","good enough","so good","such a good"], correct: "good enough", explanation: `"Good enough" fits the structure.` },
  { text: `He suggested that she .... valuable jewellery from a friend of hers.`, options: ["borrow","borrowing","borrows","borrowed"], correct: "borrow", explanation: `Subjunctive/base form after "suggested that."` },
  { text: `In the past, people used to work .... longer hours than we do now.`, options: ["much","more","many","a few"], correct: "much", explanation: `"Much" intensifies comparatives.` },
  { text: `He .... to my wedding, he gave me a valuable present as well.`, options: ["not only came","neither came","did not come","either came"], correct: "not only came", explanation: `Correlative "not only... but also..."` },
  { text: `I knew him last year. Since then, we .... every week.`, options: ["Have met","meet","met","were meeting"], correct: "Have met", explanation: `Present perfect for repeated actions from past to present.` },
  { text: `Roman times, trade became very important.`, options: ["Since","while","for","during"], correct: "during", explanation: `"During Roman times" indicates period.` },
  { text: `Look at this dress! Beautiful,....?`, options: ["aren't you","will you","isn't it","does it"], correct: "isn't it", explanation: `Tag question for "It is beautiful."` },
  { text: `Hardly anyone can buy such a car,....?`, options: ["can he","can't he","can they","can't they"], correct: "can they", explanation: `Negative -> positive tag: "can they?"` },
  { text: `This is a wolf ....?`, options: ["isn't this","is it","it isn't","isn't it"], correct: "isn't it", explanation: `Tag for "This is" is "isn't it?"` },
  { text: `I don't think he is free now,....?`, options: ["is he","don't I","isn't he","do I"], correct: "is he", explanation: `Negative main clause -> positive tag.` },
  { text: `They never tell lies,....?`, options: ["don't they","do they","aren't they","doesn't it"], correct: "do they", explanation: `Negative -> positive tag.` },
  { text: `Look at this car. It's made in Egypt, .... it?`, options: ["isn't","hasn't","wasn't","didn't"], correct: "isn't", explanation: `Tag for "It is made" is "isn't it?"` },
  { text: `It's stopped raining, .... it?`, options: ["isn't","hasn't","didn't","wasn't"], correct: "hasn't", explanation: `"It has stopped" -> "hasn't it?"` },
  { text: `I'm no longer free as I used to be, .... I?`, options: ["am","am not","are","aren't"], correct: "am", explanation: `Negative -> positive tag: "am I?"` },
  { text: `Organic farmers .... buy expensive fertilisers and pesticides.`, options: ["must","have to","mustn't","don't have to"], correct: "must", explanation: `"Must" expresses necessity.` },
  { text: `Mr Shalaby, .... two farms near Ismailia, spends fortunes on chemicals.`, options: ["who's","that his","whose","who has"], correct: "who has", explanation: `"Who has" describes Mr Shalaby.` },
  { text: `He arrived too late. When he came, we .... for an hour or more.`, options: ["were working","had been working","have worked","are working"], correct: "had been working", explanation: `Past perfect continuous for duration before another past action.` },
  { text: `When the phone rang, she .... to answer it.`, options: ["has run","was running","ran","had been running"], correct: "ran", explanation: `Past simple for completed action.` },
  { text: `Ola sounded angry when I spoke to her. Perhaps she .... some bad news.`, options: ["will receive","were receiving","had received","had been receiving"], correct: "had received", explanation: `Past perfect indicates earlier event.` },
  { text: `We arrived at the stadium .... ten minutes before the match started.`, options: ["since","no word","during","for"], correct: "no word", explanation: `No preposition is needed.` },
  { text: `The manager changed the date of the conference, even though he .... sent out 20 invitations.`, options: ["has already","has already been","had already","had already been"], correct: "had already", explanation: `Past perfect: action before changing the date.` },
  { text: `So far today, I .... five delegations from five different countries.`, options: ["had met","had been meeting","have met","have been meeting"], correct: "have met", explanation: `Present perfect for actions up to now.` },
  { text: `Would you mind .... this letter tomorrow morning?`, options: ["to post","posting","will post","post"], correct: "posting", explanation: `After "Would you mind" use gerund.` },
  { text: `Could you tell me where .... buy most of your food?`, options: ["do you","will you","did you","you"], correct: "you", explanation: `Indirect question: no inversion.` },
  { text: `I spend .... time shopping in the street market than the supermarket.`, options: ["much","a long","some","less"], correct: "less", explanation: `Comparative: "less time ... than."` },
  { text: `I prefer the street market .... the supermarket.`, options: ["in","than","at","to"], correct: "to", explanation: `"Prefer ... to" is correct.` },
  { text: `People think that the Chinese .... ice cream in the 4th century BC.`, options: ["was invented","have invented","were invented","invented"], correct: "invented", explanation: `Active voice: "the Chinese invented."` },
  { text: `Most of the old inventions are still .... today.`, options: ["in use","using","to use","used for"], correct: "in use", explanation: `"In use" = being used.` },
  { text: `None of them knew the truth .... I had told them.`, options: ["until","when","unless","since"], correct: "until", explanation: `"Until" = up to the time when.` },
  { text: `They knew the truth .... I had told them.`, options: ["only if","until","only when","unless"], correct: "only when", explanation: `"Only when" = not before that time.` },
  { text: `It was not .... 1997 that the Femto second was discovered by Dr Zowail.`, options: ["in","since","at","until"], correct: "until", explanation: `Structure: "It was not until ... that."` },
  { text: `I don't think street markets are better than supermarkets, .... they?`, options: ["do","don't","are","aren't"], correct: "are", explanation: `Negative main clause -> positive tag.` },
  { text: `If you pour hot water onto ice, it ...`, options: ["would melt","melts","would have melted","is melting"], correct: "melts", explanation: `Zero conditional: present simple for facts.` },
  { text: `If people ... about unimportant things, their life would have no meaning.`, options: ["care","have cared","cared","had cared"], correct: "cared", explanation: `Second conditional hypothetical.` },
  { text: `If he ... more water in, it would have come over the top of the tank.`, options: ["put","had put","puts","was put"], correct: "had put", explanation: `Third conditional: if + past perfect.` },
  { text: `My parents used to encourage me. Without their encouragement, I ... so successful.`, options: ["wouldn't be","can't have been","will not be","wouldn't have been"], correct: "wouldn't have been", explanation: `Third conditional past unreal result.` },
  { text: `I wouldn't say it unless it ... true.`, options: ["were","had","was","did"], correct: "was", explanation: `Unless with present simple for real condition.` },
  { text: `He ... the world's news if he read the daily newspapers.`, options: ["would know","knows","will know","knew"], correct: "would know", explanation: `Second conditional.` },
  { text: `If he ... badly injured, he wouldn't have gone to hospital.`, options: ["isn't","hadn't had","wasn't","hadn't been"], correct: "hadn't been", explanation: `Third conditional passive.` },
  { text: `He would have friends if he ... cut himself from people.`, options: ["wasn't","doesn't","hadn't","didn't"], correct: "didn't", explanation: `Mixed conditional.` },
  { text: `... come yesterday if I'd phoned you?`, options: ["Did you have","Have you had","Will you have","Would you have"], correct: "Would you have", explanation: `Third conditional question.` },
  { text: `She didn't come to my wedding ... I had sent her an invitation.`, options: ["unless","although","if","even"], correct: "although", explanation: `"Although" introduces contrast.` },
  { text: `If he ... now, I'd tell him everything about it.`, options: ["phones","is phoning","phoned","will phone"], correct: "phoned", explanation: `Second conditional.` },
  { text: `If you ... a millionaire, would you help the poor people in your society?`, options: ["had","was","were","will be"], correct: "were", explanation: `Subjunctive: "if you were."` },
  { text: `If she ... English well, she'd get a job in a tourist company.`, options: ["speaks","is speaking","spoke","had spoken"], correct: "spoke", explanation: `Second conditional.` },
  { text: `If you ... 20 new English words for a test, how would you do it?`, options: ["will learn","learn","learned","must learn"], correct: "must learn", explanation: `Question about hypothetical necessity.` },
  { text: `I'd have gone shopping if I ... money.`, options: ["had","had had","was having","would have had"], correct: "had had", explanation: `Third conditional: had had.` },
  { text: `If he ... to the party yesterday, he'd have met his old friends.`, options: ["hadn't come","has come","came","had come"], correct: "had come", explanation: `Third conditional.` },
  { text: `Unless the tree had fallen down, the road ... have been blocked.`, options: ["would","wouldn't","should","shouldn't"], correct: "wouldn't", explanation: `Third conditional: unless = if not.` },
  { text: `If I had to stay for another day, I ... and inform you.`, options: ["will contact","would contact","would have contacted","would have been contacted"], correct: "would contact", explanation: `Mixed conditional.` },
  { text: `... we are too busy, it is always possible to do more.`, options: ["Although","Even","In spite of","Because"], correct: "Although", explanation: `"Although" introduces contrast.` },
  { text: `It was a difficult journey but we ... to reach the village before it got dark.`, options: ["managed","succeeded","failed","passed"], correct: "managed", explanation: `"Managed to" = succeeded.` },
  { text: `She ... because the book was very successful.`, options: ["can't worry","has to worry","worries","needn't have worried"], correct: "needn't have worried", explanation: `She worried unnecessarily.` },
  { text: `You ... touch the objects in the museum.`, options: ["have to","had to","needn't","mustn't"], correct: "mustn't", explanation: `Prohibition: "mustn't."` },
  { text: `You ... park there. There's a better place here.`, options: ["have to","mustn't","needn't","didn't have to"], correct: "needn't", explanation: `Not necessary: "needn't."` },
  { text: `I ... buy some bread from the shops. Don't let me forget!`, options: ["had to","have to","don't have to","must"], correct: "must", explanation: `Strong personal obligation.` },
  { text: `We ... run to the museum because it was already closed when we got there.`, options: ["don't have to","didn't have to","needn't have","have to"], correct: "needn't have", explanation: `We ran unnecessarily.` },
  { text: `Poor Walid broke his leg yesterday and ... to hospital.`, options: ["has to go","had to go","didn't have to go","needn't have gone"], correct: "had to go", explanation: `Past necessity.` },
  { text: `Mona ... take her sunglasses because it was cloudy.`, options: ["had to","has to","mustn't","didn't have to"], correct: "didn't have to", explanation: `Not necessary.` },
  { text: `No one ... disturb him while he's sleeping.`, options: ["mustn't","has to","must","can't"], correct: "must", explanation: `Instruction: "No one must disturb" meaning it is forbidden.` },
  { text: `He ... put some petrol in the car or it will stop.`, options: ["didn't have to","must","don't have to","has to"], correct: "has to", explanation: `External necessity.` },
  { text: `You ... late for your exam yesterday.`, options: ["should arrive","should have arrived","shouldn't have arrived","shouldn't arrive"], correct: "shouldn't have arrived", explanation: `Criticism about a past action.` },
  { text: `It ... very nice travelling in a tunnel full of steam!`, options: ["must have been","might be","can't have been","should have been"], correct: "can't have been", explanation: `Expresses impossibility.` },
  { text: `The underground ... travelling around Cairo easier.`, options: ["must have made","can't have made","must make","can't make"], correct: "must have made", explanation: `Deduction about past effect.` },
  { text: `He has only been in the laboratory for ten minutes. Surely, he ... have finished his experiment already.`, options: ["wouldn't","must","can't","won't"], correct: "can't", explanation: `Impossible given short time.` },
  { text: `Mother rang me and asked why I wasn't home. She ... read the note I had left her.`, options: ["can't have","must have","must","can't"], correct: "can't have", explanation: `Impossible that she read it.` },
  { text: `Rania lived in England for 20 years, so she ... English well.`, options: ["may speak","can't speak","must speak","doesn't speak"], correct: "must speak", explanation: `Logical deduction.` },
  { text: `I don't know why Ali can't walk. He ... ill.`, options: ["shouldn't be","can't be","must be","may be"], correct: "may be", explanation: `Possibility.` },
  { text: `That was a mistake. I ... on time to take the job.`, options: ["should have applied","must have applied","can't have applied","mustn't apply"], correct: "should have applied", explanation: `Regret about past action.` },
  { text: `Really, I can't remember you but you ... me.`, options: ["must have met","can't have met","might have met","must meet"], correct: "might have met", explanation: `Possibility in the past.` },
  { text: `That couple ... think much of this film. They're leaving already after 20 minutes!`, options: ["must","can't","should","could"], correct: "can't", explanation: `Impossible they think highly of it.` }
];

async function seedGrammarPractice() {
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
      title: `Grammar Practice Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: opt.toLowerCase().trim() === q.correct.toLowerCase().trim() })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: genCategory._id,
      source: "Grammar-Practice",
      tags: ["grammar","practice"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} Grammar Practice questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "Grammar-Practice" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Grammar-Practice quizzes`);

    const chunk = 20; // 7 quizzes of 20 => 140 total
    const created = [];
    for (let i = 0; i < 7; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Grammar Practice — Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `Grammar Practice — Part ${i + 1} (${slice.length} questions)`,
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
        source: "Grammar-Practice",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: genCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} Grammar Practice quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding Grammar Practice:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedGrammarPractice();
