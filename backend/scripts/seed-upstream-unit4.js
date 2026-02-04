import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Unit 4: 190 questions (provided by user). Options mark the correct answer with a trailing '✅'.
const raw = [
  { text: "My grandmother died at the ........... old age of 92.", options: ["mature","elderly","ageing","ripe ✅"], explanation: '"Ripe old age" is a fixed English idiom meaning a very advanced age.' },
  { text: "After a lengthy period of care at home, she was first admitted to hospital, then to a ........... home.", options: ["nursing ✅","nurse","nursery","nurture"], explanation: 'A "nursing home" is a residential institution providing care for elderly or chronically ill people.' },
  { text: "Medicaid finances health care for poor families, many of the disabled and many elderly ........... home patients.", options: ["nursing ✅","nurse","nursery","nurture"], explanation: '"Nursing home" is the standard term for a long-term care facility for the elderly.' },
  { text: "Eat less and exercise more if you want to live to a ripe ........... age", options: ["young","mature","old ✅","ancient"], explanation: 'The full idiom is "live to a ripe old age."' },
  { text: "A ........... on-wheels service was started in Keyingham in 1963, which still operates and serves up to 20 people twice a week.", options: ["food","beans","males","meals ✅"], explanation: '"Meals on wheels" is a community service that delivers food to people.' },
  { text: "Part-time workers were more likely to work for an employer who did not offer an occupational pension ........... .", options: ["scheme ✅","skim","schema","skimp"], explanation: 'A "pension scheme" is a formal plan to provide retirement benefits.' },
  { text: "I have less than a year to go before ...........", options: ["retire","retirement ✅","retreat","retard"], explanation: '"Retirement" is the noun referring to leaving one\'s job.' },
  { text: "Tickets are available from Meadowbank Sports Centre on priced £3-£10 with reductions for under 16s and ........... .", options: ["POAs","APOs","PAOs","OAPs ✅"], explanation: 'In the UK, "OAPs" stands for "Old Age Pensioners".' },
  { text: "The gang has struck at several homes in Monaghan, Cavan and Armagh stealing money from ........... .", options: ["pension","pensioners ✅","mentioners","mention"], explanation: '"Pensioners" are the people who receive a pension.' },
  { text: "Washington State gave its Schools for the 21st Century ........... to any rules that stood in their way.", options: ["waivers ✅","wavers","waves","wives"], explanation: 'A "waiver" is permission to avoid a rule or requirement.' },
  { text: "But while Stockton councillors yesterday agreed to put £19,000 towards the costs, . Middlesbrough said they could spend no more than £10,000.", options: ["cash-stripped","cash-strapped ✅","cash-strain","cash-strained"], explanation: '"Cash-strapped" means having very little money available.' },
  { text: "The vast majority, 95 percent, of deaths certified as due to were among those aged 65 +.", options: ["demerara","demerit","demand","dementia ✅"], explanation: '"Dementia" is a leading cause of death among the elderly.' },
  { text: "The couple found themselves by photographers as they left the church.", options: ["hound","hounded ✅","hounding","hind"], explanation: '"Hounded" means pursued relentlessly.' },
  { text: "When her daughter didn't arrive, she became increasingly", options: ["agitate","agitating","agitated ✅","aged"], explanation: '"Agitated" means troubled or nervous.' },
  { text: "I must admit that before my baby was born I was very about motherhood.", options: ["apprentice","apprehend","comprehensive","apprehensive ✅"], explanation: '"Apprehensive" means anxious or fearful.' },
  { text: "He suffered from the kind of hypersensitivity which, unchecked or unguarded, would have him.", options: ["incarcerated","incapacitated ✅","incarnated","inactivated"], explanation: '"Incapacitated" means deprived of strength or power.' },
  { text: "Improved sewage and water services were in preventing disease.", options: ["invective","invaluable ✅","inveigle","invalid"], explanation: '"Invaluable" means extremely useful.' },
  { text: "The couple were introduced to each other by a friend.", options: ["mutant","mutated","mutual ✅","muted"], explanation: 'A "mutual friend" is shared by two people.' },
  { text: "He had the gun pointed at my head. I was absolutely .", options: ["petrified ✅","petrifying","perfy","petrolhead"], explanation: '"Petrified" means terrified.' },
  { text: "Before the attack I'd received several phone calls.", options: ["threatened","threadbare","threatening ✅","certified"], explanation: '"Threatening" describes calls expressing intent to cause harm.' },
  { text: "Mr. Mohamed El- Sheikh advised us to avoid costly, solutions to our capstone challenge.", options: ["time-consume","time- consumed","time-consuming ✅","timekeeping"], explanation: '"Time-consuming" means taking a lot of time.' },
  { text: "Although living to a ripe old can only be a good thing, it brings with it a large number of problems that we have yet to deal with properly.", options: ["age ✅","time","person","life"], explanation: 'The idiom is "ripe old age."' },
  { text: "Nursing all need more investment if we wish our elderly to live as fulfilled and independent a life as possible.", options: ["flats","apartments","floors","homes ✅"], explanation: '"Nursing homes" is the standard term.' },
  { text: "The meals- on service and many other services would not have had to be cut.", options: ["cars","motors","wheels ✅","whales"], explanation: 'The service is called "meals on wheels."' },
  { text: "Young people today are encouraged to start saving with personal schemes as early as possible.", options: ["pension ✅","passion","penal","mansion"], explanation: 'A "personal pension scheme" is a private retirement savings plan.' },
  { text: "Start saving now to ensure an adequately financed", options: ["retire","retirement ✅","retreat","retard"], explanation: '"Retirement" is the noun referring to post-work life.' },
  { text: "Providers should pay special to preventive services for elderly immigrants.", options: ["attention ✅","intention","attendance","extension"], explanation: '"Pay attention" means to take notice of.' },
  { text: "Most health plans must cover a set of services, like shots and screening tests, at no cost to pensioners.", options: ["previous","progress","preventive ✅","prevented"], explanation: '"Preventive services" aim to prevent illness.' },
  { text: "Dozens of are hoping that they will be provided better health care services.", options: ["pension","pensioners ✅","mentioners","mention"], explanation: 'The sentence needs a noun for people: "pensioners".' },
  { text: "Many OAPs have been reduced and are petrified that they may be going to jail.", options: ["OAs","OAP","teens","tears ✅"], explanation: 'The phrase is "reduced to tears."' },
  { text: "The cash-strapped pensioners are in receipt of a full bin", options: ["waver","waiver ✅","weevil","fever"], explanation: 'A "waiver" is an official exemption.' },
  { text: "An agitated 82-year-old man with also had to face the civil summons for the alleged debt after returning from care.", options: ["dimension","dime","demean","dementia ✅"], explanation: '"Dementia" affects memory and thinking.' },
  { text: "His son said, \"This is an appalling situation where elderly people are being for cash even though they are in receipt of a full waiver.\"", options: ["hound","hounded ✅","hounding","hind"], explanation: '"Hounded" means pursued or harassed.' },
  { text: "Ronny Jones was found guilty of the of a 15-year-old girl.", options: ["murder ✅","embezzlement","trespassing","vandalism"], explanation: '"Murder" is the unlawful premeditated killing.' },
  { text: "Federal prosecutors have established that corrupt private contractors and government officials more than $2.5 million from the department.", options: ["kidnapped","murdered","embezzled ✅","trespassed"], explanation: '"Embezzled" means stole money entrusted to them.' },
  { text: "We nearly ran over a couple of. who walked out in front of the car.", options: ["jaywalkers ✅","kidnappers","trespassers","hijackers"], explanation: '"Jaywalkers" are pedestrians crossing unsafely.' },
  { text: "She denied murdering her husband but pleaded guilty to .", options: ["murder","manslaughter ✅","womanslaughter","innocence"], explanation: '"Manslaughter" is killing without malice aforethought.' },
  { text: "Finding some walls covered in graffiti, the policeman accused them of", options: ["fraud","slander","littering","vandalism ✅"], explanation: '"Vandalism" is deliberate damage to property.' },
  { text: "Shreds of plastic, old iron, glass, animal bones both sides of the path.", options: ["littered ✅","embezzled","trespassed","murdered"], explanation: '"Littered" means made untidy with rubbish.' },
  { text: "Landale is calling for more laws to protect consumers against", options: ["trespassing","fraud ✅","vandalism","littering"], explanation: '"Fraud" is criminal deception.' },
  { text: "The spread like wildfire and was only checked when the drunk who invented it confessed in a magistrates court.", options: ["vandalism","murder","loitering","slander ✅"], explanation: '"Slander" is a false spoken statement harming reputation.' },
  { text: "A policeman suspected him for and he couldn't justify why he was at that place for hours.", options: ["loitering with pretend","loitering with intent ✅","loitering with intend","loitering with a tent"], explanation: '"Loitering with intent" is lingering with suspected criminal purpose.' },
  { text: "Preston was a victim of a three months ago.", options: ["fugging","mugging ✅","rugging","running"], explanation: 'A "mugging" is an assault with intent to rob.' },
  { text: "She threatened to sue the magazine for", options: ["vandalism","murder","manslaughter","libel ✅"], explanation: '"Libel" is a published false damaging statement.' },
  { text: "Terrorists have a French officer and are demanding $400,000 from the French government.", options: ["loitered","trespassed","murdered","kidnapped ✅"], explanation: '"Kidnapped" means taken illegally by force.' },
  { text: "Carlson was fined $1000 for on government property.", options: ["trespassing ✅","murdering","kidnapping","jaywalking"], explanation: '"Trespassing" is entering without permission.' },
  { text: "Because she was a minor without a prior record, the young teenager was let off with a", options: ["capital punishment","court warning","prison term","probation ✅"], explanation: '"Probation" is supervision instead of prison.' },
  { text: "The US is one of the last countries in the Western world which still imposes for murder.", options: ["capital punishment ✅","court warning","prison term","parole"], explanation: '"Capital punishment" is the death penalty.' },
  { text: "Due to good behavior, the inmate was released on after having served only a third of his sentence.", options: ["capital punishment","court warning","prison term","parole ✅"], explanation: '"Parole" is early release under conditions.' },
  { text: "Many say that imposing on people who speed is an inadequate form of punishment.", options: ["revocation of a privilege","fine ✅","parole","prison term"], explanation: 'Speeding is commonly punished by a fine.' },
  { text: "The actor was ordered to do sixty hours of ...... after being arrested for fighting in a public place.", options: ["revocation of a privilege","court warning","community service ✅","capital punishment"], explanation: '"Community service" is unpaid work as a sentence.' },
  { text: "Considering his long criminal history, the judge sentenced the thief to a 10-year ......", options: ["community service","capital punishment","prison term ✅","court warning"], explanation: 'A "prison term" is a period of imprisonment.' },
  { text: "It is forbidden for those on ...... to leave the city or country of residence.", options: ["parole","probation ✅","community service","fine"], explanation: '"Probation" often includes travel restrictions.' },
  { text: "...... is effective in that it restricts your right to do something that you normally do for granted.", options: ["revocation of a privilege ✅","court warning","community service","capital punishment"], explanation: '"Revocation of a privilege" means taking away a right.' },
  { text: "We need an executive order to ...... federal contracts of businesses that hire illegal workers.", options: ["trespass","vandalize","revoke ✅","execute"], explanation: '"Revoke" means to officially cancel.' },
  { text: "The men each received a 30-year prison ......", options: ["jail","probation","semester","term ✅"], explanation: 'A "prison term" denotes length of imprisonment.' },
  { text: "The 31-year-old rap executive has been in jail since October for ...... violations.", options: ["fine","parole","probation ✅","capital punishment"], explanation: '"Probation violations" can result in jail.' },
  { text: "Hubbell went to prison for 18 months and is now out on ......", options: ["community service","capital punishment","court warning","parole ✅"], explanation: '"Out on parole" means released early under conditions.' },
  { text: "This whole ...... thing is becoming a real pain in the neck for a civilized society.", options: ["revocation of a privilege","court warning","community service","capital punishment ✅"], explanation: '"Capital punishment" is controversial.' },
  { text: "He was banned from driving for 6 months and ordered to do 200 hours of ......", options: ["revocation of a privilege","court warning","community service ✅","capital punishment"], explanation: 'Driving ban plus community service is common.' },
  { text: "A ...... will be imposed for overstaying your visa.", options: ["fine ✅","parole","probation","capital punishment"], explanation: 'Overstaying a visa typically results in a fine.' },
  { text: "I was stunned by the news, and my initial ...... was anger.", options: ["react","reactant","reactor","reaction ✅"], explanation: '"Reaction" is the noun for an emotional response.' },
  { text: "The murder of the young girl ...... a violent reaction from her family.", options: ["originated","produced ✅","developed","raised"], explanation: '"Produced" means caused.' },
  { text: "The project has been put off because they couldn't find a ...... location.", options: ["due","suitable ✅","valid","right"], explanation: '"Suitable" = appropriate.' },
  { text: "STEM students are known to ...... challenges at their capstone projects with unique professionalism.", options: ["order","run","control","handle ✅"], explanation: '"Handle challenges" = deal with them.' },
  { text: "She fears envy, so she tries to ...... her kids out of sight.", options: ["cover","pack","keep ✅","hold"], explanation: '"Keep out of sight" = hide.' },
  { text: "There was a dramatic ...... in his attitude towards investing in oil.", options: ["change","turn","switch","swing ✅"], explanation: '"Swing" = sudden shift.' },
  { text: "Three shots were heard being ...... before the murder was discovered.", options: ["thrown","aimed","pulled","fired ✅"], explanation: 'Shots are "fired."' },
  { text: "Jana found a big sum of money in the street and handed it in to the police. She is really honest; she is a ......", options: ["scarcity","unavailability","rarity ✅","shortage"], explanation: '"Rarity" = unusual person.' },
  { text: "The future ...... of the company was discussed at the meeting.", options: ["way","line","plan","direction ✅"], explanation: '"Future direction" = planned strategy.' },
  { text: "If you get enough sleep, your body ....... well.", options: ["practices","serves","functions ✅","exercises"], explanation: 'The body "functions" well.' },
  { text: "The company's plan to build a new factory in the area ....... a very strong reaction from the public.", options: ["originated","produced ✅","developed","raised"], explanation: '"Produced a reaction" fits.' },
  { text: "The plans for the new shelter were abandoned because a ....... location could not be found.", options: ["due","suitable ✅","valid","right"], explanation: '"Suitable location" is correct.' },
  { text: "He is known to ....... challenges at work with unique professionalism.", options: ["order","run","control","handle ✅"], explanation: '"Handle challenges" is correct.' },
  { text: "Maria's boss told her that personal items such as photographs should be ....... out of sight.", options: ["covered","packed","kept ✅","held"], explanation: '"Kept out of sight" is idiom.' },
  { text: "There has been a dramatic ....... in the public's attitude towards borrowing from banks.", options: ["change","turn","switch","swing ✅"], explanation: '"Dramatic swing" fits.' },
  { text: "The witness said that he heard two shots being ....... before seeing two men running down the street.", options: ["thrown","aimed","pulled","fired ✅"], explanation: 'Shots are "fired."' },
  { text: "Ted went to the police and handed in the money he found in the street; honest people like him are a ....... nowadays.", options: ["scarcity","unavailability","rarity ✅","shortage"], explanation: 'An honest person is "a rarity."' },
  { text: "The board held a meeting to discuss the future ....... of the organization.", options: ["way","line","plan","direction ✅"], explanation: '"Future direction" is common.' },
  { text: "Vegetable fats, ....... not as harmful as animal fats, can nevertheless result in gaining weight.", options: ["though ✅","yet","even","still"], explanation: '"Though" introduces a contrast.' },
  { text: "If you take regular exercise, your body ....... more effectively.", options: ["practices","serves","functions ✅","exercises"], explanation: 'The body "functions" more effectively.' },
  { text: "It will be, as usual, the taxpayer who will be ....... the bill.", options: ["footing ✅","legging","handing","chewing"], explanation: '"Footing the bill" = paying.' },
  { text: "Photographer Christopher Occhicone spent months following a group of addicts who live on the ....... of society.", options: ["fridges","friends","fringes ✅","brings"], explanation: '"On the fringes of society" = marginalized.' },
  { text: "One day, after years of violent abuse from her husband, she took the law ....... her own hands.", options: ["by","with","into ✅","onto"], explanation: '"Take the law into one\'s own hands" = vigilante action.' },
  { text: "I ....... two birds with one stone and picked the kids up on the way to the station.", options: ["killed ✅","caught","threw","murdered"], explanation: '"Kill two birds with one stone" = achieve two aims.' },
  { text: "The convict threw himself on the ....... of the court when he pleaded guilty.", options: ["fancy","mirth","mercury","mercy ✅"], explanation: '"Throw oneself on the mercy of the court" = plead leniency.' },
  { text: "There have been new procedures to ....... the generation gap.", options: ["block","fill","bridge ✅","merge"], explanation: '"Bridge the gap" = reduce differences.' },
  { text: "We hope for a world where the rule of law, not the law of ....... governs the conduct of nations.", options: ["wood","jungle ✅","circus","judges"], explanation: '"Law of the jungle" = survival of the fittest.' },
  { text: "Taking money out of the hospital's budget for this is simply ....... Peter to pay Paul.", options: ["embezzling","stealing","robbing ✅","frauding"], explanation: '"Robbing Peter to pay Paul" = solving one problem by creating another.' },
  { text: "He made a ....... on the stock exchange. He made a lot of money in a short time.", options: ["murder","killing ✅","manslaughter","gap"], explanation: '"Make a killing" = make a large profit.' },
  { text: "He never donates money to foreign organizations; he thinks ....... begins at home.", options: ["donation","donating","charitable","charity ✅"], explanation: '"Charity begins at home" = help your own first.' },
  { text: "As usual, we the taxpayers will end up ......... for the new animal shelter that the government is so busy boasting about.", options: ["footing the bill ✅","robbing Peter to pay Paul","making a killing","taking the law"], explanation: '"Footing the bill" = paying reluctantly.' },
  { text: "Soon after the thief had ......... selling his stolen goods, he was arrested for robbing the computer shop.", options: ["footed the bill","robbed Peter to pay Paul","made a killing ✅","taken the law"], explanation: '"Made a killing" = profited greatly.' },
  { text: "Why not ......... and have unemployed people plant trees in areas that have been devastated by fire?", options: ["foot the bill","take the law into our own hands","rob Peter to pay Paul","kill two birds with one stone ✅"], explanation: 'This plan solves two problems at once.' },
  { text: "In many inner-city areas, ......... prevails. The police have little or no control.", options: ["the law of the jungle ✅","on the fringes of society","generation gap","cultural gap"], explanation: '"Law of the jungle" describes chaotic lawlessness.' },
  { text: "Vagrants, being both homeless and jobless, live .........", options: ["the law of the jungle","on the fringes of society ✅","generation gap","cultural gap"], explanation: 'They live marginalized on the fringes.' },
  { text: "My grandad never contributed to international aid groups. He always said that ......... and that England had enough poor people to help.", options: ["rob Peter to pay Paul","charity begins at home ✅","foot the bill","take the law into your own hands"], explanation: '"Charity begins at home" is the proverb.' },
  { text: "Many Third World countries are borrowing from the World Bank to pay off their national debts; to my mind simply a case of .........", options: ["robbing Peter to pay Paul ✅","bridging the generation gap","footing the bill","taking the law into your own hands"], explanation: 'Using one loan to pay another is "robbing Peter to pay Paul".' },
  { text: "My community is attempting to ......... by having its youth group members put on shows at the local retirement home.", options: ["rob Peter to pay Paul","bridge the generation gap ✅","foot the bill","take the law into your own hands"], explanation: 'They are trying to bridge the generation gap.' },
  { text: "Knowing that his guilt was obvious, the young delinquent ......... , hoping for a lighter sentence.", options: ["robbed Peter to pay Paul","threw himself on the mercy of the court ✅","footed the bill","took the law into your own hands"], explanation: 'He pleaded for leniency.' },
  { text: "Despite his rage at being assaulted by his employer, the victim did not ......... but waited patiently for the outcome of the trial.", options: ["rob Peter to pay Paul","throw himself on the mercy of the court","foot the bill","take the law into his own hands ✅"], explanation: 'He did not take personal revenge.' },
  { text: "The newspaper reported that Wynn and his legal ......... set up a separate company to handle the settlement, which helped hide the payment.", options: ["guides","representatives ✅","presenters","barristers"], explanation: '"Legal representatives" is a general term for lawyers.' },
  { text: "Legal ......... are lawyers specialized in a specific field of the law and are employed to prevent their clients from any legal implications or consequences.", options: ["guides","representatives","presenters","advisors ✅"], explanation: '"Legal advisors" give legal advice.' },
  { text: "She accused her employer of unlawful dismissal and won the .........", options: ["condition","case ✅","cash","cascade"], explanation: 'You win a "case" in court.' },
  { text: "......... is an instruction made by a court telling someone what they can or cannot do.", options: ["Court case","Court order ✅","Court discussion","Court debate"], explanation: 'A "court order" is a formal command.' },
  { text: "Refugees are accorded special protection under ......... law.", options: ["economic","native","domestic","international ✅"], explanation: 'Refugee protection is governed by international law.' },
  { text: "Under the ......... law, no one is allowed to photograph military areas.", options: ["military ✅","native","domestic","international"], explanation: 'Rules about photographing military areas fall under military law.' },
  { text: "......... is a record of a person's criminal history.", options: ["World record","New record","Police record ✅","Phonograph record"], explanation: 'A "police record" documents arrests and convictions.' },
  { text: "Local people are calling for a police ......... into the accident.", options: ["inquiry ✅","inquire","request","require"], explanation: 'An "inquiry" is a formal investigation.' },
  { text: "Her husband was serving a life ......... for murder.", options: ["jail","prison","sentence ✅","clause"], explanation: 'A "life sentence" is the punishment.' },
  { text: "Life ......... is any sentence of imprisonment for a crime under which convicted persons are to remain in prison either for the rest of their natural life or until paroled.", options: ["jail","prison","imprisonment ✅","clause"], explanation: '"Life imprisonment" is the formal term.' },
  { text: "The minutes continued: The Cabinet then discussed the question of the abolition of ......... punishment.", options: ["capital ✅","city","town","major"], explanation: '"Capital punishment" = death penalty.' },
  { text: "There must be a ......... punishment for drug dealing.", options: ["heavy","weighty","severe ✅","several"], explanation: '"Severe punishment" = harsh penalty.' },
  { text: "Everyone is ......... against the clock to get things ready in time.", options: ["running","marathoning","going","racing ✅"], explanation: '"Racing against the clock" = hurry to meet deadline.' },
  { text: "Have you ever done anything that was against your better .........?", options: ["judgement ✅","judge","decision","opinion"], explanation: '"Against your better judgement" = despite knowing it may be unwise.' },
  { text: "She managed to win the trophy against all .........", options: ["things","odds ✅","rods","mud"], explanation: '"Against all odds" = despite low probability.' },
  { text: "This is the second time I've been passed ......... for promotion.", options: ["out","on","over ✅","away"], explanation: '"Passed over" = not chosen.' },
  { text: "Sorry to cut you ........., but there are one or two things I don't understand.", options: ["on","in","in on ✅","back"], explanation: '"Cut in on" = interrupt a conversation.' },
  { text: "Several major hospitals are cutting ......... staff at the moment.", options: ["in","back ✅","in on","back on"], explanation: '"Cut back" = reduce.' },
  { text: "I nearly passed ......... when I saw all the blood.", options: ["out ✅","on","over","away"], explanation: '"Pass out" = faint.' },
  { text: "By getting the design right, you can cut ......... accidents.", options: ["in","down","in on","down on ✅"], explanation: '"Cut down on" = reduce.' },
  { text: "When his wife died, he cut himself ......... other people.", options: ["off","off from ✅","over","away on"], explanation: '"Cut oneself off from" = isolate.' },
  { text: "I'm trying to cut ......... caffeine.", options: ["in","down","in on","down on ✅"], explanation: '"Cut down on" = reduce consumption.' },
  { text: "She's terribly upset because her father passed ......... last week.", options: ["out","down","over","away ✅"], explanation: '"Pass away" = die.' },
  { text: "Her father passed ......... last month and left her a big fortune.", options: ["out","on","down ✅","over"], explanation: 'There is a conflict in the original key; logically "passed on" = died, but the key marked "down".' },
  { text: "The woman alleges that her employers passed her ......... for promotion because she was pregnant.", options: ["over ✅","over for","away","out"], explanation: '"Passed over" = not considered for promotion.' },
  { text: "Could you pass it ......... Laura when you've finished reading it?", options: ["on","over","on to ✅","over on"], explanation: '"Pass on to" = give to someone next.' },
  { text: "A ......... is a legal representative who officially accuses someone of committing a crime, especially in a court of law.", options: ["barrister","judge","solicitor","prosecutor ✅"], explanation: 'A "prosecutor" brings the case.' },
  { text: "A ......... is a low- ranking police officer.", options: ["barrister","constable ✅","juror","prosecutor"], explanation: 'A "constable" is the lowest rank.' },
  { text: "A ......... is a lawyer who gives legal advice and prepares documents (e.g. wills) and cases.", options: ["barrister","judge","solicitor ✅","prosecutor"], explanation: 'A "solicitor" deals directly with clients.' },
  { text: "A ......... is a lawyer who represents clients in the higher courts of law.", options: ["barrister ✅","judge","solicitor","prosecutor"], explanation: 'A "barrister" advocates in higher courts.' },
  { text: "A ......... is a person (not a lawyer) who can act as a judge in a local criminal case.", options: ["barrister","justice of the peace ✅","solicitor","prosecutor"], explanation: 'A "justice of the peace" is a lay magistrate.' },
  { text: "A ......... is one of twelve members of the jury, made up of members of the public, whose duty is to hear the cases for and against the accused and reach a verdict of guilty or innocent.", options: ["barrister","constable","juror ✅","prosecutor"], explanation: 'A "juror" is a member of the jury.' },
  { text: "A ......... is a legal professional who presides over a court of law.", options: ["barrister","judge ✅","solicitor","prosecutor"], explanation: 'A "judge" presides over court.' },
  { text: "The prisoners ......... during the night.", options: ["reached a verdict","broke out of prison ✅","made an arrest","passed a law"], explanation: '"Broke out of prison" = escaped.' },
  { text: "He took ......... against the exploitation of young children.", options: ["posture","verdict","stand ✅","stack"], explanation: '"Take a stand" = adopt a firm position.' },
  { text: "The police ......... this morning at the corner shop.", options: ["arrested","made a prison","did an arrest","made an arrest ✅"], explanation: '"Make an arrest" = take someone into custody.' },
  { text: "The accused is going ......... his crime if he is found guilty.", options: ["pay","pay for ✅","imprison","imprison for"], explanation: '"Pay for" = be punished.' },
  { text: "The children wanted to ......... the trouble they caused.", options: ["do mends for","make mends for","do amends for","make amends for ✅"], explanation: '"Make amends for" = compensate.' },
  { text: "We must ......... to protect the environment.", options: ["do our bit ✅","make our bit","do our bits","make our bits"], explanation: '"Do our bit" = contribute.' },
  { text: "Mr. Smith took the ......... for the vandalism that his son caused to the school.", options: ["frame","blade","blame ✅","game"], explanation: '"Take the blame" = accept responsibility.' },
  { text: "If you run a red light, you will ......... .", options: ["reach a verdict","pay a fine ✅","pay attention","pass a law"], explanation: 'Running a red light typically results in a fine.' },
  { text: "Mike ......... the law two weeks ago.", options: ["damaged","broke down","passed","broke ✅"], explanation: '"Broke the law" = committed a crime.' },
  { text: "The parliament ......... three laws last week.", options: ["damaged","fragmented","passed ✅","broke down"], explanation: 'A parliament "passes" laws.' },
  { text: "To avoid any misunderstandings, my boss ......... the law.", options: ["broke","passed","put down","laid down ✅"], explanation: '"Lay down the law" = state rules firmly.' },
  { text: "After having ......... John Hexter was released yesterday.", options: ["laid down the law","served time in prison ✅","pleaded guilty","reached a verdict"], explanation: '"Served time in prison" = completed sentence.' },
  { text: "He was served with a ......... when he kidnapped his daughter.", options: ["warrant ✅","warranty","prison","jail"], explanation: 'An "arrest warrant" authorizes arrest.' },
  { text: "When you ......... a crime, you must be punished for it.", options: ["make","commit ✅","pass","break"], explanation: 'The verb is "commit a crime".' },
  { text: "The jury has ......... a verdict.", options: ["arrived","paid","reached ✅","formed"], explanation: 'A jury "reaches" a verdict.' },
  { text: "The accused could not ......... to support his case.", options: ["reach a verdict","pass a law","plead guilty","give evidence ✅"], explanation: 'A defendant "gives evidence" to support their case.' },
  { text: "The suspect was seen ......... with intent outside of the jewellery store.", options: ["lying","loitering ✅","waiting","standing"], explanation: '"Loitering with intent" is the phrase.' },
  { text: "The careless driver was charged with .........", options: ["manslaughter ✅","killing","murder","homicide"], explanation: 'Negligent death often leads to manslaughter charges.' },
  { text: "The ......... asked the judge to impose a life sentence because of the severity of the crime.", options: ["accuser","critic","prosecutor ✅","juror"], explanation: 'The prosecutor requests severe sentences.' },
  { text: "The decision to build a nuclear reactor in the area ......... a very strong reaction from the local community.", options: ["raised","originated","developed","produced ✅"], explanation: '"Produced a reaction" is common.' },
  { text: "Paul's ability to ......... a challenge made him the perfect candidate to head up the new sales division.", options: ["control","handle ✅","run","order"], explanation: '"Handle a challenge" = deal effectively.' },
  { text: "Several members of the environmental ......... group were arrested at the scene.", options: ["force","stressing","compelling","pressure ✅"], explanation: 'An "environmental pressure group" campaigns for protection.' },
  { text: "David Sylvester is considered to be a ......... authority on modern art.", options: ["leading ✅","first","premier","main"], explanation: 'A "leading authority" = foremost expert.' },
  { text: "Amnesty International is an internationally recognized ......... organization.", options: ["humanitarian ✅","people's","human","popular"], explanation: 'Amnesty is a "humanitarian organization."' },
  { text: "Travellers should have no problems finding assistance as the organization is ......... in several other European countries.", options: ["acted for","represented ✅","embodied","stood for"], explanation: 'An organization is "represented" in a country if present.' },
  { text: "The documentary skillfully depicts a nation ......... crisis.", options: ["in","on","under ✅","at"], explanation: '"In crisis" or "under crisis" — here marked as "under".' },
  { text: "In Britain, ......... authorities are responsible for handling the budgets of public services.", options: ["regional","native","local ✅","resident"], explanation: '"Local authorities" handle local budgets.' },
  { text: "You'll have to go into the bank if you want money, the cash machine isn't ......... correctly.", options: ["practising","serving","exercising","functioning ✅"], explanation: 'A machine "functions" (works).' },
  { text: "It's time the government ......... a stand against tax evaders and began prosecuting them.", options: ["had","took ✅","got","gave"], explanation: '"Take a stand" = oppose.' },
  { text: "I'd like to make ......... for crashing your car. Let me pay for the repairs.", options: ["improvements","corrections","amends ✅","adjustments"], explanation: '"Make amends" = compensate.' },
  { text: "I don't want to sound like I'm ......... the law, but if you don't keep the noise down, you will have to leave.", options: ["putting in","laying down ✅","passing over","giving over"], explanation: '"Lay down the law" = state rules authoritatively.' },
  { text: "The painting's value goes ......... economic measurement; it also has sentimental value.", options: ["far from","ahead of","beyond ✅","outside"], explanation: '"Goes beyond" = exceeds.' },
  { text: "It's the government's responsibility to ......... for the sick.", options: ["care ✅","treat","guard","cure"], explanation: '"Care for" = look after.' },
  { text: "Sharon ......... the old man when she did some volunteer work at the shelter.", options: ["friend","became friends","made friends","befriended ✅"], explanation: '"Befriended" = became friend to.' },
  { text: "Nathan is taking part in a research ......... on the effects of GM foods.", options: ["job","task","mission","project ✅"], explanation: 'A "research project" is a planned study.' },
  { text: "America holds ......... elections every four years.", options: ["presidential ✅","president","presiding","presided"], explanation: '"Presidential elections" choose the president.' },
  { text: "Business is ......... in the convenience food industry.", options: ["blowing","booming ✅","bustling","bursting"], explanation: 'Business "booming" = growing.' },
  { text: "A police ......... said that an investigation would be launched into the incident.", options: ["spokesperson ✅","speaker","envoy","agent"], explanation: 'A police spokesperson speaks to media.' },
  { text: "Building on this part of the island is .........", options: ["disallowed","precluded","barred","prohibited ✅"], explanation: '"Prohibited" = officially forbidden.' },
  { text: "Sniffer dogs are able to locate survivors beneath the rubble with .........", options: ["precision ✅","correctness","meticulousness","exactitude"], explanation: '"With precision" = exactly.' },
  { text: "......... punishment has been abolished in most countries of the world.", options: ["Major","Final","Capital ✅","Foremost"], explanation: '"Capital punishment" = death penalty.' },
  { text: "Politicians today have to be highly .........", options: ["articulate ✅","artful","articulated","artistic"], explanation: '"Articulate" = able to speak well.' },
  { text: "The managing director has just arrived and he looks as though he ......... business.", options: ["wants","does","means ✅","has"], explanation: '"Mean business" = be serious.' },
  { text: "I've agreed to work at the dog shelter twice a week on a(n) ......... basis.", options: ["voluntary ✅","unpaid","free","optional"], explanation: '"On a voluntary basis" = as a volunteer.' },
  { text: "There are reductions for ......... citizens and students.", options: ["pensioner","old","major","senior ✅"], explanation: '"Senior citizens" qualify for discounts.' },
  { text: "The government has voiced its commitment to ......... opportunities in the workplace.", options: ["equal ✅","similar","unbiased","same"], explanation: '"Equal opportunities" ensures fair treatment.' },
  { text: "....... my better judgement, I agreed to lend him my car.", options: ["On","Against ✅","Under","For"], explanation: '"Against my better judgement" = despite misgivings.' },
  { text: "Unemployed people tend to feel cut ......... from the rest of society.", options: ["in","on","down","off ✅"], explanation: '"Cut off from" = isolated.' },
  { text: "Roy was passed ......... for promotion in favour of a younger colleague.", options: ["off","down","away","over ✅"], explanation: '"Passed over" = overlooked.' },
  { text: "When my parents passed ......... , the left me the house and a sizeable amount of money.", options: ["off","down","away ✅","into"], explanation: '"Passed away" = died.' },
  { text: "George decided to take the law ......... his own hands and find the culprit.", options: ["off","down","away","into ✅"], explanation: '"Take the law into one\'s own hands" = act vigilantly.' },
  { text: "The doctor advised Liz to cut ......... on fatty and salty foods.", options: ["off","down ✅","away","into"], explanation: '"Cut down on" = reduce.' },
  { text: "If you break ......... of prison, they will add another year to your sentence.", options: ["off","down","away","out ✅"], explanation: '"Break out of prison" = escape.' },
  { text: "It was a race ......... the clock to get everything ready in time for the conference.", options: ["over","down","away","against ✅"], explanation: '"Race against the clock" = hurry.' },
  { text: "Overexercising can lead ......... muscle strain and a weakened immune system.", options: ["to ✅","down","away","into"], explanation: '"Lead to" = cause.' },
  { text: "Very few scientists are willing to go ......... the establishment for fear of losing credibility.", options: ["down","against ✅","away","over"], explanation: '"Go against the establishment" = oppose.' }
];

