import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

// All 100 Upstream MCQ questions with continuous numbering
const allQuestions = [
  // Progress Test 1 (Questions 1-20)
  { num: 1, text: 'Our main ________ is to reduce debt by cutting costs.', options: ['objective', 'resolution', 'decision', 'desire'], correct: 0, explanation: '"Objective" means a specific goal or target, which fits the context of reducing debt.' },
  { num: 2, text: 'The discovery of penicillin was a significant medical ________.', options: ['revolution', 'innovation', 'novelty', 'breakthrough'], correct: 3, explanation: 'A "breakthrough" is an important discovery that changes the field — penicillin was exactly that.' },
  { num: 3, text: "Employers are not allowed to discriminate against an applicant because of their social or financial ________.", options: ['past', 'history', 'background', 'precedent'], correct: 2, explanation: '"Background" refers to a person\'s social, financial, or educational history.' },
  { num: 4, text: "It's important to project a(n) ________ image during the interview.", options: ['upbeat', 'optimistic', 'positive', 'cheerful'], correct: 1, explanation: '"Optimistic" means hopeful and confident about the future, suitable for a professional impression.' },
  { num: 5, text: 'Aspirin was used as a medicine as far ________ as the 5th century BC.', options: ['back', 'beyond', 'behind', 'before'], correct: 0, explanation: '"As far back as" is a fixed phrase meaning "even in a distant past."' },
  { num: 6, text: 'Competitive ________ is an essential requirement for success in the entertainment industry.', options: ['mind', 'thought', 'spirit', 'soul'], correct: 2, explanation: '"Competitive spirit" means having the drive to compete and succeed.' },
  { num: 7, text: 'The brochure stated the hotel was situated ________ beside the sea.', options: ['direct', 'precise', 'right', 'exact'], correct: 2, explanation: '"Right beside" means immediately next to.' },
  { num: 8, text: 'There is a wide ________ of options to choose from, with something to suit all tastes.', options: ['degree', 'variance', 'scale', 'range'], correct: 3, explanation: '"Wide range" means a large variety.' },
  { num: 9, text: 'They say he inherited his money from a ________ relative he had never met.', options: ['faraway', 'remote', 'distant', 'slight'], correct: 2, explanation: '"Distant relative" means not closely related.' },
  { num: 10, text: "Carrie doesn't do her own washing; she ________ her little sister to do it for her.", options: ['makes', 'gets', 'puts', 'lets'], correct: 1, explanation: '"Gets someone to do something" means persuades or arranges for them to do it.' },
  { num: 11, text: 'When the workload got too much for him, he gave in and decided to ________.', options: ['allot', 'assign', 'entrust', 'delegate'], correct: 3, explanation: '"Delegate" means assign tasks to others.' },
  { num: 12, text: 'You must complete the Business ________ course satisfactorily before you can progress to the third year programme.', options: ['Morals', 'Values', 'Rights', 'Ethics'], correct: 3, explanation: '"Business Ethics" is a common course about moral principles in business.' },
  { num: 13, text: 'For the ________ of rewiring your home, hiring an electrician is a wise move.', options: ['aim', 'object', 'purpose', 'intention'], correct: 2, explanation: '"For the purpose of" means "in order to."' },
  { num: 14, text: 'He agreed to give me his car for the weekend on ________ that I helped him write his essay.', options: ['condition', 'term', 'rule', 'decree'], correct: 0, explanation: '"On condition that" means only if a certain requirement is met.' },
  { num: 15, text: 'The Beatles remain hugely popular among the ________ and the old alike.', options: ['youth', 'adolescents', 'young', 'teenagers'], correct: 2, explanation: '"The young" is a general term for young people, parallel to "the old."' },
  { num: 16, text: 'The manager really wanted Anna to join the company; he believed she would be a valuable ________ to his team of salespeople.', options: ['addition', 'supplement', 'accumulation', 'appendage'], correct: 0, explanation: '"Valuable addition" means a useful new member.' },
  { num: 17, text: 'Expect seminars and tutorials to ________ approximately 15% of your time at university.', options: ['cover', 'occupy', 'receive', 'complete'], correct: 1, explanation: '"Occupy" means take up (time).' },
  { num: 18, text: "Some say that success in today's competitive workplace calls for toughness and ________.", options: ['ruthlessness', 'rudeness', 'cruelty', 'callousness'], correct: 0, explanation: '"Ruthlessness" means being determined and without pity in a competitive sense.' },
  { num: 19, text: 'When he learned that the assistant manager was retiring, he felt that this was an opportunity he just had to ________.', options: ['grab', 'follow', 'pull', 'seize'], correct: 3, explanation: '"Seize an opportunity" is a fixed phrase meaning take it eagerly.' },
  { num: 20, text: 'For such an old house, it is in excellent ________.', options: ['state', 'condition', 'form', 'shape'], correct: 1, explanation: '"In excellent condition" is a standard phrase for something well-maintained.' },

  // Progress Test 2 (Questions 21-40)
  { num: 21, text: 'The boys have gone on a fishing ________ with their father.', options: ['trip', 'journey', 'trek', 'hike'], correct: 0, explanation: 'A "fishing trip" is the common phrase for a short outing to fish.' },
  { num: 22, text: 'The band gave a rousing ________ of the Stones\' classic "Brown Sugar".', options: ['translation', 'execution', 'rendition', 'edition'], correct: 2, explanation: '"Rendition" means a performance or version of a song.' },
  { num: 23, text: 'His voice was barely ________ above the loud music.', options: ['listened', 'audible', 'loud', 'clear'], correct: 1, explanation: '"Audible" means able to be heard.' },
  { num: 24, text: "I think you need a jacket; there's a ________ breeze blowing outside.", options: ['chilly', 'frosty', 'frigid', 'glacial'], correct: 0, explanation: '"Chilly breeze" means a cool, slightly cold wind.' },
  { num: 25, text: 'He stood on the ________ of the ship and watched the seagulls dive for fish.', options: ['floor', 'ground', 'platform', 'deck'], correct: 3, explanation: 'The "deck" is the outdoor floor area of a ship.' },
  { num: 26, text: 'The resort boasts a ________ beach and crystal clear sea.', options: ['pristine', 'faultless', 'pure', 'untouched'], correct: 0, explanation: '"Pristine" means clean, unspoiled — ideal for describing a beautiful beach.' },
  { num: 27, text: 'The brother and sister were ________ over who would get to inherit the beach house.', options: ['at large', 'at a standstill', 'at odds', 'at a loose end'], correct: 2, explanation: '"At odds" means in disagreement or arguing.' },
  { num: 28, text: 'Guests are requested to state their ________ for smoking or non-smoking accommodation upon booking.', options: ['likeness', 'care', 'preference', 'inclination'], correct: 2, explanation: '"Preference" means what you would like or choose.' },
  { num: 29, text: 'The city was under ________ for six months before it finally fell.', options: ['blockade', 'cordon', 'closure', 'siege'], correct: 3, explanation: '"Under siege" means surrounded by enemy forces trying to capture it.' },
  { num: 30, text: "It's impossible to travel in the ________ heat of the desert.", options: ['bubbling', 'smoldering', 'blistering', 'sizzling'], correct: 2, explanation: '"Blistering heat" means extremely hot.' },
  { num: 31, text: 'I enjoy taking a ________ bath as soon as I get home from work.', options: ['restful', 'gentle', 'soothing', 'mild'], correct: 2, explanation: '"Soothing bath" means relaxing and calming.' },
  { num: 32, text: 'Frank has been the ________ of the local history museum for over 10 years now.', options: ['curator', 'dean', 'escort', 'conductor'], correct: 0, explanation: 'A "curator" is in charge of a museum\'s collections.' },
  { num: 33, text: 'He found the fact that Susan had been saving money secretly quite ________.', options: ['discordant', 'discontinuing', 'disconcerting', 'discouraging'], correct: 2, explanation: '"Disconcerting" means unsettling or disturbing.' },
  { num: 34, text: 'The ceiling-high bookcase swayed for a few seconds, then crashed to the floor with a ________ noise.', options: ['vociferous', 'boisterous', 'raucous', 'deafening'], correct: 3, explanation: '"Deafening noise" means extremely loud.' },
  { num: 35, text: 'Use the ________ to drain the spaghetti, but make sure that you do it quickly enough so that it doesn\'t go cold.', options: ['whisk', 'colander', 'saucepan', 'grater'], correct: 1, explanation: 'A "colander" is a kitchen utensil with holes for draining pasta.' },
  { num: 36, text: 'After congratulating his team, the coach left, allowing the players to let their ________ down for a while.', options: ['hair', 'heads', 'hearts', 'souls'], correct: 0, explanation: '"Let your hair down" means relax and have fun.' },
  { num: 37, text: 'Turn to page 24 to find out at a ________ which courses are available to you.', options: ['look', 'glance', 'stare', 'glimpse'], correct: 1, explanation: '"At a glance" means with a quick look.' },
  { num: 38, text: 'Mrs Robinson ________ great pride in her cooking.', options: ['yells', 'finds', 'has', 'takes'], correct: 3, explanation: '"Takes pride in" means feels proud of.' },
  { num: 39, text: 'Sleep is ________ to our health, and lack of it can lead to many illnesses.', options: ['needed', 'required', 'essential', 'desirable'], correct: 2, explanation: '"Essential to" means absolutely necessary.' },
  { num: 40, text: 'The aircraft experienced severe ________ during the final approach, but the pilot kept his cool and landed it safely.', options: ['turbulence', 'instability', 'unsteadiness', 'wavering'], correct: 0, explanation: '"Turbulence" is sudden, violent movement of air affecting an aircraft.' },

  // Progress Test 3 (Questions 41-60)
  { num: 41, text: 'The suspect was seen ________ with intent outside of the jewellery store.', options: ['lying', 'waiting', 'loitering', 'standing'], correct: 2, explanation: '"Loitering" means hanging around without a clear purpose, often suspiciously.' },
  { num: 42, text: 'The careless driver was charged with ________.', options: ['manslaughter', 'murder', 'killing', 'homicide'], correct: 0, explanation: '"Manslaughter" is the crime of killing someone unintentionally, often through negligence.' },
  { num: 43, text: 'The ________ asked the judge to impose a life sentence because of the severity of the crime.', options: ['accuser', 'critic', 'prosecutor', 'juror'], correct: 2, explanation: 'The "prosecutor" is the lawyer who brings the case against the defendant in court.' },
  { num: 44, text: 'The decision to build a nuclear reactor in the area ________ a very strong reaction from the local community.', options: ['raised', 'originated', 'developed', 'produced'], correct: 0, explanation: '"Raised a reaction" means caused or provoked a response.' },
  { num: 45, text: "Paul's ability to ________ a challenge made him the perfect candidate to head up the new sales division.", options: ['control', 'handle', 'run', 'order'], correct: 1, explanation: '"Handle a challenge" means manage or deal with it successfully.' },
  { num: 46, text: 'Several members of the environmental group were arrested at the ________ scene.', options: ['force', 'stressing', 'compelling', 'pressure'], correct: 3, explanation: '"Pressure" relates to the context of pressure groups in activism.' },
  { num: 47, text: 'David Sylvester is considered to be a ________ authority on modern art.', options: ['leading', 'first', 'premier', 'main'], correct: 0, explanation: '"Leading authority" means most important or influential expert.' },
  { num: 48, text: 'Amnesty International is an internationally recognised ________ organisation.', options: ['humanitarian', 'human', "people's", 'popular'], correct: 0, explanation: '"Humanitarian organisation" focuses on human welfare and rights.' },
  { num: 49, text: 'Travellers should have no problem finding assistance as the organisation is ________ in several other European countries.', options: ['acted for', 'embodied', 'represented', 'stood for'], correct: 2, explanation: '"Represented in" means has a presence or offices in.' },
  { num: 50, text: 'The documentary skilfully depicts a nation ________ crisis.', options: ['in', 'on', 'under', 'at'], correct: 0, explanation: '"In crisis" is the correct phrase meaning experiencing a crisis.' },
  { num: 51, text: 'In Britain, ________ authorities are responsible for handling the budgets of public services.', options: ['regional', 'native', 'local', 'resident'], correct: 2, explanation: '"Local authorities" refers to local government bodies.' },
  { num: 52, text: "You'll have to go into the bank if you want money, the cash machine isn't ________ correctly.", options: ['practising', 'serving', 'exercising', 'functioning'], correct: 3, explanation: '"Functioning correctly" means working properly.' },
  { num: 53, text: "It's time the government ________ a stand against tax evaders and began prosecuting them.", options: ['had', 'took', 'got', 'gave'], correct: 1, explanation: '"Take a stand" means to adopt a firm position.' },
  { num: 54, text: "I'd like to make ________ for crashing your car. Let me pay for the repairs.", options: ['improvements', 'corrections', 'amends', 'adjustments'], correct: 2, explanation: '"Make amends" means compensate or make up for a wrong.' },
  { num: 55, text: "I don't want to sound like I'm ________ the law, but if you don't keep the noise down, you'll have to leave.", options: ['putting in', 'passing over', 'laying down', 'giving over'], correct: 2, explanation: '"Laying down the law" means asserting rules or authority.' },
  { num: 56, text: "The painting's value goes ________ economic measurement; it also has sentimental value.", options: ['far from', 'ahead of', 'beyond', 'outside'], correct: 2, explanation: '"Goes beyond" means exceeds or is more than.' },
  { num: 57, text: "It's the government's responsibility to ________ for the sick.", options: ['care', 'treat', 'guard', 'cure'], correct: 0, explanation: '"Care for" means look after or take care of.' },
  { num: 58, text: 'Sharon ________ the old man when she did some volunteer work at the shelter.', options: ['friend', 'made friends', 'became friends', 'befriended'], correct: 3, explanation: '"Befriended" means became a friend to.' },
  { num: 59, text: 'Nathan is taking part in a research ________ on the effects of GM foods.', options: ['job', 'task', 'mission', 'project'], correct: 3, explanation: '"Research project" is a common term for a planned study.' },
  { num: 60, text: 'America holds ________ elections every four years.', options: ['presidential', 'presiding', 'president', 'presided'], correct: 0, explanation: '"Presidential elections" are elections for the president.' },

  // Progress Test 4 (Questions 61-80)
  { num: 61, text: 'The front layer of the eye is called the ________.', options: ['eyelid', 'cornea', 'pupil', 'eyelash'], correct: 1, explanation: 'The "cornea" is the transparent front part of the eye covering the iris and pupil.' },
  { num: 62, text: "Jeff's constant coughing and ________ is a sign he should give up smoking.", options: ['wheezing', 'whooshing', 'whistling', 'whining'], correct: 0, explanation: '"Wheezing" is a whistling sound in the breath, often due to respiratory issues.' },
  { num: 63, text: 'The operation left him with a small ________ on his left cheek.', options: ['line', 'graze', 'injury', 'scar'], correct: 3, explanation: 'A "scar" is a mark left on skin after a wound or surgery heals.' },
  { num: 64, text: 'Arthritis causes the joints to become swollen and ________.', options: ['inflamed', 'flaming', 'flammable', 'inflammable'], correct: 0, explanation: '"Inflamed" means red, swollen, and painful, common with arthritis.' },
  { num: 65, text: "You shouldn't drive while taking this medication as it can cause ________ vision.", options: ['hazy', 'misty', 'vague', 'blurred'], correct: 3, explanation: '"Blurred vision" means unclear or fuzzy eyesight.' },
  { num: 66, text: 'He had to withdraw from the race because of a ________ muscle.', options: ['dragged', 'sprained', 'hung', 'pulled'], correct: 3, explanation: 'A "pulled muscle" means a strained or overstretched muscle.' },
  { num: 67, text: 'Following her collapse from exhaustion, the doctor recommended lots of bed ________.', options: ['sleep', 'rest', 'stay', 'leisure'], correct: 1, explanation: '"Bed rest" means staying in bed to recover health.' },
  { num: 68, text: 'The races were cancelled because the race ________ was waterlogged.', options: ['ring', 'rink', 'tarmac', 'track'], correct: 3, explanation: '"Race track" is the course for racing.' },
  { num: 69, text: 'A: "I\'ve had a ________ pain in my side all day." B: "It\'s probably indigestion."', options: ['whimpering', 'nagging', 'pestering', 'muttering'], correct: 1, explanation: '"Nagging pain" means persistent, annoying discomfort.' },
  { num: 70, text: 'A protective ________ will not only protect you if you fall but will also prevent injury from falling rocks from above.', options: ['cap', 'helmet', 'beret', 'bonnet'], correct: 1, explanation: 'A "helmet" is worn to protect the head from injury.' },
  { num: 71, text: 'The doctors think that there might be ________ bleeding.', options: ['inside', 'internal', 'innate', 'ingrown'], correct: 1, explanation: '"Internal bleeding" means bleeding inside the body.' },
  { num: 72, text: "Once released from the hospital, you'll have to return for another six weeks of outpatient ________.", options: ['action', 'dealing', 'handling', 'treatment'], correct: 3, explanation: '"Outpatient treatment" means medical care without staying overnight in hospital.' },
  { num: 73, text: 'We were invited to watch the game from the ________ box.', options: ['executive', 'luxury', 'managerial', 'special'], correct: 0, explanation: '"Executive box" is a private viewing area in a stadium.' },
  { num: 74, text: '________ swimming requires very light levels of fitness, as well as ability to move gracefully.', options: ['Simultaneous', 'Synchronised', 'Timely', 'Coordinated'], correct: 1, explanation: '"Synchronised swimming" is a sport involving coordinated movements in water.' },
  { num: 75, text: "Carol won't be back at work for some time; she's suffered a ________ breakdown.", options: ['mind', 'mental', 'psychic', 'nerve'], correct: 1, explanation: '"Mental breakdown" means severe emotional or psychological collapse.' },
  { num: 76, text: 'You have to have nerves of ________ to be an air traffic controller.', options: ['iron', 'metal', 'steel', 'granite'], correct: 2, explanation: '"Nerves of steel" is an idiom meaning very brave and calm under pressure.' },
  { num: 77, text: 'James never shows his emotions; no matter what happens, he always keeps a stiff upper ________.', options: ['mouth', 'eye', 'head', 'lip'], correct: 3, explanation: '"Stiff upper lip" means staying brave and not showing emotion in hardship.' },
  { num: 78, text: "Dave's been involved in a ________ accident at work. He's been taken to hospital.", options: ['wrong', 'bad', 'faulty', 'critical'], correct: 1, explanation: '"Bad accident" means serious or severe accident.' },
  { num: 79, text: 'Alternative medicine is ________ popularity in the West.', options: ['gaining', 'taking', 'adding', 'collecting'], correct: 0, explanation: '"Gaining popularity" means becoming more popular.' },
  { num: 80, text: 'The injury destroyed his hopes of being ________ world champion.', options: ['peaked', 'crowned', 'awarded', 'topped'], correct: 1, explanation: '"Crowned world champion" means officially declared or made champion.' },

  // Progress Test 5 (Questions 81-100)
  { num: 81, text: 'A: I liked the music to that film. B: Yes. The ________ was written by Elton John.', options: ['script', 'lines', 'score', 'writing'], correct: 2, explanation: '"Score" refers to the musical soundtrack of a film.' },
  { num: 82, text: "She didn't go to university; she got her MA through distance ________.", options: ['schooling', 'learning', 'education', 'teaching'], correct: 2, explanation: '"Distance education" means studying remotely, not on campus.' },
  { num: 83, text: 'The government will pay the ________ fees for those who go on to train as teachers.', options: ['tuition', 'schooling', 'teaching', 'learning'], correct: 0, explanation: '"Tuition fees" are charges for instruction at a school or university.' },
  { num: 84, text: 'Linda passed all of her exams with flying ________.', options: ['ease', 'colours', 'speed', 'looks'], correct: 1, explanation: '"With flying colours" means very successfully or with high marks.' },
  { num: 85, text: 'We engaged in a ________ debate on the causes of truancy.', options: ['vivid', 'alive', 'living', 'lively'], correct: 3, explanation: '"Lively debate" means energetic and animated discussion.' },
  { num: 86, text: "Pete says he doesn't need to study because he's awfully good at ________.", options: ['jamming', 'cramming', 'cramping', 'ramming'], correct: 1, explanation: '"Cramming" means studying intensively just before an exam.' },
  { num: 87, text: 'Go through this document and ________ any discrepancies with a coloured marker.', options: ['show up', 'stress', 'emphasise', 'highlight'], correct: 3, explanation: '"Highlight" means mark with a bright colour to draw attention.' },
  { num: 88, text: "If you want to draw a perfect circle, you'll have to use a ________.", options: ['drawer', 'roller', 'ruler', 'compass'], correct: 3, explanation: 'A "compass" is a drawing tool used to draw circles.' },
  { num: 89, text: 'In order to carry out this experiment, you need a test ________ and a Bunsen burner.', options: ['tube', 'cylinder', 'hose', 'pipe'], correct: 0, explanation: '"Test tube" is a glass tube used in chemistry experiments.' },
  { num: 90, text: 'The information contained in this guide book is too ________ to be of any use.', options: ['archaic', 'antiquated', 'early', 'outdated'], correct: 3, explanation: '"Outdated" means no longer current or useful.' },
  { num: 91, text: "I didn't realise Jean had such a ________ singing voice.", options: ['pleasurable', 'pleasant', 'pleased', 'pleasure'], correct: 1, explanation: '"Pleasant voice" means nice and agreeable to hear.' },
  { num: 92, text: "My grandfather didn't have a ________ education but he was an avid reader.", options: ['standard', 'formal', 'official', 'prescribed'], correct: 1, explanation: '"Formal education" means structured schooling.' },
  { num: 93, text: "Shirley gets away with handing in her homework late because she's the teacher's ________.", options: ['bird', 'dog', 'pet', 'cat'], correct: 2, explanation: '"Teacher\'s pet" means a student favored by the teacher.' },
  { num: 94, text: 'Although she was dedicated, Tania failed to make the ________ as a professional dancer.', options: ['success', 'top', 'grade', 'mark'], correct: 2, explanation: '"Make the grade" means reach the required standard.' },
  { num: 95, text: 'Among the ________ at the fair there is an aromatherapy and massage tent.', options: ['attractions', 'appeals', 'temptations', 'enticements'], correct: 0, explanation: '"Attractions" are interesting things to see or do.' },
  { num: 96, text: 'If you think you have a(n) ________ complaint, please put it in writing and address it to the complaints department.', options: ['lawful', 'authorised', 'legitimate', 'permissible'], correct: 2, explanation: '"Legitimate complaint" means a valid or justified grievance.' },
  { num: 97, text: 'All the major heads of state were present at the ________ of the agreement.', options: ['sign', 'signature', 'signing', 'signal'], correct: 2, explanation: '"Signing of the agreement" means the ceremony of signing it.' },
  { num: 98, text: 'Ed knows London like the back of his ________. He used to be a cab driver.', options: ['head', 'hand', 'mind', 'life'], correct: 1, explanation: '"Know something like the back of your hand" means know it extremely well.' },
  { num: 99, text: 'Applicants are required to pay a small registration ________ of £15.00 towards administration costs.', options: ['cash', 'prize', 'fee', 'bill'], correct: 2, explanation: '"Registration fee" is a charge to register for something.' },
  { num: 100, text: "They don't need to advertise; they get most of their business by word of ________.", options: ['mouth', 'legend', 'myth', 'ear'], correct: 0, explanation: '"By word of mouth" means through personal recommendations.' },
];

