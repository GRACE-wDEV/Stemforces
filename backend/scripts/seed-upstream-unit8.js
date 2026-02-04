import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Unit 8: 119 questions provided by user. We'll create 7 quizzes of 17 questions each (7 * 17 = 119).
const raw = [
  { text: "Companies are prohibited .... from firing staff without good reason.", options: ["by chance","by the way","by law","by the book"], correct: 2, explanation: '"By law" means according to legal rules. Firing without good reason is legally prohibited.' },
  { text: "Tony had to take extra classes in order to .... his school work.", options: ["keep to","keep up with","keep back","keep on"], correct: 1, explanation: '"Keep up with" means to maintain pace.' },
  { text: "I have been asked to .... a list of all those who are willing to work overtime this week.", options: ["compile","condense","condemn","compel"], correct: 0, explanation: '"Compile" means to gather information into a list or report.' },
  { text: "I hope the meeting doesn't .... for too long; I have an appointment at four o'clock.", options: ["drag down","drag out","drag in","drag on"], correct: 3, explanation: '"Drag on" means to continue for longer than desired.' },
  { text: "Julie has been working on her homework .... all evening; she really makes an effort with her studies.", options: ["assessment","assignment","tutorial","finals"], correct: 1, explanation: '"Assignment" refers to homework or a task given to students.' },
  { text: "Carl has been given a .... pay increase, so he is able to afford a new car.", options: ["severe","substantial","spontaneous","sheltered"], correct: 1, explanation: '"Substantial" means large or significant.' },
  { text: "I really must .... my tennis skills before the match on Saturday.", options: ["flick through","pluck out","brush up on","pull down"], correct: 2, explanation: '"Brush up on" means to improve or refresh one\'s skills.' },
  { text: "I have told him time and time again not to .... the younger children, but he just doesn't listen.", options: ["coax","bribe","coerce","bully"], correct: 3, explanation: '"Bully" means to intimidate or mistreat others.' },
  { text: "I can't stand the way Robert thinks he is better than everyone else; he is so ....", options: ["arrogant","exuberant","voracious","opinionated"], correct: 0, explanation: '"Arrogant" means having an exaggerated sense of one\'s importance.' },
  { text: "I don't know why you asked Sam to .... the journey; he's always getting lost.", options: ["irrigate","cultivate","navigate","secrete"], correct: 2, explanation: '"Navigate" means to plan or direct a route.' },
  { text: "To be successful in any field usually requires ....", options: ["perseverance","persecution","prescription","persimmon"], correct: 0, explanation: '"Perseverance" means continued effort despite difficulties.' },
  { text: "It was .... that he would fail his exams as he had hardly studied at all.", options: ["inexact","inexpert","inevitable","invariable"], correct: 2, explanation: '"Inevitable" means certain to happen.' },
  { text: "Without a .... it was impossible to tell which way we should be going.", options: ["compass","campus","ruler","watch"], correct: 0, explanation: 'A compass is used for direction.' },
  { text: "She is so nosy; she is always trying to .... in other people's affairs.", options: ["middle","meddle","mettle","merge"], correct: 1, explanation: '"Meddle" means interfere.' },
  { text: "It was extremely .... to see Kate get her degree, especially as I had helped her with her studies throughout her course.", options: ["gratifying","gratifyingly","gratified","grateful"], correct: 0, explanation: '"Gratifying" means giving satisfaction.' },
  { text: "Richer countries should do more to help the victims of .... in third- world countries.", options: ["feminine","femininity","famine","family"], correct: 2, explanation: '"Famine" means extreme shortage of food.' },
  { text: "Even though he was rich and successful, he did not .... his working class roots and always remembered where he came from.", options: ["miss","dismiss","disable","disagree"], correct: 1, explanation: '"Dismiss" here means to reject or disregard.' },
  { text: "There is a .... of staff at this school, which means that classes are much larger than they should be.", options: ["shortage","stoppage","shorthand","shortness"], correct: 0, explanation: '"Shortage" means not enough.' },
  { text: "Why don't we do something .... like throwing a party tonight!", options: ["simultaneous","spontaneous","spooky","sporadic"], correct: 1, explanation: '"Spontaneous" means unplanned or impulsive.' },
  { text: "It is hard for us to understand how the universe really is, because our brains cannot conceive of such great distances.", options: ["minute","tiny","extravagant","immense"], correct: 3, explanation: '"Immense" means extremely large.' },
  { text: "All homes should be fitted with a to ensure that people have an early warning in the event of a fire.", options: ["smoke detector","sprinkler system","multiplication table","kitchen machine"], correct: 0, explanation: 'A smoke detector provides early warning of fire.' },
  { text: "Only minor changes should be made at the stage as you should only be checking for typing errors.", options: ["editing","scanning","proof-reading","cramming"], correct: 2, explanation: 'Proof-reading is the final check for typographical errors.' },
  { text: "We can't that the operation will be successful, but there is a 95 percent chance that it will work.", options: ["guarantee","assuage","encompass","think"], correct: 0, explanation: '"Guarantee" means promise with certainty.' },
  { text: 'The term "let someone go" is often used as a(n) for firing someone.', options: ["slogan","oxymoron","euphemism","contraband"], correct: 2, explanation: 'A euphemism is a mild term for something harsh.' },
  { text: "I can't stand talking to people who never listen to my point of view.", options: ["bigoted","opinionated","arrogant","greedy"], correct: 1, explanation: "\"Opinionated\" means having very strong opinions and unwilling to consider others." },
  { text: "Steve has such a appetite; he never stops eating!", options: ["voracious","wide","wretched","perverse"], correct: 0, explanation: '"Voracious" means having a huge appetite.' },
  { text: "He was sure he had failed his exam, so he was delighted to find that he had passed", options: ["with flying colours","the grade","by heart","by the sideway"], correct: 0, explanation: '"Pass with flying colours" means to pass with distinction.' },
  { text: "Can you help me to memorise this passage? I have to learn it for tomorrow's lesson.", options: ["by chance","by and large","by law","by heart"], correct: 3, explanation: '"Learn by heart" means to memorize completely.' },
  { text: "Without a degree, it can be hard to get your foot in the of any business these days.", options: ["way","grade","door","gate"], correct: 2, explanation: '"Get your foot in the door" is an idiom meaning to get an initial opportunity.' },
  { text: "I can't believe the teacher didn't like my essay; I put my heart and into writing it.", options: ["mind","spirit","soul","fingers"], correct: 2, explanation: "The idiom is \"put one's heart and soul into\" meaning to put in great effort." },
  { text: "Now, you need to make a good impression on your new teachers, so mind", options: ["the grade","with flying colours","by heart","your P's and Q's"], correct: 3, explanation: "\"Mind your P's and Q's\" means be careful about your behavior." },
  { text: "Stanley knows all about history, so why don't you pick his instead of asking me all these questions?", options: ["attention","information","brains","eyes"], correct: 2, explanation: "\"Pick someone's brains\" is an idiom meaning to ask for advice or information." },
  { text: "There's no way Gary will get lost; he knows the woods like", options: ["his fingers","the back of his hands","the book","the streets"], correct: 1, explanation: "\"Know something like the back of one's hand\" means to know very well." },
  { text: "Ben didn't get a promotion. Even though he works hard, he just doesn't make", options: ["the grade","the degree","job","decision"], correct: 0, explanation: '"Make the grade" means to reach the required standard.' },
  { text: "The naughty children were suspended from school in the hope that it would teach them", options: ["by heart","by the book","a lesson","the grade"], correct: 2, explanation: '"Teach someone a lesson" means to punish to improve behavior.' },
  { text: "All our travel arrangements fell by when the airline company went bankrupt.", options: ["the way","the wayside","the book","and large"], correct: 1, explanation: '"Fall by the wayside" is an idiom meaning to fail or be abandoned.' },
  { text: "A: I liked the music. B: The was written by Elton John.", options: ["script","lines","score","writing"], correct: 2, explanation: 'A "score" refers to the written music for a film or show.' },
  { text: "She didn't go to university; she got her MA through distance", options: ["schooling","learning","education","teaching"], correct: 1, explanation: '"Distance learning" is the standard term.' },
  { text: "The government will pay the fees for those who go on to train as teachers.", options: ["tuition","schooling","teaching","learning"], correct: 0, explanation: '"Tuition fees" are the standard term for charges for instruction.' },
  { text: "The school board are disappointed with this year's poor A-level", options: ["degrees","outcomes","results","qualifications"], correct: 2, explanation: '"Exam results" is the standard phrase.' },
  { text: "The suspect claims he was . into leaking the information.", options: ["made","convinced","pressed","coerced"], correct: 3, explanation: '"Coerced" means forced.' },
  { text: "It was obvious he was only . interest in my proposal.", options: ["affecting","pretending","forging","copying"], correct: 1, explanation: '"Pretending interest" means feigning or faking interest.' },
  { text: "Many . of reptiles are popular as pets.", options: ["varieties","types","forms","species"], correct: 3, explanation: '"Species" is the biological term.' },
  { text: "As far as the weather is concerned, we can expect a . performance of last year's low temperatures.", options: ["repeat","revised","recurring","persistent"], correct: 0, explanation: '"Repeat performance" is an idiom meaning the same thing happening again.' },
  { text: "It's important to keep . with developments in teaching methods.", options: ["up","back","on","to"], correct: 0, explanation: '"Keep up with" means stay informed about.' },
  { text: "The Chairman's speech dragged . until it was time to leave.", options: ["in","on","out","down"], correct: 1, explanation: '"Drag on" means continue tediously.' },
  { text: "A few people will be kept . in the accounts department, but the rest of the administrative staff will have to go.", options: ["up","back","on","to"], correct: 2, explanation: '"Kept on" means retained in a job.' },
  { text: "Inspector Lynch insists on doing everything . the book. He's a stickler for rules and regulations.", options: ["with","on","in","by"], correct: 3, explanation: '"By the book" means strictly according to rules.' },
  { text: "I don't know what you're worried about; there is nothing . it. Just jump!", options: ["with","on","in","to"], correct: 3, explanation: "\"There's nothing to it\" is an idiom meaning it's very easy." },
  { text: "Professor Frost is . the old school; he believes in discipline and respect.", options: ["at","in","of","from"], correct: 2, explanation: '"Of the old school" means having traditional views.' },
  { text: "We discovered the hotel quite . chance when we lost our way.", options: ["with","on","in","by"], correct: 3, explanation: '"By chance" means accidentally.' },
  { text: "If you want your business to succeed, you have to keep . a plan.", options: ["with","on","in","to"], correct: 3, explanation: '"Keep to a plan" means stick to it.' },
  { text: "Don't let your friends drag you . Stand up for yourself.", options: ["in","on","out","down"], correct: 3, explanation: '"Drag down" means to make someone feel depressed or lower their standards.' },
  { text: "The exam results were . and large, pretty good this year.", options: ["with","on","in","by"], correct: 3, explanation: '"By and large" is an idiom meaning generally or on the whole.' },
  { text: "The school is thought to be highly innovative in that it implements a system of continuous . to determine grades.", options: ["tests","assessment","finals","quizzes"], correct: 1, explanation: '"Continuous assessment" is an educational term.' },
  { text: "One could hear the sound of lively . coming from the room where the philosophy class was being held.", options: ["quarrel","debate","talk","argument"], correct: 1, explanation: '"Debate" implies a structured, intellectual discussion.' },
  { text: "My brother, who wants to join the clergy, has just entered a .", options: ["seminary","university","course","college"], correct: 0, explanation: 'A "seminary" is a school for training clergy.' },
  { text: "It was inevitable that the . would be well- attended as it was being given by the renowned professor, Kurt Reimann.", options: ["seminar","lecture","tutorial","seminary"], correct: 1, explanation: 'A "lecture" is a formal talk to an audience.' },
  { text: "There's no way I'll be able to come. I've got to hand in a two thousand word . on the Russian Revolution by Monday afternoon.", options: ["assignment","project","paragraph","essay"], correct: 3, explanation: 'An "essay" is a short piece of writing on a subject.' },
  { text: "Stephen was caught ...... from his fellow student's test paper and was expelled.", options: ["copying","plagiarising","stealing","robbing"], correct: 0, explanation: '"Copying" in an exam means looking at someone else\'s work.' },
  { text: "If you're really interested in applying, ask the university to send you a ...... for the upcoming year.", options: ["prospect","syllabus","prospectus","curriculum"], correct: 2, explanation: 'A "prospectus" is a published booklet detailing a university\'s courses.' },
  { text: "I must say for a woman who is supposed to be articulate, the Dean's welcoming speech was quite", options: ["boring","pleasant","moving","inspirational"], correct: 0, explanation: 'The contrast with "articulate" suggests disappointment.' },
  { text: "The life of Anne Sullivan, Helen Keller's teacher, serves as a(n) ...... message to all of those who work with the disabled.", options: ["boring","pleasant","spatial","inspirational"], correct: 3, explanation: 'Anne Sullivan\'s story is motivating and uplifting.' },
  { text: "The head girl's words were very ...... , and several of her fellow classmates were in tears before she finished.", options: ["boring","pleasant","moving","organized"], correct: 2, explanation: '"Moving" means emotionally touching.' },
  { text: "The kindergarten teacher had a(n) ...... singing voice, and as a result her young students loved the time they spent learning new songs.", options: ["boring","pleasant","ugly","pleased"], correct: 1, explanation: 'A "pleasant" voice is nice to listen to.' },
  { text: "Most schools in the country have opted to teach ...... Greek as opposed to ancient Greek.", options: ["modern","advanced","new","old"], correct: 0, explanation: '"Modern Greek" is the contemporary language.' },
  { text: "The elderly professor was let go as he refused to change his ...... teaching practices.", options: ["modern","advanced","new","archaic"], correct: 3, explanation: '"Archaic" means outdated or old-fashioned.' },
  { text: "I am sorry, but our institution seeks to maintain a traditional standard; your ideas are just to ...... for us.", options: ["ancient","conventional","advanced","suitable"], correct: 2, explanation: '"Advanced" means progressive or ahead of the times.' },
  { text: "The reference book was published over 20 years ago, so some of the information it contains is probably rather ......", options: ["modern","advanced","new","dated"], correct: 3, explanation: '"Dated" means old or out-of-date.' },
  { text: "My parents earned a(n) ...... income and were unable to send me to music classes.", options: ["extravagant","substantial","immense","modest"], correct: 3, explanation: '"Modest income" means not large.' },
  { text: "Her ...... praise embarrassed the child so badly that he refused to draw any more pictures in art class.", options: ["extravagant","substantial","natural","normal"], correct: 0, explanation: '"Extravagant praise" means excessive or over-the-top.' },
  { text: "To the head master's ...... delight, each and every one of his pupils was accepted into Oxford university.", options: ["extravagant","little","immense","modest"], correct: 2, explanation: '"Immense delight" means very great joy.' },
  { text: "Although he paid a(n) ...... amount of money for his daughter's education, she has never held down a steady job.", options: ["extravagant","little","moderate","modest"], correct: 0, explanation: '"Extravagant amount" means a very large sum.' },
  { text: "In the past, many history books were ...... towards those countries that had lost wars.", options: ["biased","tolerant","open-minded","based"], correct: 0, explanation: '"Biased" means unfairly prejudiced.' },
  { text: "You may well have a PhD in philosophy, but to my mind you are both ...... and racist.", options: ["based","tolerant","open-minded","bigoted"], correct: 3, explanation: '"Bigoted" means intolerant and prejudiced.' },
  { text: "My grandfather is very opinionated about certain things, but at least he is ...... of co- educational schooling.", options: ["biased","tolerant","bigoted","based"], correct: 1, explanation: '"Tolerant" means accepting of different practices.' },
  { text: "His ...... attitudes towards progressive education won him a position at the prestigious college.", options: ["biased","bigoted","open-minded","based"], correct: 2, explanation: '"Open-minded" means receptive to new ideas.' },
  { text: "John's excuse for not doing his homework was that he had been too tired, but the teacher this as nonsense.", options: ["dismissed","denied","ignored","refused"], correct: 0, explanation: '"Dismissed" means rejected as unimportant.' },
  { text: "Gable's theory a lot of interest from the scientific community.", options: ["pulled","took","attracted","engaged"], correct: 2, explanation: '"Attract interest" is a common collocation.' },
  { text: "The of new technology is bound to revolutionise the function of the classroom.", options: ["approach","entrance","opening","advent"], correct: 3, explanation: '"Advent" means arrival or coming.' },
  { text: "Writing is generally considered a more task than reading.", options: ["severe","thorough","demanding","critical"], correct: 2, explanation: '"Demanding" means requiring much effort.' },
  { text: "The library will be in the old building on Bridge Street.", options: ["sheltered","housed","included","contained"], correct: 1, explanation: '"Housed" means located or accommodated in a building.' },
  { text: "learning has proved highly popular in remote parts of Australia and Canada.", options: ["Post graduate","Higher","Long-distance","Compulsory"], correct: 2, explanation: '"Long-distance learning" is education where the student is far from the institution.' },
  { text: "In the UK schooling lasts up until the age of sixteen.", options: ["Post graduate","Higher","Long-distance","Compulsory"], correct: 3, explanation: '"Compulsory schooling" is required by law.' },
  { text: "Nowadays, a certificate does not necessarily guarantee a place in the job market.", options: ["school-leaving","compulsory","long-distance","2-year"], correct: 0, explanation: 'A "school-leaving certificate" is awarded after compulsory education.' },
  { text: "Please forward the £ 100 fee along with your completed application.", options: ["tuition","registration","learning","schooling"], correct: 1, explanation: '"Registration fee" is charged to enroll or apply.' },
  { text: "Stella already has a Bachelor of Arts, but she is now working towards attaining a degree.", options: ["first-rate","school-leaving","long-distance","Master's"], correct: 3, explanation: 'A "Master\'s degree" is the next level after a Bachelor\'s.' },
  { text: "My father opened a bank account for me on the day I was born to ensure that I would receive a education.", options: ["compulsory","formal","higher","post-graduate"], correct: 2, explanation: '"Higher education" refers to university-level study.' },
  { text: "Now I've got this job abroad, I think I had better take a ... course in Spanish.", options: ["refresher","post graduate","compulsory","higher"], correct: 0, explanation: 'A "refresher course" is to update existing skills.' },
  { text: "It will take him at least a year to earn a diploma in child psychology.", options: ["Post graduate","Higher","Long-distance","Compulsory"], correct: 0, explanation: 'A diploma in a specialized field is typically post-graduate.' },
  { text: "Now Johnny, if you're coming to see your sister in the school play, you're to be quiet and ...", options: ["make the grade","mind your P's and Q's","pass with flying colours","be of the old school"], correct: 1, explanation: '"Mind your P\'s and Q\'s" means be on your best behavior.' },
  { text: "I can remember as a child the difficult time I had learning multiplication tables ...", options: ["by heart","by memory","by brain","by mind"], correct: 0, explanation: '"Learn by heart" is the idiom for memorizing.' },
  { text: "Don't mind your father. He and believes that some jobs are just not meant to be done by a man.", options: ["as easy as one, two, three","of the old school","the teacher's pet","with flying colours"], correct: 1, explanation: '"Of the old school" means having traditional views.' },
  { text: 'The children jeered their classmate in the school yard with the cruel chant of, "Suzie ....!"', options: ["is the teacher's pet","is of the old school","is as easy as on, two, three","made the grade"], correct: 0, explanation: '"Teacher\'s pet" is a student favored by the teacher.' },
  { text: "Everybody here is fine, and Steve has just finished his finals, which he ...", options: ["made the grade","passed with flying colours","knew like the back of his hand","learnt by heart"], correct: 1, explanation: '"Pass with flying colours" means pass excellently.' },
  { text: "If you don't study harder, there is no way that you will .", options: ["make the grade","learn by heart","be the teacher's pet","be of the old school"], correct: 0, explanation: '"Make the grade" means achieve the required standard.' },
  { text: "I've been studying this list of historical dates for hours, and I", options: ["am of the old school","am the teacher's pet","know them like the back of my hand","mind my P's and Q's"], correct: 2, explanation: '"Know like the back of my hand" means know very well.' },
  { text: "There's nothing to geometry; it", options: ["is the teacher's pet","is of the old school","is as easy as on, two, three","made the grade"], correct: 2, explanation: '"As easy as one, two, three" means very simple.' },
  { text: "Her plans to become a teacher fell by the ... when she was forced to drop out of school to look after her younger siblings.", options: ["way","and large","chance","wayside"], correct: 3, explanation: '"Fell by the wayside" means abandoned or failed.' },
  { text: "By the ...., did you know that Susan finished at the top of her graduating class?", options: ["way","and large","chance","wayside"], correct: 0, explanation: '"By the way" is used to introduce a side comment.' },
  { text: "By ...., I found my old school uniform while I was cleaning out the attic.", options: ["book","and large","chance","wayside"], correct: 2, explanation: '"By chance" means accidentally.' },
  { text: "We heard about the private school by", options: ["book","and large","word of mouth","wayside"], correct: 2, explanation: '"By word of mouth" means through informal spoken communication.' },
  { text: "If we are going to do this right, we'll have to do it by", options: ["the book","and large","chance","wayside"], correct: 0, explanation: '"By the book" means following rules strictly.' },
  { text: "Don't worry if you don't understand the theory behind it; you'll catch on by", options: ["way","and large","and by","wayside"], correct: 2, explanation: '"By and by" means eventually or in due course.' },
  { text: "By ...., the number of people leaving school without obtaining a qualification is not on the rise.", options: ["way","and large","the book","the wayside"], correct: 1, explanation: '"By and large" means generally or on the whole.' },
  { text: "By ...., all institutes of learning must be equipped with smoke detectors and sprinkler systems.", options: ["chance","the wayside","word of mouth","law"], correct: 3, explanation: '"By law" means required by legal regulation.' },
  { text: "You've had all the advantages in the world. Why would you get involved with that man when he'd only drag you ....?", options: ["down","out","on","in"], correct: 0, explanation: '"Drag down" means to lower someone\'s standards or morale.' },
  { text: "your study plan throughout the academic year and you're sure to do well.", options: ["Keep back","Keep to","keep on","Drag down"], correct: 1, explanation: '"Keep to a plan" means stick to it consistently.' },
  { text: "In order to .... your classmate during your recovery, you'll have to do a lot of revising at home.", options: ["keep back","keep to","keep on","keep up with"], correct: 3, explanation: '"Keep up with" means maintain the same pace as others.' },
  { text: "The teacher managed to drag a confession .... the naughty pupil.", options: ["in","on","out of","down"], correct: 2, explanation: '"Drag a confession out of" means to force someone to confess.' },
  { text: "I keep .... 10% of my pay each week for when Tommy attends university.", options: ["to","up with","on","back"], correct: 3, explanation: '"Keep back" means save or reserve money.' },
  { text: "Why did you .... the fact that you had never graduated in front of your new boss?", options: ["drag on","drag in","drag out of","keep on"], correct: 1, explanation: '"Drag in" means introduce an irrelevant or unwanted topic.' },
  { text: "The lecture .... well into the afternoon.", options: ["dragged on","dragged in","dragged out of","kept on"], correct: 0, explanation: '"Dragged on" means continued tediously.' },
  { text: "The college kept the elderly gardener .... even after he was too old to do much work.", options: ["in","back","on","up with"], correct: 2, explanation: '"Kept on" means continued to employ.' },
  { text: "The arrogant young man managed to ...... the information that he had three post- graduate degrees.", options: ["drag in","drag down","keep back","keep on"], correct: 0, explanation: '"Drag in" means to introduce a topic.' },
  { text: "As the long winter ......, the poor student pored over her text books night after night.", options: ["dragged on","dragged in","dragged out of","kept on"], correct: 0, explanation: '"Dragged on" means passed slowly and tediously.' },
  { text: "Even though he worked a full time job while getting his diploma, Sam managed to ...... his studies.", options: ["keep back","keep up with","keep on","drag in"], correct: 1, explanation: '"Keep up with his studies" means maintain the required level.' },
  { text: "A good lecture will ...... the syllabus in order not to confuse students.", options: ["keep back","keep up with","keep on","keep to"], correct: 3, explanation: '"Keep to the syllabus" means stick to the planned topics.' },
  { text: "Just admit you plagiarised your essay; he will ...... you sooner or later anyway.", options: ["drag it out of","drag it in","drag it on","drag it down"], correct: 0, explanation: '"Drag it out of you" means force you to confess.' }
];