async function seedUnit4() {
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

    // parse raw -> docs
    const docs = raw.map((q, idx) => {
      const choices = q.options.map(opt => opt.replace(/✅/g, "").trim());
      const correctIndex = q.options.findIndex(opt => opt.includes("✅"));
      return {
        title: `Upstream Unit4 Q#${idx + 1}`,
        question_text: q.text,
        choices: choices.map((opt, i) => ({ id: String(i + 1), text: opt, is_correct: i === correctIndex })),
        difficulty: "medium",
        time_limit_seconds: 60,
        subject: "English",
        category: upstreamCategory._id,
        source: "Upstream-Unit4",
        tags: ["upstream","unit4","vocab"],
        explanation: q.explanation,
        created_by: adminUser._id,
        version: 1,
        published: true
      };
    });

    console.log(`📝 Inserting ${docs.length} Unit 4 questions...`);
    const inserted = await Question.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} questions`);

    // Create quizzes (10 x 19)
    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false, timestamps: true }));
    // remove existing for this source
    const del = await Quiz.deleteMany({ source: "Upstream-Unit4" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Upstream-Unit4 quizzes`);

    const chunk = 19;
    const created = [];
    for (let i = 0; i < 10; i++) {
      const slice = inserted.slice(i * chunk, (i + 1) * chunk).map(s => s._id);
      if (slice.length === 0) continue;
      const title = `Upstream Unit 4 - Part ${i + 1}`;
      const qdoc = await Quiz.create({
        title,
        description: `Upstream Unit 4 — Part ${i + 1} (${slice.length} questions)`,
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
        source: "Upstream-Unit4",
        created_by: adminUser._id
      });
      created.push(qdoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { quizCount: created.length, questionCount: inserted.length } });

    console.log(`\n🎉 Done — created ${created.length} Unit 4 quizzes.`);
  } catch (err) {
    console.error("❌ Error seeding Unit 4:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUnit4();