async function seedUpstreamMCQs() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get or create Upstream category for English
    const Category = mongoose.model("Category", new mongoose.Schema({
      name: String,
      subject: String,
      description: String,
      icon: String,
      color: String,
      order: Number,
      active: Boolean,
      quizCount: Number,
      questionCount: Number,
      created_by: mongoose.Schema.Types.ObjectId
    }));

    // Get admin user
    const adminUser = await mongoose.connection.db.collection("users").findOne({ role: "admin" });
    if (!adminUser) {
      throw new Error("No admin user found! Please create an admin user first.");
    }
    console.log("👤 Using admin user:", adminUser.name || adminUser.email);

    // Find or create Upstream category
    let upstreamCategory = await Category.findOne({ subject: "English", name: "Upstream" });
    
    if (!upstreamCategory) {
      console.log("📁 Creating 'Upstream' category for English...");
      upstreamCategory = await Category.create({
        name: "Upstream",
        subject: "English",
        description: "Upstream English vocabulary and grammar exercises",
        icon: "BookOpen",
        color: "#3b82f6",
        order: 0,
        active: true,
        quizCount: 0,
        questionCount: 0,
        created_by: adminUser._id
      });
    }
    console.log("📁 Using category:", upstreamCategory.name, "-", upstreamCategory._id);

    // Define Question model
    const Question = mongoose.model("Question", new mongoose.Schema({
      title: String,
      question_text: String,
      choices: [{
        id: String,
        text: String,
        is_correct: Boolean
      }],
      difficulty: String,
      time_limit_seconds: Number,
      subject: String,
      category: mongoose.Schema.Types.ObjectId,
      source: String,
      tags: [String],
      explanation: String,
      created_by: mongoose.Schema.Types.ObjectId,
      version: Number,
      published: Boolean,
      deleted_at: Date
    }, { timestamps: true }));

    // Create all questions
    console.log("📝 Creating 100 Upstream MCQ questions...");
    
    // Helper: generate a short, simple explanation for each question
    function generateSimpleExplanation(q) {
      try {
        const option = Array.isArray(q.options) && q.options[q.correct] ? q.options[q.correct] : '';
        let base = (q.explanation || '').toString().trim();
        // strip surrounding quotes if present
        base = base.replace(/^\"|\"$/g, '').replace(/^\'|\'$/g, '');
        // ensure it ends with a period
        if (base && !/[.!?]$/.test(base)) base = base + '.';
        // If explanation already contains the answer word, avoid repetition
        if (option && base.toLowerCase().includes(option.toLowerCase())) {
          return `Answer: ${option}. ${base}`;
        }
        return option ? `Answer: ${option}. ${base}` : base;
      } catch (e) {
        return q.explanation || '';
      }
    }

    const questionDocs = allQuestions.map((q) => ({
      title: `Upstream MCQ #${q.num}`,
      question_text: q.text,
      choices: q.options.map((opt, idx) => ({
        id: String(idx + 1),
        text: opt,
        is_correct: idx === q.correct
      })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: upstreamCategory._id,
      source: "Upstream",
      tags: ["vocabulary", "english", "upstream", "mcq"],
      explanation: generateSimpleExplanation(q),
      created_by: adminUser._id,
      version: 1,
      published: true,
      deleted_at: null
    }));

    // Delete existing Upstream questions first (optional - to avoid duplicates)
    const deleteResult = await Question.deleteMany({ 
      source: "Upstream", 
      subject: "English" 
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing Upstream questions`);

    // Insert all questions
    const insertResult = await Question.insertMany(questionDocs);
    console.log(`✅ Created ${insertResult.length} questions`);

    // Now create the Quiz
    const Quiz = mongoose.model("Quiz", new mongoose.Schema({
      title: String,
      description: String,
      subject: String,
      category: mongoose.Schema.Types.ObjectId,
      questions: [mongoose.Schema.Types.ObjectId],
      total_time: Number,
      per_question_time: Number,
      randomized: Boolean,
      show_results: Boolean,
      allow_review: Boolean,
      passing_score: Number,
      published: Boolean,
      attempts: Number,
      avg_score: Number,
      created_by: mongoose.Schema.Types.ObjectId
    }, { timestamps: true }));

    // Delete any existing quizzes sourced from Upstream for this category to avoid duplicates
    const delQuizRes = await Quiz.deleteMany({ subject: "English", category: upstreamCategory._id, source: "Upstream" }).catch(() => ({}));
    if (delQuizRes && delQuizRes.deletedCount !== undefined) console.log(`🗑️  Deleted ${delQuizRes.deletedCount} existing Upstream quizzes`);

    // Create 5 quizzes each with 20 questions (slices of the 100 questions)
    const chunkSize = 20;
    const createdQuizzes = [];
    for (let i = 0; i < 5; i++) {
      const slice = insertResult.slice(i * chunkSize, (i + 1) * chunkSize).map(q => q._id);
      if (slice.length === 0) continue;

      const quizDoc = await Quiz.create({
        title: `Upstream MCQs - Part ${i + 1}`,
        description: `Part ${i + 1} — 20 vocabulary and collocation questions from Upstream English textbook.`,
        subject: "English",
        category: upstreamCategory._id,
        questions: slice,
        total_time: chunkSize * 60, // total seconds for this part
        per_question_time: 60, // 60 seconds per question
        randomized: true,
        show_results: true,
        allow_review: true,
        passing_score: 60,
        published: true,
        attempts: 0,
        avg_score: 0,
        source: "Upstream",
        created_by: adminUser._id
      });
      createdQuizzes.push(quizDoc);
      console.log(`✅ Created quiz: "${quizDoc.title}" with ${quizDoc.questions.length} questions`);
    }

    // Update category counts
    await Category.updateOne(
      { _id: upstreamCategory._id },
      { 
        $set: { 
          questionCount: insertResult.length,
          quizCount: createdQuizzes.length
        }
      }
    );

    console.log("\n🎉 Done! Upstream MCQs have been seeded successfully.");
    console.log(`   📊 Total questions: ${insertResult.length}`);
    console.log(`   📝 Created quizzes: ${createdQuizzes.length}`);
    createdQuizzes.forEach((q, idx) => console.log(`      ${idx + 1}. ${q.title} (${q.questions.length} questions)`));
    console.log(`   📁 Category: ${upstreamCategory.name}`);
    console.log(`   📚 Subject: English`);

  } catch (error) {
    console.error("❌ Error seeding Upstream MCQs:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUpstreamMCQs();
