import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Unit 7: 183 questions provided by user. We'll create 7 quizzes: six with 26 questions and one with 27.
const raw = [
  { text: "The patient's disorder was quickly ______ but treating it would take much longer.", options: ["eradicated","contradicted","diagnosed","converted"], correct: 2, explanation: 'First identify the illness (diagnose), then treat it.' },
  { text: "The woman was suffering from a highly ______ disease so she was kept in isolation.", options: ["contagious","catching","infected","deadly"], correct: 0, explanation: 'Isolation is for diseases that spread easily: "contagious".' },
  { text: "One of the boxers was badly cut around the eye so the ______ stopped the fight.", options: ["judge","umpire","referee","arbiter"], correct: 2, explanation: 'In boxing the official who stops fights is the "referee".' },
  { text: "Sheila made an appointment with her doctor as she'd had a pain in her side for days.", options: ["nagging","fierce","distressing","critical"], correct: 0, explanation: '"Nagging" = persistent, prompting a visit.' },
  { text: "The tennis star walked off the ______ and refused to continue the game.", options: ["pitch","track","rink","court"], correct: 3, explanation: 'Tennis is played on a "court".' },
  { text: "My husband and I just can't ______ on the issue of private medical insurance.", options: ["turn a blind eye","see eye to eye","bat an eyelid","cast our eyes"], correct: 1, explanation: '"See eye to eye" = agree.' },
  { text: "Bob missed the last train so he put his luggage in ______ and set out to find a hotel for the night.", options: ["closet","locker","cupboard","dresser"], correct: 1, explanation: 'Public storage is a "locker".' },
  { text: "Angry demonstrators shouted ______ in protest against the government.", options: ["mottos","jingles","slogans","phrases"], correct: 2, explanation: 'Repeated protest phrases are "slogans".' },
  { text: "Tina found herself out of breath as she climbed the ______ flight of stairs.", options: ["sheer","high","abrupt","steep"], correct: 3, explanation: '"Steep" stairs make climbing difficult.' },
  { text: "From a very early age children are able to ______ Right from wrong.", options: ["distinguish","judge","decide","separate"], correct: 0, explanation: 'Fixed phrase: "distinguish right from wrong".' },
  { text: "The ______ in the man's left eye was so badly damaged that he needed a transplant.", options: ["corn","corner","cornea","cornet"], correct: 2, explanation: 'The eye part that can be transplanted is the "cornea".' },
  { text: "Cats' ______ expand enormously, which is why they can see well in the dark.", options: ["pupils","students","puppets","kittens"], correct: 0, explanation: 'The pupil adjusts to light.' },
  { text: "Suzie's ear infection was so bad that her ______ actually burst.", options: ["eardrop","eardrum","ear lobe","earflaps"], correct: 1, explanation: 'The thin membrane is the "eardrum".' },
  { text: "Richard had one of his ______ pierced because he wanted to wear a diamond earring.", options: ["eardrops","eardrums","ear lobes","earflaps"], correct: 2, explanation: 'Ear lobes are pierced.' },
  { text: "The patient almost died after accidentally swallowing something that caused a blockage in his ______.", options: ["airbase","airbag","airbridge","airway"], correct: 3, explanation: 'Airway blockage is life-threatening.' },
  { text: "The X- rays showed that the woman had a fractured ______ and several broken bones.", options: ["skull","skin","scar","scarf"], correct: 0, explanation: 'X-rays show bones like the "skull".' },
  { text: "Little Stewart fell on the pavement and broke one of his ______.", options: ["ancestors","incisions","incisors","sizzlers"], correct: 2, explanation: 'Incisors are front teeth.' },
  { text: "James was in agony after breaking his ______ while playing rugby.", options: ["collarbone","collar","bonehead","bone marrow"], correct: 0, explanation: 'Common rugby injury: "collarbone".' },
  { text: "Curvature of the ______ is often the result of sleeping on a soft mattress.", options: ["spinner","spiral","spine","spinal"], correct: 2, explanation: 'Backbone is the "spine".' },
  { text: "A symptom of indigestion is a sharp pain under the ______.", options: ["collarbone","breastbone","breaststroke","breastplate"], correct: 1, explanation: 'Indigestion pain often under the "breastbone".' },
  { text: "The biology teacher explained to the young students that the ______ protects the heart and other vital organs.", options: ["collarbone","collar cage","rib cage","rib cap"], correct: 2, explanation: 'The ribs form the "rib cage".' },
  { text: "Skateboarders are advised to wear pads on their legs to protect their ______ from injury.", options: ["collarbone","collarbone","kneecaps","ribcaps"], correct: 2, explanation: 'Pads protect the "kneecaps".' },
  { text: "After falling off her bike, Dora's ______ and elbows were so badly scraped that her mother took her to hospital.", options: ["shins","shines","chins","skirts"], correct: 0, explanation: 'Shins and elbows commonly get scraped.' },
  { text: "The elderly gentleman must have problems with his chest because he coughs and ______ the whole time.", options: ["breathes","yawns","wheeles","wheezes"], correct: 3, explanation: '"Wheezes" = noisy breathing.' },
  { text: "It's only manners to cover your mouth when you ______.", options: ["breathe","breath","yawn","exhale"], correct: 2, explanation: 'Etiquette: cover your mouth when you "yawn".' },
  { text: "Halfway through the meeting she had a ______ headache, so she asked to be excused and went home.", options: ["throbbing","throb","throbbed","thrilling"], correct: 0, explanation: '"Throbbing" describes a pulsating headache.' },
  { text: "I thought Catherine was about to cry, but she ______ a few times and then gave me a half- hearted smile.", options: ["bleached","blinked","blackened","cried"], correct: 1, explanation: 'She "blinked" to hold back tears.' },
  { text: "When I was ill, I had to ______ about five tablets three times a day.", options: ["swallow","follow","swell","swear"], correct: 0, explanation: 'You "swallow" tablets.' },
  { text: "The boy's eye was badly ______, so his mother put an ice pack over it to stop the swelling.", options: ["browsed","breezed","bruised","braced"], correct: 2, explanation: 'A black eye is "bruised".' },
  { text: "Rich food is hard to ______ so it's better to avoid eating it late at night.", options: ["ingest","digest","swallow","resist"], correct: 1, explanation: 'Rich food is hard to "digest".' },
  { text: "Because the workman was suffering from ______ vision, he was advised not to drive or operate any heavy machinery.", options: ["hazy","hazard","blurt","blurred"], correct: 3, explanation: 'Blindness/unclarity = "blurred vision".' },
  { text: "The ______ in his voice is due to smoking too many cigarettes.", options: ["hoarseness","horsebox","horseback","hoarse"], correct: 0, explanation: 'Smoking causes "hoarseness" of voice.' },
  { text: "Everything in the room seemed to ______ her just before she collapsed on the floor.", options: ["hazardous","clear","noisy","hazy"], correct: 3, explanation: 'Vision often becomes "hazy" before fainting.' },
  { text: "Tim loves strawberries, but unfortunately they bring him out in red ______ all over his body.", options: ["bleaches","blotches","blotters","batches"], correct: 1, explanation: 'Allergic reaction causes "blotches".' },
  { text: "The ______ suggested laser treatment to correct his patient's farsightedness.", options: ["cardiologist","dermatologist","ophthalmologist","orthopaedic surgeon"], correct: 2, explanation: 'Eye conditions treated by an "ophthalmologist".' },
  { text: "South African Christian Bernard carried out the first heart transplant operation.", options: ["cardiologist","dermatologist","ophthalmologist","orthopaedic surgeon"], correct: 0, explanation: 'A heart surgeon is a type of cardiologist.' },
  { text: "The ______ recommended a new drug to treat the teenager's skin complaint.", options: ["cardiologist","dermatologist","ophthalmologist","orthopaedic surgeon"], correct: 1, explanation: 'Skin conditions treated by a "dermatologist".' },
  { text: "After months of suffering with a bad back, I eventually made an appointment to see a/an ______.", options: ["cardiologist","dermatologist","ophthalmologist","orthopaedic surgeon"], correct: 3, explanation: 'Back problems often need an orthopaedic surgeon.' },
  { text: "The child had trouble breathing through the nose, so the doctor referred him to a/an ______ specialist.", options: ["ENT","dermatologist","ophthalmologist","orthopaedic surgeon"], correct: 0, explanation: 'Ear Nose Throat = ENT specialist.' },
  { text: "The elderly lady needed a walking frame to get about as she was crippled with ______.", options: ["Eczema","arthritis","concussion","insomnia"], correct: 1, explanation: 'Arthritis affects mobility.' },
  { text: "A ______ muscle in her neck prevented her from working on her computer.", options: ["dragged","sprained","hung","pulled"], correct: 3, explanation: 'A "pulled" muscle is overstretched.' },
  { text: "A new wonder drug on the market has brought relief to thousands of people suffering from ______.", options: ["acupuncture","homeopathy","surgery","eczema"], correct: 3, explanation: 'Eczema is a skin disease treatable by drugs.' },
  { text: "The boy was rushed to hospital with ______ after falling off his horse during a polo match.", options: ["eczema","concussion","insomnia","indigestion"], correct: 1, explanation: 'Head injury from fall = concussion.' },
  { text: "The climbers struggled on for days before the cold and ______ finally forced them to turn back.", options: ["fatalism","fatuousness","fatigue","badminton"], correct: 2, explanation: 'Extreme tiredness = fatigue.' },
  { text: "David's leg was set in plaster after he suffered a bone ______ during an accident.", options: ["fraction","faction","friction","fracture"], correct: 3, explanation: 'Broken bone = fracture.' },
  { text: "Kelly was said to be suffering from acute ______ after complaining that her abdomen was swollen and painful.", options: ["appendix","appendicitis","appendage","phoenix"], correct: 1, explanation: 'Appendicitis = inflamed appendix.' },
  { text: "There is said to be more than 100,000 doctors practising ______ around the world today.", options: ["homesickness","homeopathy","homeostasis","homeotherm"], correct: 1, explanation: 'Homeopathy is an alternative medicine practice.' },
  { text: "After the woman injured her arm, it was in ______ for quite a few weeks.", options: ["sling","slang","slogan","swing"], correct: 0, explanation: 'An injured arm is supported in a sling.' },
  { text: "Frank's leg is in a ______, he broke it again!", options: ["cask","cast","task","kiosk"], correct: 1, explanation: 'Broken leg is put in a cast.' },
  { text: "According to the sports trainer's ______, the athlete had set a new world record.", options: ["clock","stopwatch","time","alarm clock"], correct: 1, explanation: 'Trainers use a stopwatch.' },
  { text: "The ______ gave the footballer a red card and sent him off the pitch.", options: ["referent","reference","referral","referee"], correct: 3, explanation: 'Football official is the referee.' },
  { text: "Sam packed his racket and ______ in his sport's bag and set off for the badminton tournament.", options: ["shuttles","shuttlecocks","space shuttles","balls"], correct: 1, explanation: 'Badminton projectile = shuttlecock.' },
  { text: "The ice hockey player slammed the ______ into the back of the net to score the winning goal.", options: ["shuttlecock","puck","pucker","buck"], correct: 1, explanation: 'Ice hockey uses a puck.' },
  { text: "The sports ______ claimed that it was the most exciting match of the season.", options: ["commentary","forecast","commentator","economist"], correct: 2, explanation: 'The person describing the event is the commentator.' },
  { text: "One of the racing drivers skidded on the wet ______ before crashing into the barrier.", options: ["tarmac","terminalia","tarantula","tarnish"], correct: 0, explanation: 'Race track surface is tarmac.' },
  { text: "The footballer was suffering from a painful ankle ______ and was carried off the pitch.", options: ["sprang","sprain","spree","sprig"], correct: 1, explanation: 'Ankle sprain = overstretched ligament.' },
  { text: "Hockey players wear ______ to protect their legs from injury.", options: ["shin splints","shingles","shinguards","helmets"], correct: 2, explanation: 'Protective gear = shinguards.' },
  { text: "Bob borrowed someone's bow and arrow at the festival and managed to score a bull's eye on his very first shot.", options: ["badminton","boxing","wrestling","archery"], correct: 3, explanation: 'Bow and arrow => archery.' },
  { text: "Peter has a games room in his house and invited me for a game of ______.", options: ["angling","kayaking","snooker","synchronized swimming"], correct: 2, explanation: 'Indoor table game = snooker.' },
  { text: "During one of the most popular events in England, one of ______ rowers dropped his oar and his team was disqualified.", options: ["rowing","go- cart racing","snooker","synchronized swimming"], correct: 0, explanation: 'Rowers use oars in rowing.' },
  { text: "The boy and his father went ______ last weekend and they really enjoyed the speed and competition.", options: ["badminton","go- cart racing","snooker","synchronized swimming"], correct: 1, explanation: 'Go-cart racing = speed/competition.' },
  { text: "Mike won a bronze medal in the ______ competition after pinning his opponent to the floor.", options: ["badminton","snooker","wrestling","archery"], correct: 2, explanation: 'Pinning opponent = wrestling.' },
  { text: "The team were in and out of the pool all day long, practicing for their upcoming display.", options: ["rowing","go- cart racing","snooker","synchronized swimming"], correct: 3, explanation: 'Team in pool => synchronized swimming.' },
  { text: "My father's favourite pastime is ______ even though he rarely catches any fish.", options: ["angling","kayaking","snooker","synchronized swimming"], correct: 0, explanation: 'Angling = fishing with rod.' },
  { text: "When the boys finished their game of ______ they were exhausted.", options: ["squish","squash","squinch","squab"], correct: 1, explanation: 'Squash is physically exhausting.' },
  { text: "The spectators cheered loudly as the final runner rounded the ______ and staggered towards the finishing line.", options: ["track","pitch","court","rink"], correct: 0, explanation: 'Runners compete on a track.' },
  { text: "The cricket match was postponed because the ______ was too wet after a recent storm.", options: ["court","rink","track","pitch"], correct: 3, explanation: 'Cricket playing area = pitch.' },
  { text: "The reporters clambered into the ______ as soon as the boxing match was over, hoping to interview the new heavyweight champion of the world.", options: ["ring","rink","track","pitch"], correct: 0, explanation: 'Boxing takes place in a ring.' },
  { text: "Every Saturday morning, Jill has a private skating lesson at the local ice- skating ______ in town.", options: ["ring","rink","track","pitch"], correct: 1, explanation: 'Ice-skating arena = rink.' },
  { text: "One of the tennis players was ordered off ______ after insulting the umpire.", options: ["court","rink","track","pitch"], correct: 0, explanation: 'Tennis is played on a court.' },
  { text: "Bob likes to take a/an ______ shower before work.", options: ["vigorous","inveigle","invigorating","vague"], correct: 2, explanation: 'A refreshing shower is "invigorating".' },
  { text: "The marathon runner wasn't sure if he had enough ______ to finish the race.", options: ["stamen","stamina","insomnia","stamp"], correct: 1, explanation: 'Endurance = stamina.' },
  { text: "After twisting his ankle, the athlete was in ______ pain and collapsed to the ground.", options: ["excruciating","extenuating","exculpatory","invigorating"], correct: 0, explanation: 'Severe pain = excruciating.' },
  { text: "The swimmer tried to ignore the ______ pain in his neck until the race was over.", options: ["invigorating","soothing","gnarled","nagging"], correct: 3, explanation: 'Persistent pain = nagging.' },
  { text: "Although the stunt artist had very few visible injuries, he was found to be suffering from ______ bleeding which almost killed him.", options: ["internal","external","diurnal","nocturnal"], correct: 0, explanation: 'Internal bleeding is dangerous.' },
  { text: "The ______ diseases unit of the hospital was off- limits to everyone except authorised personnel.", options: ["continuous","continual","contaminated","contagious"], correct: 3, explanation: 'Unit isolating infectious patients = contagious.' },
  { text: "Her injury wasn't serious enough to be admitted to hospital, but she had to attend the ______ treatment centre almost every other day.", options: ["inpatient","on- the- spot","outrageous","outpatient"], correct: 3, explanation: 'Outpatient visits = not staying overnight.' },
  { text: "The woman had to undergo a series of ______ tests before the heart transplant surgery could go ahead.", options: ["annual","rigorous","vigorous","rigorously"], correct: 1, explanation: 'Thorough tests = rigorous.' },
  { text: "Even after months of medical tests, the child's illness continued to ______ her doctors.", options: ["baffle","buffoon","panel","raffle"], correct: 0, explanation: 'Mystery illness "baffles" doctors.' },
  { text: "The common symptoms of ______ are fever, severe headache and stiffness in the neck.", options: ["menopause","menagerie","meniscus","meningitis"], correct: 3, explanation: 'These are classic meningitis signs.' },
  { text: "Harry's persistent cough and breathing difficulties were finally diagnosed as a serious bout of ______.", options: ["arthritis","pneumonia","hepatitis","mental breakdown"], correct: 1, explanation: 'Respiratory infection = pneumonia.' },
  { text: "On a recent trip to Spain the girls caught a stomach ______ that ruined their holiday.", options: ["insect","fly","bug","midge"], correct: 2, explanation: 'Informal term: stomach "bug".' },
  { text: "______ can be cured if treatment starts very soon after infection.", options: ["Arthritis","Pneumonia","Hepatitis","Mental breakdown"], correct: 1, explanation: 'Pneumonia can be cured if treated promptly.' },
  { text: "After the death of her husband, Mandy suffered from acute depression and her family were afraid she was on the verge of a ______.", options: ["arthritis","pneumonia","hepatitis","mental breakdown"], correct: 3, explanation: 'Severe depression may lead to mental breakdown.' },
  { text: "The child was coughing and gasping for breath while suffering from ______ cough.", options: ["whooping","weeping","woop woop","whoopee"], correct: 0, explanation: 'Whooping cough = pertussis.' },
  { text: "Employers often consider job applicants to be over the ______ once they reach 35-40 years of age.", options: ["mountain","cliff","hill","summit"], correct: 2, explanation: 'Idiom: "over the hill" = past prime.' },
  { text: "After months of hospital tests and treatment, Fred was finally given a clean ______ of health.", options: ["cheque","receipt","bill","prescription"], correct: 2, explanation: '"Clean bill of health" = healthy.' },
  { text: "Fortunately, Tom didn't break any bones in the accident, although he was ______ from head to toe.", options: ["red and white","black and red","black and blue","black and white"], correct: 2, explanation: 'Bruised = black and blue.' },
  { text: "The man had hardly ever had a day's illness in his life and at 80 he was fit as a ______.", options: ["violin","lute","fiddle","fiddler"], correct: 2, explanation: 'Idiom: fit as a fiddle.' },
  { text: "I had ______ in my stomach as I was waiting to go on stage for my very first live performance.", options: ["flies","butterflies","insects","bugs"], correct: 1, explanation: 'Nervousness = butterflies in the stomach.' },
  { text: "Jonathan really kicked up his ______ at the annual dancing festival and hardly sat down all night.", options: ["nails","knees","shins","heels"], correct: 3, explanation: 'Idiom: kick up one's heels = celebrate.' },
  { text: "The doctor ______ the life out of me when he said that I needed to see a specialist.", options: ["scared","frightened","petrified","agitated"], correct: 0, explanation: '"Scared the life out of me" = extremely frightened.' },
  { text: "My grandmother is ______ of mind and body despite recently celebrating her 90th birthday.", options: ["profound","stiff","sound","voice"], correct: 2, explanation: 'Sound of mind and body = healthy.' },
  { text: "Workmen who construct high- rise flats must have nerves of ______ to undertake such a job.", options: ["iron","steel","wood","platinum"], correct: 1, explanation: 'Idiom: nerves of steel.' },
  { text: "Although he tried to assure everyone that he was fine, his attempt at keeping a stiff upper ______ failed when he saw how upset his family were.", options: ["face","lip","nostril","forehead"], correct: 1, explanation: 'Idiom: stiff upper lip.' },
  { text: "During the golf tournament, he played alongside some of the top ______ from Europe and America.", options: ["cons","pros","proms","probs"], correct: 1, explanation: 'Short for professionals = pros.' },
  { text: "______ the circumstances, Mary was extremely lucky to have survived such a terrible accident.", options: ["Under","Over","In","According"], correct: 0, explanation: 'Phrase: under the circumstances.' },
  { text: "The police finally caught up with the two men who were under ______ of burglary.", options: ["the circumstances","pressure","suspicion","age"], correct: 2, explanation: 'Under suspicion = suspected of a crime.' },
  { text: "Under ______ conditions, the long journey wouldn't have bothered him, but the bad weather was making driving almost impossible.", options: ["usual","normal","common","natural"], correct: 1, explanation: '"Normal conditions" = standard circumstances.' },
  { text: "The local government is under ______ from various environmental groups to clean up the town's polluted river.", options: ["the circumstances","pressure","suspicion","age"], correct: 1, explanation: 'Under pressure = urged to act.' },
  { text: "Because she is under ______, she isn't allowed to vote in the forthcoming general elections.", options: ["the circumstances","pressure","suspicion","age"], correct: 3, explanation: 'Under age = too young to vote.' },
  { text: "Nowadays, manufacturers often use catchy ______ to advertise their products.", options: ["proverbs","slogans","wisdoms","verses"], correct: 1, explanation: 'Advertising uses slogans.' },
  { text: "The idea of building a fully equipped medical centre in the village was close to his ______, so he was thrilled when they finally approved his plans.", options: ["stomach","eye","heart","chest"], correct: 2, explanation: 'Close to one\'s heart = cared about deeply.' },
  { text: "The teenager didn't always see ______ with her parents, but she knew they loved her dearly.", options: ["eye to eye","eyes to eyes","face to face","person to person"], correct: 0, explanation: 'See eye to eye = agree.' },
  { text: "As I ran home in the storm, the wind was so strong that it ______ lifted me off my feet.", options: ["laterally","literally","lately","fortunately"], correct: 1, explanation: '"Literally" for emphasis when it actually happened.' },
  { text: "The couple planned to ______ the loft into a playroom for their children.", options: ["covet","alert","converse","convert"], correct: 3, explanation: 'Convert = change use of loft.' },
  { text: "The doctor ______ the patient's prescription when he saw that the tablets weren't doing her much good.", options: ["altered","sheltered","rendered","wrote"], correct: 0, explanation: 'He changed (altered) the prescription.' },
  { text: "The thief ______ himself as a woman by wearing a blond wig and a long dress, but his masculine voice gave him away.", options: ["diagnosed","disgusted","disguised","disgorged"], correct: 2, explanation: 'He disguised himself.' },
  { text: "The motorist sustained multiple injuries in the accident and is said to be in ______ condition.", options: ["political","criticized","crucial","critical"], correct: 3, explanation: 'Severely injured = critical condition.' },
  { text: "When Simon left home for medical school, it was a perfect opportunity for his mother to ______ his room.", options: ["clear out","clear away","clear up","hold out"], correct: 0, explanation: 'Clear out = empty the room.' },
  { text: "The teenager's spots on her forehead finally ______ after a course of antibiotics.", options: ["cleared out","cleared away","cleared up","held out"], correct: 2, explanation: 'Skin problems "clear up".' },
  { text: "Mum asked the children to ______ the pots and pans after dinner.", options: ["clear out","clear away","clear up","hold out"], correct: 1, explanation: 'Clear away = remove dishes.' },
  { text: "The child ______ his plate for a second helping of his favourite chocolate pudding.", options: ["cleared out","cleared away","cleared up","held out"], correct: 3, explanation: 'Held out = extended plate.' },
  { text: "A customer overcame a thief as he attempted to ______ one of the town's busiest supermarkets.", options: ["clear out","hold up","clear up","hold out"], correct: 1, explanation: 'To rob = hold up.' },
  { text: "The patient couldn't hold ______ her tears of joy when the doctor gave her the good news.", options: ["up","back","out","off"], correct: 1, explanation: 'Hold back tears = restrain crying.' },
  { text: "The doctor tried to hold ______ the operation for as long as possible, in the hope that the patient's condition would stabilize.", options: ["up","back","out","off"], correct: 3, explanation: 'Hold off = delay.' },
  { text: "Tina got soaked coming home from work because she forgot to take her umbrella from her ______.", options: ["lock","locket","locker","mocker"], correct: 2, explanation: 'Personal storage = locker.' },
  { text: "Athletes have to be careful while handing over the ______ so as not to drop it.", options: ["button","baton","batch","butane"], correct: 1, explanation: 'Relay baton.' },
  { text: "When the children saw the snow in the garden, they ______ their jackets and ran out to play.", options: ["gripped","grabbed","gripped","graded"], correct: 1, explanation: 'They grabbed their jackets.' },
  { text: "Jill watches her favourite soap opera every afternoon while her baby daughter takes a ______.", options: ["nap","nip","nab","nob"], correct: 0, explanation: 'Short sleep = nap.' },
  { text: "Doctors had no trouble ______ Carl's illness and it wasn't long before he was completely cured.", options: ["examining","testing","diagnosing","prescribing"], correct: 2, explanation: 'Identifying illness = diagnosing.' },
  { text: "Nowadays, aromatherapy is a popular form of alternative ______.", options: ["disease","perfume","illness","medicine"], correct: 3, explanation: 'Aromatherapy = alternative medicine.' },
  { text: "Eating too much pastry gives Sarah ______, so she tries to avoid it whenever possible.", options: ["indigestion","digestion","diagnosis","stomach bug"], correct: 0, explanation: 'Rich food causes indigestion.' },
  { text: "The family doctor recommended that Brian try ______ as a treatment for pain relief.", options: ["acuity","acumen","acupuncture","acuteness"], correct: 2, explanation: 'Acupuncture uses needles for pain relief.' },
  { text: "The patient felt ______ when she was told that her doctor couldn't see her for a week.", options: ["fragrant","fragile","frustrating","frustrated"], correct: 3, explanation: 'Being upset due to hindrance = frustrated.' },
  { text: "During her long illness, Mary felt ______ about being confined to the house for so long.", options: ["glorious","gloomy","glad","glacial"], correct: 1, explanation: 'Confined = gloomy.' },
  { text: "Fitness enthusiasts swear by exercise as a ______ remedy for overall well-being.", options: ["sovereign","severe","savage","svelte"], correct: 0, explanation: 'Sovereign remedy = highly effective cure.' },
  { text: "Yoga is said to be an excellent ______ of both body and mind.", options: ["invigilator","accumulator","dominator","invigorator"], correct: 3, explanation: 'Invigorator = energizer.' },
  { text: "Newscasters on most of the major TV channels ______ the minister's speech on health reform last night.", options: ["quoted","quitted","quivered","quizzed"], correct: 0, explanation: 'News often quote speeches.' },
  { text: "When the doctor reprimanded Tina for forgetting to take her medicine, she didn't ______ a word.", options: ["shutter","cutter","utter","butter"], correct: 2, explanation: 'Didn't utter a word.' },
  { text: "The doctor's ______ concern was that his patient received the best possible treatment.", options: ["mental","fundamental","departmental","developmental"], correct: 1, explanation: 'Fundamental = primary concern.' },
  { text: "Tim's ear infection was so severe that his doctor prescribed a five- day course of ______.", options: ["antibodies","anticyclones","antibiotics","antiquarians"], correct: 2, explanation: 'Bacterial infections treated with antibiotics.' },
  { text: "It was difficult for the nurse to find a suitable ______ in which to inject the drug.", options: ["vain","vein","vale","van"], correct: 1, explanation: 'Injection into a vein.' },
  { text: "Anyone who has poor ______ of the blood should seek medical advice before flying.", options: ["circuitry","circumference","circulation","circularity"], correct: 2, explanation: 'Poor blood circulation is a concern.' },
  { text: "After years of suffering from a heart complaint, Tom needed to have a heart ______ replaced.", options: ["valve","vale","veil","vain"], correct: 0, explanation: 'Faulty heart valve replacement.' },
  { text: "The first symptoms of ______ include fever, head and body pains and sometimes vomiting.", options: ["smallpox","small ad","small beer","smallness"], correct: 0, explanation: 'Smallpox presents these symptoms.' },
  { text: "A ______ of Alexander Fleming, Ernest Duchesne, is said to have first discovered the antibiotic properties of penicillin in 1896.", options: ["contender","contemptible","contemporary","contemporaneous"], correct: 2, explanation: 'Contemporary = lived at same time.' },
  { text: "______ medicine is valuable because it reduces the risk of becoming sick and having to suffer the consequences of more serious illnesses.", options: ["Preventable","perfective","Preventive","Precautionous"], correct: 2, explanation: 'Preventive medicine stops illness before it starts.' },
  { text: "The majority of Darwin's peers ______ his theory of evolution, believing it to be totally misleading.", options: ["contracted","accepted","accredited","contradicted"], correct: 3, explanation: 'They opposed it = contradicted.' },
  { text: "Wendy promised to ______ the task of looking after her ailing father.", options: ["undertake","understand","underachieve","undercharge"], correct: 0, explanation: 'To undertake = take on a task.' },
  { text: "The government is trying to ______ the idea that the National Health Service is in decline.", options: ["disparage","disparate","dispatch","dispel"], correct: 3, explanation: 'Dispel = drive away a mistaken idea.' },
  { text: "The heart is an organ in your chest that ______ blood around your body.", options: ["repels","propanes","propagates","propels"], correct: 3, explanation: 'Heart propels blood.' },
  { text: "The man had a painful ulcer on his leg that was caused by a blocked ______.", options: ["artefact","artery","arterial","artichoke"], correct: 1, explanation: 'Blocked artery causes ulcers.' },
  { text: "William Harvey made medical history with his theory that the heart was at the centre of the ______ system.", options: ["circulatory","digestive","muscular","nervous"], correct: 0, explanation: 'Harvey discovered blood circulation.' },
  { text: "Doctors were ______ by the woman's strange symptoms and suggested that she undergo various tests.", options: ["fuzzed","puzzled","muzzled","nuzzled"], correct: 1, explanation: 'They were puzzled = confused.' },
  { text: "It was months before the doctor solved the ______ of Tim's constant backache.", options: ["fiddle","middle","riddle","bible"], correct: 2, explanation: 'Mystery = riddle.' },
  { text: "Don't stand so close while the machine is in ______.", options: ["motion","notion","ration","fashion"], correct: 0, explanation: 'In motion = moving.' },
  { text: "He received a copy of a medical journal ______ Life and Science.", options: ["entailed","entitled","entented","entangled"], correct: 1, explanation: 'Entitled = having the title.' },
  { text: "The decline of conditions in hospitals has ______ the idea of free, high-quality health care.", options: ["debacled","debased","debarred","debunked"], correct: 3, explanation: 'Debunked = exposed as false.' },
  { text: "People were under the ______ that the earth was flat until Copernicus suggested otherwise.", options: ["miscommunication","misconception","misconduct","miscalculation"], correct: 1, explanation: 'False belief = misconception.' },
  { text: "Roger will undergo a ______ transplant as soon as a suitable donor is found.", options: ["river","liver","livery","liverish"], correct: 1, explanation: 'Liver transplant.' },
  { text: "This year, with the higher sales volume, our company is on a new financial ______.", options: ["footing","legging","nosing","eying"], correct: 0, explanation: 'On a new footing = new basis.' },
  { text: "______ fumes overcame many workers during a recent chemical plant explosion.", options: ["Dead","deaden","deadly","deadlock"], correct: 2, explanation: 'Deadly fumes = poisonous.' },
  { text: "The theory of human evolution has ______ scientists for many decades.", options: ["intruded","intuited","inundated","intrigued"], correct: 3, explanation: 'Intrigued = aroused curiosity.' },
  { text: "The ______ says these forests are inhabited by unfriendly trolls.", options: ["country-lore","galore","solore","galore"], correct: 0, explanation: 'Country-lore = local folklore.' },
  { text: "______ produces immunity to a more serious infectious disease known as smallpox.", options: ["Cattlepox","Cowpox","Goatpox","Sheeppox"], correct: 1, explanation: 'Cowpox produced immunity (basis for vaccine).' },
  { text: "The woman sued the hospital after ______ an illness from a blood transfusion.", options: ["contradicting","counteracting","contracting","contrasting"], correct: 2, explanation: 'To contract an illness = catch it.' },
  { text: "Milking cows was once a ______ job but now it's done by modern machinery.", options: ["cook maid's","shopmaid's","robomaid's","dairymaid's"], correct: 3, explanation: 'Dairymaid = person who milked cows.' },
  { text: "The doctor explained that the ______ on Julie's body was an allergic reaction to something she'd eaten.", options: ["rash","rush","bush","gush"], correct: 0, explanation: 'Allergic reaction on skin = rash.' },
  { text: "The young boy's mother warned him not to ______ the spots on his face for fear they became infected.", options: ["snatch","scratch","smash","slash"], correct: 1, explanation: 'Do not scratch spots to avoid infection.' },
  { text: "The surgeon used a ______ to make an incision in the patient's chest.", options: ["sculpture","sculptor","knife","scalpel"], correct: 3, explanation: 'Scalpel is a surgeon\'s precise tool.' },
  { text: "The latest statistics on infectious diseases are ______ alarming, especially in countries without proper sanitation.", options: ["undoubted","undoubting","undoubtedly","undoubtedly"], correct: 2, explanation: 'Undoubtedly = without doubt (note: typo duplicates in options).' },
  { text: "The new drug will treat thousands of infected people, but unfortunately it is not ______ available.", options: ["universe","universal","universally","university"], correct: 2, explanation: 'Universally available = everywhere.' },
  { text: "Cholera is a ______ infection caused by drinking contaminated water or by eating contaminated food.", options: ["bacterial","bacteria","bacterium","bacteriological"], correct: 0, explanation: 'Cholera = bacterial infection.' },
  { text: "All animals and plants are made up of millions of ______.", options: ["cells","ceils","ceilings","ceums"], correct: 0, explanation: 'Basic units of life = cells.' },
  { text: "She prefers to take soluble aspirin when she has a headache because it can be ______ in water.", options: ["resolved","solved","dissolved","desolved"], correct: 2, explanation: 'Soluble tablets dissolve in water.' },
  { text: "His research came to a ______ end when he learnt that the government had withdrawn further funding.", options: ["deadly","dead","dial","dual"], correct: 1, explanation: 'Came to a dead end = no progress.' },
  { text: "The latest drug on the market for treating hay fever is said to be highly ______ and relieves people of their distressing symptoms in no time.", options: ["infectious","effervesce","effeminate","efficacious"], correct: 3, explanation: 'Efficacious = effective.' },
  { text: "There are two types of bacteria: one causes disease while the other is ______.", options: ["patient","nonpathogenic","pathogenic","non- patient"], correct: 1, explanation: 'Nonpathogenic = not disease-causing.' },
  { text: "The rescue plane ______ into a thousand pieces after crashing into the snow- covered mountain.", options: ["disintegrated","disinvested","disinterred","disjoined"], correct: 0, explanation: 'Disintegrated = broke apart.' },
  { text: "On returning from holiday, David was horrified when he saw a piece of cheese on the kitchen table that was covered in ______.", options: ["moult","mount","mould","moulder"], correct: 2, explanation: 'Fungal growth on food = mould.' },
  { text: "The medical team ______ that the man's condition could have resulted from a childhood illness.", options: ["hypotensised","hyphenated","hypothesized","hyped up"], correct: 2, explanation: 'Hypothesized = proposed explanation.' },
  { text: "The rescue party received ______ for saving the life of two young skiers who had been buried in the snow for more than twelve hours.", options: ["accredit","credit","discredit","noncredit"], correct: 1, explanation: 'They received credit = praise.' },
  { text: "Certain types of ______ such as mushrooms, are edible while others are extremely poisonous.", options: ["fungal","fungicide","fungoid","fungus"], correct: 3, explanation: 'Mushrooms are a type of fungus.' },
  { text: "While on an excursion in the country, the young couple carved their initials in the ______ of a tree.", options: ["park","bark","sap","root"], correct: 1, explanation: 'Carved in the bark of a tree.' },
  { text: "As the girls relaxed by the side of the river, the long flowing branches of the ______ tree shaded them from the midday sun.", options: ["willow","willowy","wily","willy"], correct: 0, explanation: 'Willow trees have drooping branches.' },
  { text: "Vitamins are chemical compounds that cannot be ______ by the human body.", options: ["improvised","despised","synthesized","chastised"], correct: 2, explanation: 'Body cannot synthesize certain vitamins.' },
  { text: "______ acid, more commonly known as aspirin, is used to treat aches and pains.", options: ["Salicylic","Salient","Saline","Salivary"], correct: 0, explanation: 'Salicylic acid is the active component.' },
  { text: "______ are derivatives of fatty acids that are produced in most tissues of the body.", options: ["Prosciuttos","Prostaglandins","Prostate","Prostheses"], correct: 1, explanation: 'Prostaglandins are hormone-like compounds.' },
  { text: "______ accelerate and control all biochemical processes in the body.", options: ["Regimes","Proteins","Lysozymes","Enzymes"], correct: 3, explanation: 'Enzymes catalyze biochemical reactions.' },
  { text: "The driver whose car was wrecked in the accident was so angry that he burst a blood ______ in his nose.", options: ["vessel","vest","vet","vex"], correct: 0, explanation: 'Burst blood vessel = nosebleed.' },
  { text: "The doctor put some drops in the patient's eyes to measure the ______ of her pupils.", options: ["deletion","dilation","delection","deliberation"], correct: 1, explanation: 'Drops cause dilation of pupils for exam.' },
  { text: "He is said to have died of a ______ after a blood vessel ruptured in his brain.", options: ["stroke","strike","strain","strait"], correct: 0, explanation: 'Ruptured brain vessel causes a stroke.' }
];

async function seedUnit7() {
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
      title: `Upstream Unit7 Q#${idx + 1}`,
      question_text: q.text,
      choices: q.options.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: i === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: upstreamCategory._id,
      source: "Upstream-Unit7",
      tags: ["upstream","unit7","vocab"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} Unit 7 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    const del = await Quiz.deleteMany({ source: "Upstream-Unit7" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Upstream-Unit7 quizzes`);

    const chunk = 26; // six quizzes of 26, last one will contain the remainder (27)
    const created = [];
    for (let i = 0; i < 7; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      // handle remainder: if last slice empty, take remaining
      if (i === 6 && slice.length === 0) {
        const rem = inserted.slice(i * chunk).map(s => s._id);
        if (rem.length > 0) slice.push(...rem);
      }
      if (slice.length === 0) continue;
      const title = `Upstream Unit 7 - Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `Upstream Unit 7 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "Upstream-Unit7",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} Unit 7 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding Unit 7:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUnit7();
