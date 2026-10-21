# donald-trump & nikki-haley — review

approved: yes

a = donald trump, b = nikki haley. 182 quotes from a, 221 from b, 10 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js donald-trump nikki-haley`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. iran-sanctions-policy
keep: yes
question: Should the U.S. maintain strict sanctions on Iran?
pole -1: Maintain strict sanctions to limit Iran's resources
pole +1: Lift sanctions to enable diplomatic engagement
score a: -0.90
score b: -0.80
models: sonnet a -0.90 b -0.80 · gpt-5 a -0.90 b -0.80 · confidence a 0.8 b 0.7
reason a: Trump strongly emphasizes that Iran was broke under his sanctions and criticizes their removal.
reason b: Haley criticizes lifting sanctions on Iran, saying it allowed money to flow to terrorist proxies.
quotes a:
- q128 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "Iran was broke under Donald Trump. Now Iran has $300 billion because they took off all the sanctions that I had."
- q2 (2026-09-23, “Trump Tells U.N. Iran Faces A Risk Of Obliteration” (print headline)…, https://www.nytimes.com/2026/09/22/us/politics/un-trump-speech-iran-venezuela-greenland.html?smid=nytcore-ios-share): "I have a big decision to make, will a deal be made with Iran that lets them rebuild and create a far greater country than it ever was before - maybe one of the greatest in the Middle East or even the world? Or do I annihilate the Islamic Republic and do it quickly, never giving them a chance to kill and destroy people and countries again?"
quotes b:
- q6 (2024-02-04, CNN SOTU interview on 2024 Presidential Hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Foreign_Policy.htm): "he never should have fallen all over himself to get back into the Iran deal. By doing that, he lifted the sanctions. All the money flowed to all of the terrorist proxies around the region."

## 2. israel-palestine-solution
keep: no
question: Is a two-state solution viable for Israel and Palestine?
pole -1: Two-state solution is possible with negotiation
pole +1: Two-state solution is not achievable
score a: +0.00
score b: +0.95
models: sonnet a +0.00 b +0.90 · gpt-5 a +0.00 b +1.00 · confidence a 0.1 b 0.9
note: not clear enough -> confidence a 0.1, b 0.9 (needs 0.6)
reason a: Quote about Strait of Hormuz and Iranian Navy does not address two-state solution viability.
reason b: Haley explicitly states a two-state solution was not possible because Palestinians wouldn't come to the table.
quotes a:
- q18 (2026-03-11, "Hormuz Strait Attacks Follow Trump Saying Crews Should ‘Show Some Gu…, https://www.newsweek.com/hormuz-strait-attacks-follow-trump-saying-crews-should-show-some-guts-11660339): "These ships should go through the Strait of Hormuz and show some guts, there’s nothing to be afraid of ... They have no Navy, we sunk all their ships."
quotes b:
- q31 (2024-01-10, CNN 2024 pre-Iowa caucus one-on-one debate, https://www.ontheissues.org/2024_GOP_Iowa.htm): "When I was at the United Nations, I fought every day for Israel. I said a two-state solution wasn't something that was possible because Israel would always come to the table and the Palestinians wouldn't."

## 3. abortion-restrictions
keep: no
question: Should late-term abortions be banned?
pole -1: Ban late-term abortions
pole +1: Keep late-term abortion access available
score a: -0.10
score b: -0.87
models: sonnet a +0.00 b -0.85 · gpt-5 a -0.20 b -0.90 · confidence a 0.3 b 0.9
note: not clear enough -> confidence a 0.3, b 0.9 (needs 0.6)
reason a: Trump mentions exceptions but doesn't specifically address late-term abortion bans.
reason b: Haley explicitly asks if everyone can agree to ban late-term abortions and challenges opponents on their position.
quotes a:
- q112 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "I believe in the exceptions for rape, incest and life of the mother. I believe strongly in it."
quotes b:
- q88 (2023-08-23, wikiquote: Republican Presidential Debate in Milwaukee, Wisconsin (23…, https://en.wikiquote.org/wiki/Nikki_Haley): "Bret, I think we're all pro-life. But what I would love is for someone to ask Biden and Kamala Harris, are they for 38 weeks or are they for 39 weeks, are they for 40 weeks? Because that's what the media needs to be asking."
- q94 (2023-08-23, Fox News 2023 Republican primary debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "Can't we all agree that we should ban late term abortions? Can't we all agree that we should encourage adoptions? Can't we all agree that doctors and nurses who don't believe in abortion shouldn't have to perform them?"

## 4. federal-programs-decentralization
keep: yes
question: Should federal programs be transferred to state control?
pole -1: Decentralize programs to state governments
pole +1: Keep programs under federal management
score a: -0.90
score b: -0.85
models: sonnet a -0.90 b -0.85 · gpt-5 a -0.90 b -0.85 · confidence a 0.9 b 0.9
reason a: Trump explicitly states he will close federal education programs and send them back to states.
reason b: Haley advocates for states' rights and wants to transfer federal programs to state level.
quotes a:
- q162 (2023-09-13, PoliticalWire.com on 2023 Presidential hopefuls, https://www.ontheissues.org/2023_Hopefuls.htm): "We're going to end education coming out of Washington, DC. We're going to close it up--all those buildings all over the place and people that in many cases hate our children. We're going to send it all back to the states."
quotes b:
- q8 (2024-02-04, CNN SOTU interview on 2024 Presidential Hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Principles_+_Values.htm): "when government stops listening, let's remember states' rights matter. You have to be as close to the people as possible."
- q22 (2024-01-10, CNN 2024 pre-Iowa caucus one-on-one debate, https://www.ontheissues.org/2024_GOP_Iowa.htm): "I want to take as many federal programs from D.C. as we can and send them down to the state level."

## 5. china-existential-threat
keep: no
question: Is China the primary threat to U.S. national security?
pole -1: China is the foremost strategic threat
pole +1: Other threats are equally or more pressing
score a: +0.15
score b: -0.10
models: sonnet a +0.00 b -0.60 · gpt-5 a +0.30 b +0.40 · confidence a 0.1 b 0.4
FLAG: models disagree on B by 1
note: not clear enough -> confidence a 0.1, b 0.4 (needs 0.6)
reason a: Quote about stock market does not address China as a threat.
reason b: Haley criticizes Trump for focusing only on trade with China, implying China is important but safety focus is needed.
quotes a:
- q155 (2024-01-10, Fox News Town Hall 2024 pre-Iowa caucus, https://www.ontheissues.org/2024/Donald_Trump_Budget_+_Economy.htm): "We have a situation which I believe the stock market goes up because I'm leading."
quotes b:
- q84 (2023-09-27, Fox Business 2023 Republican primary debate in Simi Valley, https://www.ontheissues.org/2023_GOP_Simi.htm): "This is where President Trump went wrong. He focused on trade with China. We need to start focusing on what keeps Americans safe."

## 6. national-debt-severity
keep: no
question: Is the U.S. national debt a critical problem?
pole -1: Runaway debt poses existential danger
pole +1: Debt is manageable at current levels
score a: +0.00
score b: +0.00
models: sonnet a +0.00 b +0.00 · gpt-5 a +0.00 b +0.00 · confidence a 0 b 0
note: not clear enough -> confidence a 0, b 0 (needs 0.6)
reason a: Quotes discuss political opponents and legal proceedings but do not address national debt.
reason b: Quote discusses Trump and chaos but does not mention national debt.
quotes a:
- q77 (2025-12-25, "Trump calls Democrats 'radical left scum' in Christmas Eve message T…, https://www.trtworld.com/article/08dba4da974b): "Merry Christmas to all, including the Radical Left Scum that is doing everything possible to destroy our Country, but are failing badly."
- q170 (2023-05-10, CNN Town Hall: interviews of 2024 presidential candidates, https://www.ontheissues.org/2024_CNN_Town_Halls.htm): "We had a horrible Clinton-appointed judge. This is a rigged deal. My lawyer said, "sir, you don't have to do it. This is a fake story and you don't want to give it credibility." That's why I didn't go."
quotes b:
- q35 (2024-01-04, CNN Town Hall 2024 pre-Iowa caucus, https://www.ontheissues.org/2024_GOP_Iowa.htm): "I personally think President Trump was the right President at the right time. I agree with a lot of his policies. But, the reality is, rightly or wrongly, chaos follows him."

## 7. energy-independence-strategy
keep: yes
question: Should the U.S. pursue energy independence through fossil fuels?
pole -1: Prioritize oil and gas for independence
pole +1: Transition away from fossil fuels
score a: -0.90
score b: -0.10
models: sonnet a -0.90 b -0.40 · gpt-5 a -0.90 b +0.20 · confidence a 0.9 b 0.6
FLAG: models disagree on B by 0.6
reason a: Strongly advocates for oil, gas, and natural gas as cheaper and better energy sources and for regaining energy independence.
reason b: Acknowledges climate change but opposes relying on foreign oil and discusses transitioning, showing mixed position favoring some domestic fossil fuel production.
quotes a:
- q177 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "We want oil and gasoline and natural gas because it is cheaper, better and much more powerful."
- q178 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "Under my leadership we will regain energy independence that we had three years ago."
quotes b:
- q96 (2023-08-23, Fox News 2023 Republican primary debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "Is climate change real? Yes, it is. But if you want to really change the environment, then we need to start telling China and India that they have to lower their emissions."
- q98 (2023-07-30, CBS Face the Nation on 2023 Presidential primary hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Energy_+_Oil.htm): "What we don't want to do is go hat in hand to Saudi Arabia or get dirty oil from Iran or Venezuela. What we do want to do is look at what does transitioning look like."

## 8. border-enforcement-priority
keep: yes
question: Should border security be the top immigration priority?
pole -1: Secure borders is the primary focus
pole +1: Address root causes beyond enforcement
score a: -0.92
score b: -0.70
models: sonnet a -0.95 b -0.80 · gpt-5 a -0.90 b -0.60 · confidence a 0.8 b 0.6
reason a: Declares ending border invasion as immediate priority and emphasizes need for walls and borders.
reason b: States securing the border as a top priority with no more excuses as a key voting issue.
quotes a:
- q61 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "the day I took the oath of office as your 47th President, we ended the border invasion."
- q119 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "The election, people should never be thinking about an election as fraudulent. We need two things. We need walls. We have to have borders. And we have to have good elections."
quotes b:
- q3 (2024-05-22, On if she would vote for Biden or Trump in November, as quoted in Hal…, https://thehill.com/homenews/campaign/4680472-nikki-haley-backs-trump-2024-election/): "As a voter, I put my priorities on a president who’s going to have the backs of our allies and hold our enemies to account, who would secure the border, no more excuses. A president who would support capitalism and freedom, a president who understands we need less debt not more debt. Trump has not been perfect on these policies. I’ve made that clear, many, many times. But Biden has been a catastr…"

## 9. trade-leverage-tariffs
keep: no
question: Should the U.S. use tariffs as trade leverage?
pole -1: Use tariffs to enforce trade terms
pole +1: Avoid tariffs to maintain free trade
score a: -0.92
score b: +0.10
models: sonnet a -0.95 b +0.00 · gpt-5 a -0.90 b +0.20 · confidence a 0.85 b 0.3
note: not clear enough -> confidence a 0.85, b 0.3 (needs 0.6)
reason a: Strongly advocates using tariffs as leverage and punishment, including 100% tariffs for countries leaving dollar reserve currency.
reason b: Mentions selling to multiple countries beyond China but does not clearly address tariff policy.
quotes a:
- q28 (2026, wikiquote: September 2026, https://en.wikiquote.org/wiki/Donald_Trump): "If I don't trade with Mexico, they have nothing that we have to have. I mean, hot tamales? Tomatoes? A couple of things? Basically, they have nothing we need. We have oil. We have everything."
- q92 (2025-03-04, 2025 State of the Union address to Joint Session of Congress, https://www.ontheissues.org/2024/Donald_Trump_Free_Trade.htm): "If they do non-monetary tariffs to keep us out of their market, then we will do non-monetary barriers to keep them out of our market."
- q106 (2024-10-16, Chicago Economic Club transcript: 2024 Presidential hopefuls, https://www.ontheissues.org/2024/Donald_Trump_Free_Trade.htm): "If a country tells me, "sir, we like you very much, but we're going to no longer adhere to being in the reserve currency, we're not going to salute the dollar anymore," I'll say "that's okay. And you're going to pay a 100% tariff on everything you sell into the United States."
quotes b:
- q107 (2023-06-04, CNN Town Hall: interviews of 2024 presidential candidates, https://www.ontheissues.org/2024/Nikki_Haley_Free_Trade.htm): "I don't want our farmers to just sell to China. I will be their ambassador. In South Carolina, when I was governor, I sold South Carolina to everyone."

## 10. middle-class-economic-focus
keep: no
question: Is revitalizing the middle class the central economic goal?
pole -1: Prioritize rebuilding the middle class
pole +1: Focus on overall economic growth
score a: +0.00
score b: +0.10
models: sonnet a +0.00 b +0.00 · gpt-5 a +0.00 b +0.20 · confidence a 0 b 0.15
note: not clear enough -> confidence a 0, b 0.15 (needs 0.6)
reason a: Quotes discuss presidential powers and China relations but do not address middle class economic priorities.
reason b: Discusses inclusivity and welcoming different backgrounds but does not specifically address middle class economic focus.
quotes a:
- q81 (2025-08-26, The US system always had loopholes. Trump 2.0 exploits what others re…, https://rollcall.com/2025/08/27/the-u-s-system-always-had-loopholes-trump-2-0-exploits-what-others-resisted/): "I have the right to do anything I want to do. I'm the president of the United States. If I think our country is in danger, and it is in danger in these cities, I can do it."
- q164 (2023-08-23, Tucker on X interview opposite 2023 GOP debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "If I'm president, they'll get out. Because I had a very good relationship with President Xi. He respected this country. He respected me and he'll get out."
quotes b:
- q46 (2024, Address to the Republican National Convention in Milwaukee, Wisconsin, https://www.presidency.ucsb.edu/documents/address-the-republican-national-convention-milwaukee-wisconsin): "We are so much better when we are bigger. We are stronger when we welcome people into our party who have different backgrounds and experiences."
