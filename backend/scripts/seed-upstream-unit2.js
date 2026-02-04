import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Unit 2: 160 questions (provided by user)
const unit2 = [
  { num: 1, text: "After I was assigned my own personal ......, he showed me around the gym and explained how the equipment worked.", options: ["instructor","advisor","teacher","tutor"], correct: 1, explanation: '"Advisor" fits best in a gym context where someone guides you personally.' },
  { num: 2, text: "The fishing ...... was conveniently located within walking distance of a well-stocked lake.", options: ["tent","host","lodge","hotel"], correct: 2, explanation: 'A "fishing lodge" is accommodation near lakes.' },
  { num: 3, text: "We enjoyed a lovely packed lunch in the refreshing ...... of the fragrant wood.", options: ["isolation","barrenness","infertility","solitude"], correct: 3, explanation: '"Solitude" means peaceful alone-ness.' },
  { num: 4, text: "The group opened the concert with a rousing ...... of the hit song that made them famous.", options: ["rendition","edition","translation","interpretation"], correct: 0, explanation: '"Rendition" means a performance.' },
  { num: 5, text: "The film was a real ...... . It had the audience gasping in suspense till the very end.", options: ["cliff-hanger","blockbuster","box office hit","bestseller"], correct: 0, explanation: '"Cliff-hanger" describes intense suspense.' },
  { num: 6, text: "After his 10-mile ...... over rough terrain, John was glad to see the inn come into view.", options: ["pilgrimage","trek","voyage","cruise"], correct: 1, explanation: '"Trek" = long difficult journey on land.' },
  { num: 7, text: "The ...... showed the visitors the new exhibits that had been donated to the permanent collection.", options: ["dean","curator","prefect","governor"], correct: 1, explanation: '"Curator" manages museum exhibits.' },
  { num: 8, text: "We stood on the ...... of the liner as it pulled away from the pier.", options: ["platform","deck","stage","sidewalk"], correct: 1, explanation: '"Deck" is the ship floor area.' },
  { num: 9, text: "After missing an easy shot, the player threw her ...... angrily on the ground.", options: ["net","racket","court","umpire"], correct: 1, explanation: '"Racket" is used in tennis/badminton.' },
  { num:10, text: "He spent hours in his ...... every evening developing rolls of film.", options: ["camera","darkroom","lens","tripod"], correct: 1, explanation: '"Darkroom" is where film is developed.' },
  { num:11, text: "Place your foot on the ...... and swing your other leg over the horse's back.", options: ["saddle","stirrup","bit","bridle"], correct: 1, explanation: '"Stirrup" is where you place your foot when mounting.' },
  { num:12, text: "Because of her fear of heights and the swinging motion of the seats, Linda has never been persuaded to get on a ...... .", options: ["carousel","roller coaster","big wheel","water slide"], correct: 2, explanation: '"Big wheel" = Ferris wheel; swings at height.' },
  { num:13, text: "My grandmother is a fanatic about her favourite ......; she laughs and cries with the actors as though they were real people.", options: ["documentary","chat show","soap opera","cartoon"], correct: 2, explanation: '"Soap opera" are emotional TV dramas.' },
  { num:14, text: "Be sure you drain the spinach in the ...... before you spread it over the sheets of pastry.", options: ["whisk","grater","saucepan","colander"], correct: 3, explanation: '"Colander" drains water from food.' },
  { num:15, text: "The sound of the fisherman's voice was barely ...... over the roar of the waterfall.", options: ["silent","audible","raucous","deafening"], correct: 1, explanation: '"Audible" = able to be heard.' },
  { num:16, text: "The studio was ...... as the young artist worked at her sculpture.", options: ["silent","audible","raucous","deafening"], correct: 0, explanation: 'Artists often work in quiet studios.' },
  { num:17, text: "The couple's ...... laughter destroyed the romantic atmosphere of the elegant restaurant.", options: ["silent","audible","raucous","vociferous"], correct: 2, explanation: '"Raucous" = loud and harsh.' },
  { num:18, text: "The roar of applause at the end of the concert was ...... .", options: ["silent","voiceless","vociferous","deafening"], correct: 3, explanation: '"Deafening" = extremely loud.' },
  { num:19, text: "The film was full of violence; I found seeing it was such a ...... experience that I came out of the cinema feeling completely drained.", options: ["harrowing","agreeable","enjoyable","delightful"], correct: 0, explanation: '"Harrowing" = extremely distressing.' },
  { num:20, text: "To my relief, the long train journey was more ...... than I had expected.", options: ["disconcerting","distressing","agreeable","harrowing"], correct: 2, explanation: '"Agreeable" = pleasant.' },
  { num:21, text: "It was slightly ...... to see everyone else at the party was younger than me.", options: ["disconcerting","upset","terrifying","harrowing"], correct: 0, explanation: '"Disconcerting" = unsettling.' },
  { num:22, text: "It was really ...... to see the terrible poverty endured by people living in the shanty town.", options: ["distressed","distressing","agreeable","upset"], correct: 1, explanation: '"Distressing" = causing sadness.' },
  { num:23, text: "The ...... blossoms filled the air with a delightful perfumed scent.", options: ["fragrant","delicate","pristine","fanciful"], correct: 0, explanation: '"Fragrant" = pleasant smell.' },
  { num:24, text: "Peaches have ...... skins which are easily bruised.", options: ["fragrant","delicate","pristine","strong"], correct: 1, explanation: '"Delicate" = easily damaged.' },
  { num:25, text: "The ...... traffic was further hampered by large crowds of sightseers.", options: ["moving","flowing","slow-moving","fast"], correct: 2, explanation: '"Slow-moving" traffic fits.' },
  { num:26, text: "Be careful; there is ...... traffic on the roads this morning.", options: ["moving","heavy","slow-moving","light"], correct: 1, explanation: '"Heavy traffic" = a lot of vehicles.' },
  { num:27, text: "Only by enforcing ...... regulations was it possible to keep the forest safe from carelessly caused fires.", options: ["strict","unjustified","extreme","temperate"], correct: 0, explanation: '"Strict regulations" are firmly enforced.' },
  { num:28, text: "The workers are holding demonstrations to protest against ...... regulations.", options: ["lawful","legal","justified","unjustified"], correct: 3, explanation: '"Unjustified regulations" are unfair.' },
  { num:29, text: "The ...... coastline is off-limits to boaters and fishermen.", options: ["littered","messy","pristine","untidy"], correct: 2, explanation: '"Pristine" = unspoiled.' },
  { num:30, text: "The park was ...... with bottles and cans after the concert.", options: ["pristine","littered","gnarled","blackened"], correct: 1, explanation: '"Littered" means scattered with trash.' },
  { num:31, text: "Critics were not impressed with the reviewer's ...... interpretation of such a serious book.", options: ["impressive","serious","literal","fanciful"], correct: 3, explanation: '"Fanciful" = overly imaginative.' },
  { num:32, text: "The ...... meaning of \"television\" is \"seeing from distance.\"", options: ["unreal","serious","literal","fanciful"], correct: 2, explanation: '"Literal meaning" = dictionary definition.' },
  { num:33, text: "Bright green moss hung in sheets from the ...... branches of the old apple tree.", options: ["gnarled","blackened","pristine","littered"], correct: 0, explanation: '"Gnarled" = twisted, knobby.' },
  { num:34, text: "The folds of the curtains were ...... with dirt.", options: ["gnarled","blackened","pristine","clean"], correct: 1, explanation: '"Blackened" = darkened with dirt.' },
  { num:35, text: "The sun shone brightly on the ...... stream that ran parallel to the road.", options: ["gnarled","blackened","sparkling","winding"], correct: 2, explanation: '"Sparkling" = shining in the sun.' },
  { num:36, text: "There is a very long, ...... path leading up to the house.", options: ["gnarled","literal","sparkling","winding"], correct: 3, explanation: '"Winding" = curving.' },
  { num:37, text: "The ...... climate of the Arctic has little to offer tourists in search of a suntan.", options: ["extreme","temperate","moderate","mild"], correct: 0, explanation: '"Extreme" = harsh.' },
  { num:38, text: "Nowadays, tourists enjoy the ...... climate of Egypt.", options: ["extreme","temperate","sizzling","blistering"], correct: 1, explanation: '"Temperate" = mild and pleasant.' },
  { num:39, text: "The farmhouse we stayed in was completely ...... the beaten track.", options: ["off","of","from","far"], correct: 0, explanation: '"Off the beaten track" = remote.' },
  { num:40, text: "Our capstone project was achieved on a ...... budget.", options: ["shoe","shoestring","test plan","exhibition"], correct: 1, explanation: '"Shoestring budget" = very small budget.' },
  { num:41, text: "Reading between the ......, I'd say he is not happy with the situation.", options: ["pages","books","lines","words"], correct: 2, explanation: '"Reading between the lines" means infer hidden meaning.' },
  { num:42, text: "I am sure he will come late to the meeting. I can read him like a ...... .", options: ["reader","story","text","book"], correct: 3, explanation: '"Read someone like a book" = understand them easily.' },
  { num:43, text: "I can't believe I have made the grade. Let's go out and paint the town ...... !", options: ["blue","red","green","black"], correct: 1, explanation: '"Paint the town red" = celebrate wildly.' },
  { num:44, text: "We didn't pay for the meal. It was on the ...... .", options: ["house","flat","palace","lodge"], correct: 0, explanation: '"On the house" = free.' },
  { num:45, text: "The clown sang a duet with the talking horse, which ...... the house down every night.", options: ["grabbed","fetched","brought","knocked"], correct: 2, explanation: '"Brought the house down" = huge applause.' },
  { num:46, text: "After he was caught copying from his colleague's paper, he had to face the ...... .", options: ["movie","music","scenario","series"], correct: 1, explanation: '"Face the music" = accept consequences.' },
  { num:47, text: "Oh let your ...... down for once!", options: ["nose","eyelashes","moustache","hair"], correct: 3, explanation: '"Let your hair down" = relax.' },
  { num:48, text: "A faster-played sport would keep the audience on the ...... of their seats.", options: ["edge","centre","bottom","top"], correct: 0, explanation: '"On the edge of their seats" = excited.' },
  { num:49, text: "Travellers differ from tourists in that they prefer getting off the beaten ...... to holidaying at popular holiday spots.", options: ["road","track","street","court"], correct: 1, explanation: '"Off the beaten track" = remote areas.' },
  { num:50, text: "The most amazing thing about this year's Oscar winning film is that it was made ...... a shoestring budget.", options: ["in","by","from","on"], correct: 3, explanation: '"On a shoestring budget" = cheap production.' },
  { num:51, text: "Don't believe everything you see in travel brochures; read ...... the lines before you make your final decision.", options: ["on","above","between","under"], correct: 2, explanation: '"Read between the lines" = infer hidden meaning.' },
  { num:52, text: "I can't believe I got a promotion! Let's go out and paint the ...... red.", options: ["house","town","country","wall"], correct: 1, explanation: '"Paint the town red" = celebrate.' },
  { num:53, text: "To make up for the poor service, the restaurant owner told us our drinks were ...... the house.", options: ["from","on","at","in"], correct: 1, explanation: '"On the house" = free.' },
  { num:54, text: "The trip wasn't all bad. At ...... we got to visit plenty of interesting ruins.", options: ["list","least","large","present"], correct: 1, explanation: '"At least" introduces a positive point.' },
  { num:55, text: "I am very busy at work at ...... but when things relax a bit I am going to go on a cruise.", options: ["least","large","present","nowadays"], correct: 2, explanation: '"At present" = currently.' },
  { num:56, text: "Dave is ...... odds with John over what CDs to bring to the graduation party.", options: ["in","from","on","at"], correct: 3, explanation: '"At odds with" = in disagreement.' },
  { num:57, text: "Although I love getting lost in a good novel, at ...... I just like to sit and listen to classical music.", options: ["odds","times","glances","moment"], correct: 1, explanation: '"At times" = sometimes.' },
  { num:58, text: "At ...... I found my passport tucked away in the zipped compartment of my suitcase.", options: ["last","list","late","latest"], correct: 0, explanation: '"At last" = finally.' },
  { num:59, text: "From the sly look on the taxi driver's face, I knew ...... a glance that he couldn't be trusted.", options: ["in","from","on","at"], correct: 3, explanation: '"At a glance" = immediately upon looking.' },
  { num:60, text: "The 5 o'clock news reported that the escaped prisoner was still at ...... .", options: ["prison","jail","loose","large"], correct: 3, explanation: '"At large" = free and not captured.' },
  { num:61, text: "Due to the bazaar in the city centre, traffic was at a ...... for two hours.", options: ["loss","stop","standstill","stoppage"], correct: 2, explanation: '"At a standstill" = completely stopped.' },
  { num:62, text: "I am really at a ...... end now that the Christmas holidays are here.", options: ["loose","loss","lost","loosing"], correct: 0, explanation: '"At a loose end" = nothing to do.' },
  { num:63, text: "Steven invited some friends over and was totally at a ...... as to what to offer them to eat.", options: ["loose","loss","lost","loosing"], correct: 1, explanation: '"At a loss" = uncertain.' },
  { num:64, text: "Brewer escaped from prison last year and has been on the ...... ever since.", options: ["loose","loss","lost","loosing"], correct: 0, explanation: '"On the loose" = free after escaping.' },
  { num:65, text: "It is a small house, but at ...... it has a garden.", options: ["list","least","large","latest"], correct: 1, explanation: '"At least" introduces a positive.' },
  { num:66, text: "Twelve prisoners are at ...... following a series of escapes.", options: ["prison","jail","loose","large"], correct: 3, explanation: '"At large" = free and not captured.' },
  { num:67, text: "At ...... the government is beginning to listen to our problems.", options: ["last","list","late","latest"], correct: 0, explanation: '"At last" = finally.' },
  { num:68, text: "At ...... she is working abroad.", options: ["least","large","present","nowadays"], correct: 2, explanation: '"At present" = currently.' },
  { num:69, text: "I am at a ...... to know how I can help you.", options: ["loose","loss","lost","loosing"], correct: 1, explanation: '"At a loss" = uncertain.' },
  { num:70, text: "I usually prefer staying at home to going out, but at ...... I go on a picnic with my friends.", options: ["odds","times","glances","moment"], correct: 1, explanation: '"At times" = sometimes.' },
  { num:71, text: "They are at ...... over the funding of the project.", options: ["odds","times","loss","large"], correct: 0, explanation: '"At odds over" = in disagreement.' },
  { num:72, text: "The negotiations between the two countries are currently at a ...... .", options: ["loss","stop","standstill","stoppage"], correct: 2, explanation: '"At a standstill" = not progressing.' },
  { num:73, text: "He could tell at a ...... that something was wrong.", options: ["glance","glimpse","look","wink"], correct: 0, explanation: '"At a glance" = immediately upon looking.' },
  { num:74, text: "If you find yourself at a ...... end, you could always clean the bathroom.", options: ["loose","loss","lost","loosing"], correct: 0, explanation: '"At a loose end" = nothing to do.' },
  { num:75, text: "If a criminal or a dangerous animal is on the ...... they have escaped from prison or from their cage.", options: ["loose","loss","large","loosing"], correct: 0, explanation: '"On the loose" = escaped and free.' },
  { num:76, text: "We put ...... our tent before it got too dark to see what we were doing.", options: ["up","up with","down","off"], correct: 0, explanation: '"Put up" = erect.' },
  { num:77, text: "We put ...... our picnic, hoping the next day would be overcast.", options: ["up","up with","down","off"], correct: 3, explanation: '"Put off" = postpone.' },
  { num:78, text: "After what you put her ...... I'd be surprised if she ever went out with you again.", options: ["up","through","down","off"], correct: 1, explanation: '"Put through" = cause to endure.' },
  { num:79, text: "Stop putting the travel agent ...... it wasn't her fault we missed our flight.", options: ["up","up with","down","aside"], correct: 2, explanation: '"Put down" = criticize.' },
  { num:80, text: "I know you love cooking, but I don't know how you put ...... the mess afterwards.", options: ["up","up with","down","off"], correct: 1, explanation: '"Put up with" = tolerate.' },
  { num:81, text: "He managed to put ...... enough money to buy a car.", options: ["up","up with","down","aside"], correct: 3, explanation: '"Put aside" = save.' },
  { num:82, text: "It's great that I've got the internet, but my computer set me ...... a month's pay.", options: ["back","in","off","out"], correct: 0, explanation: '"Set back" = cost.' },
  { num:83, text: "If drowsiness sets ...... stop taking the medication immediately.", options: ["back","in","off","out"], correct: 1, explanation: '"Set in" = begin and continue.' },
  { num:84, text: "Could you please put the CDs ...... in the same order that you found them?", options: ["up","through","down","back"], correct: 3, explanation: '"Put back" = return to place.' },
  { num:85, text: "If we set ...... at dawn, we should arrive at the island by noon.", options: ["back","in","off","of"], correct: 2, explanation: '"Set off" = begin journey.' },
  { num:86, text: "They are going to put a hotel ...... where the museum used to be.", options: ["up","up with","down","off"], correct: 0, explanation: '"Put up" = build.' },
  { num:87, text: "I can't put ...... going to the dentist any longer.", options: ["up","up with","down","off"], correct: 3, explanation: '"Put off" = postpone.' },
  { num:88, text: "I am sorry to put you ...... this ordeal.", options: ["up","through","down","back"], correct: 1, explanation: '"Put through" = cause to experience.' },
  { num:89, text: "Why did you have to put me ...... in front of everybody like that?", options: ["up","up with","down","off"], correct: 2, explanation: '"Put down" = humiliate.' },
  { num:90, text: "I can put ...... the house being untidy, but I hate it if it's not clean.", options: ["up","up with","down","off"], correct: 1, explanation: '"Put up with" = tolerate.' },
  { num:91, text: "I put ...... a little every month for a deposit on a house.", options: ["up","up with","down","aside"], correct: 3, explanation: '"Put aside" = save.' },
  { num:92, text: "Buying that car must have set you ...... .", options: ["back","in","off","out"], correct: 0, explanation: '"Set back" = cost.' },
  { num:93, text: "If you get bitten by a dog, you have to make sure the wound is properly cleaned, or an infection could set ...... .", options: ["back","in","off","out"], correct: 1, explanation: '"Set in" = begin.' },
  { num:94, text: "Would you put the books ...... when you have finished with them?", options: ["up","through","down","back"], correct: 3, explanation: '"Put back" = return books.' },
  { num:95, text: "They have just set ...... on a round-the-world cruise.", options: ["back","in","off","through"], correct: 2, explanation: '"Set off" = begin a journey.' },
  { num:96, text: "The boys have gone on a fishing ...... with their father.", options: ["trip","journey","trek","hike"], correct: 0, explanation: '"Fishing trip" = short outing.' },
  { num:97, text: "The band gave a rousing ...... of the Stone's classic \"Brown Sugar\".", options: ["translation","execution","rendition","edition"], correct: 2, explanation: '"Rendition" = performance.' },
  { num:98, text: "His voice was barely ...... above the loud music.", options: ["listened","audible","loud","clear"], correct: 1, explanation: '"Audible" = able to be heard.' },
  { num:99, text: "I think you need a jacket; there is a ...... breeze blowing outside.", options: ["chilly","frosty","frigid","glacial"], correct: 0, explanation: '"Chilly" = cool breeze.' },
  { num:100, text: "He stood on the ...... of the ship and watched the seagulls dive for fish.", options: ["floor","ground","platform","deck"], correct: 3, explanation: '"Deck" = ship floor.' },
  { num:101, text: "The resort boasts a ...... beach and crystal clear sea.", options: ["pristine","pure","faultless","untouched"], correct: 0, explanation: '"Pristine" = unspoiled.' },
  { num:102, text: "The brother and sister were at ...... over who would get to inherit the beach house.", options: ["a standstill","a loose end","large","odds"], correct: 3, explanation: '"At odds over" = disagreement.' },
  { num:103, text: "Guests are required to state ...... for smoking or non-smoking accommodation upon booking.", options: ["likeness","care","preference","inclination"], correct: 2, explanation: '"Preference" = choice.' },
  { num:104, text: "The city was under ...... for six months before it finally fell.", options: ["blockade","cordon","closure","siege"], correct: 3, explanation: '"Under siege" = surrounded.' },
  { num:105, text: "It is impossible to travel in the ...... heat of the desert.", options: ["bubbling","smoldering","blistering","sizzling"], correct: 2, explanation: '"Blistering" = extremely hot.' },
  { num:106, text: "I enjoy taking a ...... bath as soon as I get home from work.", options: ["restful","gentle","soothing","mild"], correct: 2, explanation: '"Soothing" = relaxing.' },
  { num:107, text: "Frank has been the ...... of the local history museum for over 10 years now.", options: ["curator","escort","dean","conductor"], correct: 0, explanation: '"Curator" manages museum.' },
  { num:108, text: "He found the fact that Suzan had been saving money secretly quite ...... .", options: ["discordant","discontenting","disconcerting","discouraging"], correct: 1, explanation: '"Discontenting" = causing dissatisfaction.' },
  { num:109, text: "The ceiling-high bookcase swayed for a few seconds, then crashed to the floor with a ...... noise.", options: ["vociferous","raucous","boisterous","deafening"], correct: 3, explanation: '"Deafening" = extremely loud.' },
  { num:110, text: "Use the ...... to drain spaghetti, but make sure that you do it quickly enough so that it doesn't go cold.", options: ["whisk","colander","saucepan","grater"], correct: 1, explanation: '"Colander" drains pasta.' },
  { num:111, text: "After congratulating his team, the coach left, allowing the player to let ...... down for a while.", options: ["hair","heads","hearts","souls"], correct: 0, explanation: '"Let your hair down" = relax.' },
  { num:112, text: "Turn to page 24 to find out at a ...... which courses are available to you.", options: ["look","glance","stare","glimpse"], correct: 1, explanation: '"At a glance" = quickly.' },
  { num:113, text: "Mrs. Robinson ...... great pride in her cooking.", options: ["gets","finds","has","takes"], correct: 3, explanation: '"Takes pride in" = feel proud.' },
  { num:114, text: "Sleep is ...... to our health, and lack of it can lead to many illnesses.", options: ["needed","required","essential","desirable"], correct: 2, explanation: '"Essential" = absolutely necessary.' },
  { num:115, text: "The aircraft experienced severe ...... during the final approach, but the pilot kept his cool and landed it safely.", options: ["turbulence","instability","unsteadiness","wavering"], correct: 0, explanation: '"Turbulence" = violent air movement.' },
  { num:116, text: "The road was very ...... as a result of the overnight frost.", options: ["slippery","slick","slimy","greasy"], correct: 0, explanation: '"Slippery" = causes slipping.' },
  { num:117, text: "Following the accident, Sheila has been advised to take it ...... for a while.", options: ["careful","slow","gradual","easy"], correct: 3, explanation: '"Take it easy" = relax.' },
  { num:118, text: "The company is ...... investigation for suspected tax evasion.", options: ["into","under","on","in"], correct: 1, explanation: '"Under investigation" = being investigated.' },
  { num:119, text: "How do you ...... that he got that job without any experience?", options: ["suppose","presume","hypothesize","believe"], correct: 0, explanation: '"Suppose" = assume.' },
  { num:120, text: "The organizers expressed their ...... at the poor attendance figures.", options: ["dissention","disturbance","discourse","dismay"], correct: 3, explanation: '"Dismay" = disappointment.' },
  { num:121, text: "The notion of organ transplant ...... most people.", options: ["avoids","warns","repels","rebukes"], correct: 2, explanation: '"Repels" = causes dislike.' },
  { num:122, text: "Visiting the famine victims was a ...... experience.", options: ["harrowing","worrying","stressing","terrorizing"], correct: 0, explanation: '"Harrowing" = extremely distressing.' },
  { num:123, text: "Job retraining in middle age is a/an ...... for most people.", options: ["unapproachable","disheartening","daunting","demoralizing"], correct: 2, explanation: '"Daunting" = intimidating.' },
  { num:124, text: "Asking the staff to take a pay cut was a/an ...... suggestion.", options: ["absurd","abstract","abnormal","absent"], correct: 0, explanation: '"Absurd" = ridiculous.' },
  { num:125, text: "Negotiations between the union and the management are at a ...... .", options: ["stoppage","pause","hurdle","standstill"], correct: 3, explanation: '"At a standstill" = not progressing.' },
  { num:126, text: "We are putting ...... our summer holidays until the weather gets a bit better.", options: ["off","down","through","back"], correct: 0, explanation: '"Put off" = postpone.' },
  { num:127, text: "The car must have set Joe quite a bit ......; it's top of the range.", options: ["off","down","through","back"], correct: 3, explanation: '"Set back" = cost a lot.' },
  { num:128, text: "I thought I'd like living in the country, but it wasn't long before boredom set ...... and I was back to the city.", options: ["off","down","in","back"], correct: 2, explanation: '"Set in" = begin.' },
  { num:129, text: "Parents aren't always to blame ...... their children's bad behavior.", options: ["at","for","in","because"], correct: 1, explanation: '"Blame for" is correct.' },
  { num:130, text: "The film is based ...... the book of the same name.", options: ["at","for","on","in"], correct: 2, explanation: '"Based on" = derived from.' },
  { num:131, text: "If you are allergic ...... nuts, you should stay clear of Chinese food.", options: ["to","for","on","in"], correct: 0, explanation: '"Allergic to" = correct preposition.' },
  { num:132, text: "Let's get going before the rain sets ...... .", options: ["to","off","on","in"], correct: 3, explanation: '"Set in" = begin.' },
  { num:133, text: "They are setting ...... early to beat the rush hour traffic.", options: ["to","off","on","in"], correct: 1, explanation: '"Set off" = begin journey.' },
  { num:134, text: "I'll never forgive her for what she put me ...... .", options: ["off","down","through","back"], correct: 2, explanation: '"Put through" = cause to endure.' },
  { num:135, text: "Karen's husband is always putting her ...... in public. It's so embarrassing.", options: ["off","down","through","back"], correct: 1, explanation: '"Put down" = humiliate.' },
  { num:136, text: "Romantic novels provide a/an ...... from reality.", options: ["escape","escaping","escapist","narrow escape"], correct: 0, explanation: '"Escape" = way to forget reality.' },
  { num:137, text: "A/An ...... is something that helps you to forget about your usual life or problem.", options: ["escape","escaping","escapist","narrow escape"], correct: 0, explanation: '"Escape" = noun for distraction.' },
  { num:138, text: "The supporters watched in ...... as their team lost 6-0.", options: ["dismal","dismiss","dismantle","dismay"], correct: 3, explanation: '"In dismay" = with distress.' },
  { num:139, text: "Aid workers were said to have been filled with ...... by the appalling conditions that the refugees were living in.", options: ["dismal","dismiss","dismantle","dismay"], correct: 3, explanation: '"Filled with dismay" = full of distress.' },
  { num:140, text: "It must be ...... to see all your children grown up and happy.", options: ["grateful","grating","gratifying","gratitude"], correct: 2, explanation: '"Gratifying" = giving satisfaction.' },
  { num:141, text: "It is ...... to note that already much has been achieved.", options: ["grateful","grating","gratifying","gratitude"], correct: 2, explanation: '"Gratifying" = pleasing.' },
  { num:142, text: "The success rate in the exam was ...... high.", options: ["gratifyingly","gratifying","sadly","miserably"], correct: 0, explanation: '"Gratifyingly" = adverb meaning pleasingly.' },
  { num:143, text: "I shall be left with many ...... memories of the time I spent in India.", options: ["endemic","endangered","during","enduring"], correct: 3, explanation: '"Enduring memories" = lasting memories.' },
  { num:144, text: "We must encourage ...... if the company is to remain competitive.", options: ["innovative","innovator","innovation","novice"], correct: 2, explanation: '"Innovation" = new ideas.' },
  { num:145, text: "Many people feel bewildered by the speed of technological ...... .", options: ["innovative","innovator","innovation","novice"], correct: 2, explanation: '"Technological innovation" = advances.' },
  { num:146, text: "Growing boys have ...... appetites.", options: ["ravenously","ravenous","ravish","raven"], correct: 1, explanation: '"Ravenous" = extremely hungry.' },
  { num:147, text: "I am ...... where is supper?", options: ["ravenously","ravenous","ravish","raven"], correct: 1, explanation: '"Ravenous" = very hungry.' },
  { num:148, text: "I was ...... hungry.", options: ["ravenously","ravenous","ravish","raven"], correct: 0, explanation: '"Ravenously" = adverb extremely hungry.' },
  { num:149, text: "The coat has a special surface that ...... moisture.", options: ["repeats","repels","pushes","repeals"], correct: 1, explanation: '"Repels" = resists moisture.' },
  { num:150, text: "The defenders ...... the attack without losing any men.", options: ["repeated","repelled","pushed","repealed"], correct: 1, explanation: '"Repelled" = drove back attack.' },
  { num:151, text: "Similar poles of magnets ...... each other, and opposite poles attract.", options: ["repeat","repel","distract","repeal"], correct: 1, explanation: '"Repel" = push away.' },
  { num:152, text: "The road was covered with ...... of glass from the shattered window.", options: ["fragments","fragrances","fractions","fractures"], correct: 0, explanation: '"Fragments" = small pieces.' },
  { num:153, text: "A ...... is a small piece of something that has broken off or that comes from something larger.", options: ["fracture","fragrance","fraction","fragment"], correct: 3, explanation: '"Fragment" = small broken piece.' },
  { num:154, text: "Such ...... prejudices cannot be corrected easily.", options: ["ingredient","ingrate","ingrained","close-grained"], correct: 2, explanation: '"Ingrained" = deeply rooted.' },
  { num:155, text: "The belief that you should own your house is deeply ...... in British Society.", options: ["ingredient","ingrate","ingrained","close-grained"], correct: 2, explanation: '"Ingrained" = firmly established.' },
  { num:156, text: "The young cubs hungrily ...... the deer.", options: ["devolved","devoured","devoted","devalued"], correct: 1, explanation: '"Devoured" = ate hungrily.' },
  { num:157, text: "She is a very keen reader; she ...... one book after another.", options: ["devolves","devours","devotes","devalues"], correct: 1, explanation: '"Devours" = reads eagerly.' },
  { num:158, text: "The government know they have to ...... carefully on this issue.", options: ["tread","trade","trad","treat"], correct: 0, explanation: '"Tread carefully" = proceed with caution.' },
  { num:159, text: "Before the days of automation, they used to ...... grapes to make wine.", options: ["tread","trade","trad","treat"], correct: 0, explanation: '"Tread grapes" = crush with feet.' },
  { num:160, text: "Yuck! Look what I've just ...... in!", options: ["trodden","traded","trad","treated"], correct: 0, explanation: '"Trodden in" = stepped in.' }
];

async function seedUnit2() {
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

    // Prepare docs
    const docs = unit2.map((q) => ({
      title: `Upstream Unit2 Q#${q.num}`,
      question_text: q.text,
      choices: q.options.map((opt, idx) => ({ id: String(idx + 1), text: opt, is_correct: idx === q.correct })),
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      category: upstreamCategory._id,
      source: "Upstream-Unit2",
      tags: ["upstream","unit2","vocab"],
      explanation: q.explanation,
      created_by: adminUser._id,
      version: 1,
      published: true
    }));

    console.log(`📝 Inserting ${docs.length} Unit 2 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    // Create quizzes (5 x 32)
    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    // remove any existing quizzes for this source
    const del = await Quiz.deleteMany({ source: "Upstream-Unit2" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Upstream-Unit2 quizzes`);

    const chunk = 32;
    const created = [];
    for (let i = 0; i < 5; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Upstream Unit 2 - Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `Upstream Unit 2 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "Upstream-Unit2",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    // Update category counts
    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} Unit 2 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding Unit 2:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUnit2();