async function seedUnit8() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminUser = await mongoose.connection.db.collection("users").findOne({ role: "admin" });
    if (!adminUser) throw new Error("No admin user found. Create one first.");

    const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
    let upstreamCategory = await Category.findOne({ subject: "English", name: "Upstream" });
    if (!upstreamCategory) {
      console.log("Creating Upstream category...");
      upstreamCategory = await Category.create({ name: "Upstream", subject: "English", description: "Upstream English", quizCount: 0, questionCount: 0, active: true, created_by: adminUser._id });
    }

    const Question = mongoose.model("Question", new mongoose.Schema({}, { strict: false, timestamps: true }));

    const docs = raw.map((q, idx) => ({
      title: `Upstream Unit8 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: i === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: upstreamCategory._id,
      source: "Upstream-Unit8",
      tags: ["upstream","unit8","vocab"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} Unit 8 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "Upstream-Unit8" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Upstream-Unit8 quizzes`);

    const chunk = 17; // 7 quizzes of 17 each
    const created = [];
    for (let i = 0; i < 7; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Upstream Unit 8 - Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `Upstream Unit 8 — Part ${i + 1} (${slice.length} questions)`,
        subject: "English",
        category: upstreamCategory._id,
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
        source: "Upstream-Unit8",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} Unit 8 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding Unit 8:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUnit8();
