# donald-trump & joe-biden — review

approved: yes

a = donald trump, b = joe biden. 182 quotes from a, 169 from b, 14 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js donald-trump joe-biden`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. iran-policy-approach
keep: yes
question: should the US pursue diplomatic negotiation or military confrontation with Iran?
pole -1: pursue military action and containment
pole +1: pursue diplomacy and deal-making
score a: -0.60
score b: +0.70
models: sonnet a -0.60 b +0.70 · gpt-5 a -0.60 b +0.70 · confidence a 0.7 b 0.6
reason a: Presents choice between deal-making or annihilation, emphasizes military options and shows of force over diplomatic engagement.
reason b: Emphasizes relentless pursuit of diplomacy while maintaining firm support, states diplomacy avoided wider war.
quotes a:
- q2 (2026-09-23, “Trump Tells U.N. Iran Faces A Risk Of Obliteration” (print headline)…, https://www.nytimes.com/2026/09/22/us/politics/un-trump-speech-iran-venezuela-greenland.html?smid=nytcore-ios-share): "I have a big decision to make, will a deal be made with Iran that lets them rebuild and create a far greater country than it ever was before - maybe one of the greatest in the Middle East or even the world? Or do I annihilate the Islamic Republic and do it quickly, never giving them a chance to kill and destroy people and countries again?"
- q14 (2026-03-30, "Trump wants to invade Iran to seize oil, calls US objectors ‘stupid …, https://www.aljazeera.com/news/2026/3/30/trump-wants-to-invade-iran-to-seize-oil-calls-us-objectors-stupid): "Maybe we take Kharg Island, maybe we don’t. We have a lot of options. It would also mean we had to be there for a while."
- q18 (2026-03-11, "Hormuz Strait Attacks Follow Trump Saying Crews Should ‘Show Some Gu…, https://www.newsweek.com/hormuz-strait-attacks-follow-trump-saying-crews-should-show-some-guts-11660339): "These ships should go through the Strait of Hormuz and show some guts, there’s nothing to be afraid of ... They have no Navy, we sunk all their ships."
quotes b:
- q1 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "My fellow Americans, I am speaking to you tonight from the Oval Office. Before I begin, let me speak to important news from earlier today. After eight months of nonstop negotiation, my administration — by my administration, a ceasefire and a hostage deal has been reached by Israel and Hamas, the elements of which I laid out in great detail in May of this year. This plan was developed and negotiat…"
- q6 (2025, Remarks on Implementation of the Cease-Fire and Hostage-Release Deal …, https://www.presidency.ucsb.edu/documents/remarks-implementation-the-cease-fire-and-hostage-release-deal-between-israel-and-hamas): "Some said my policy of a firm support for Israel is relentlessly pursuing diplomacy risked drawing America into a wider war in the region. I listened to those voices, many of whom I respected a great deal. But I concluded abandoning the course I was on would not have led us to the cease-fire we're seeing today, but instead, it would have risked the wider war in the region that so many feared."

## 2. israel-palestine-conflict
keep: no
question: should US policy prioritize Israeli security or Palestinian self-determination?
pole -1: prioritize Israeli security above all
pole +1: support two-state solution with Palestinian dignity
score a: +0.05
score b: +0.70
models: sonnet a +0.00 b +0.60 · gpt-5 a +0.10 b +0.80 · confidence a 0.2 b 0.8
note: not clear enough -> confidence a 0.2, b 0.8 (needs 0.6)
reason a: Only mentions getting a deal done between Iran and Israel without indicating policy priorities.
reason b: Explicitly supports two-state solution as only path guaranteeing both Israeli security and Palestinian peace with dignity.
quotes a:
- q87 (2025-06-15, "Trump threatens Iran with retaliation ‘at levels never seen before’"…, https://www.politico.eu/article/donald-trump-iran-retaliation-levels-never-seen-before/): "We can easily get a deal done between Iran and Israel, and end this bloody conflict."
quotes b:
- q84 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "the only real solution to the situation is a two-state solution over time. There is no other path that guarantees Israel's security and democracy. There is no other path that guarantees Palestinian can live in peace with peace and dignity."
- q1 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "My fellow Americans, I am speaking to you tonight from the Oval Office. Before I begin, let me speak to important news from earlier today. After eight months of nonstop negotiation, my administration — by my administration, a ceasefire and a hostage deal has been reached by Israel and Hamas, the elements of which I laid out in great detail in May of this year. This plan was developed and negotiat…"

## 3. border-immigration-policy
keep: yes
question: should the US enforce strict border enforcement and deportations?
pole -1: enforce strict border security and mass deportation
pole +1: allow managed immigration with humanitarian concerns
score a: -0.85
score b: -0.10
models: sonnet a -0.90 b -0.40 · gpt-5 a -0.80 b +0.20 · confidence a 0.8 b 0.6
FLAG: models disagree on B by 0.6
reason a: Describes ending border invasion and prioritizing deportation of illegals back home.
reason b: Supports emergency authority to shut down border when overwhelming but rejects wall as serious solution.
quotes a:
- q61 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "the day I took the oath of office as your 47th President, we ended the border invasion."
- q153 (2024-03-07, Trump Prebuttal to 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "my priority is securing our border, and sending Crooked Joe's illegals back home."
quotes b:
- q63 (2024-03-08, PolitiFact.com on 2024 State of the Union, https://www.ontheissues.org/SOTU_2024.htm): "new emergency authority to temporarily shut down the border when the number of migrants at the border is overwhelming."
- q129 (2023-10-06, CNBC and Reuters analysis of Biden Promises, https://www.ontheissues.org/Biden_Promises.htm): "building a massive wall that spans the entire southern border is not a serious policy solution."

## 4. economy-trickle-down
keep: no
question: should economic policy focus on top earners or working families?
pole -1: tax cuts and benefits for wealthy earners
pole +1: middle-out, bottom-up growth benefiting working families
score a: -0.30
score b: +0.90
models: sonnet a -0.30 b +0.90 · gpt-5 a -0.30 b +0.90 · confidence a 0.4 b 0.9
note: not clear enough -> confidence a 0.4, b 0.9 (needs 0.6)
reason a: Emphasizes record investment levels without clearly indicating whether policy targets top earners or working families.
reason b: Explicitly advocates middle-out, bottom-up economic growth and rejects trickle-down approach from his dad's perspective.
quotes a:
- q46 (2026, Remarks in Meeting With Travel Executives and an Exchange With Report…, https://www.presidency.ucsb.edu/documents/remarks-meeting-with-travel-executives-and-exchange-with-reporters): "So what's happening is amazing. It's not really covered properly, but it's something that's never happened before. The new number—because I've been saying $19.2 trillion for a while, but the new number's coming out: It's going to be over $20 trillion is being invested in the United States."
- q49 (2026, Remarks in Meeting With Travel Executives and an Exchange With Report…, https://www.presidency.ucsb.edu/documents/remarks-meeting-with-travel-executives-and-exchange-with-reporters): "But there's never been a time when $20 trillion of investment is coming in. And the other number was by China many years ago, the previous record, but this is a record that's five times greater."
quotes b:
- q104 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "But, to make the most of the opportunities ahead, I want to share key pages from our middle-out, bottom-up economic playbook and lay down what I believe to be a new set of benchmarks to measure against the next 4 years and see whether this theory is more than just a phenomenon."
- q108 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "My dad used to say—my dad was a well-read man who didn't get to—he got accepted to go to Hopkins and—but during the war, he never got to go. But my dad used to talk about—he said, "Dad"—"Joey, not a whole lot trickles down on my kitchen table at the end of the month.""
- q116 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "I came into office with a different vision for America that's been consistent with my record—good, bad, or indifferent—since I've been a Senator: grow the economy from the middle out and the bottom up; invest in America and American products."

## 5. abortion-policy
keep: yes
question: should abortion policy be decided federally or by states?
pole -1: leave abortion decisions to individual states
pole +1: protect abortion rights at federal level
score a: -0.90
score b: +0.75
models: sonnet a -0.90 b +0.80 · gpt-5 a -0.90 b +0.70 · confidence a 0.9 b 0.7
reason a: Emphatically states would not support federal ban and believes decisions should be left to states based on voters' will.
reason b: Criticizes state-by-state approach, compares it to turning back civil rights, implies federal protection needed.
quotes a:
- q109 (2024-10-02, 2024 Vice Presidential debate: Donald Trump Play-by-Play, https://www.ontheissues.org/2024_Veep_Debate.htm): "EVERYONE KNOWS I WOULD NOT SUPPORT A FEDERAL ABORTION BAN, UNDER ANY CIRCUMSTANCES, AND WOULD, IN FACT, VETO IT, BECAUSE IT IS UP TO THE STATES TO DECIDE BASED ON THE WILL OF THEIR VOTERS (THE WILL OF THE PEOPLE!)."
- q112 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "I believe in the exceptions for rape, incest and life of the mother. I believe strongly in it."
quotes b:
- q45 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "The fact is that the vast majority of constitutional scholars supported Roe when it was decided. And this is the guy [Trump] who says the states should be able to have it."
- q47 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "The idea that states are able to do this is a little like saying, we're going to turn civil rights back to the states. Let each state have a different rule."

## 6. law-enforcement-support
keep: yes
question: should the government strongly support police operations?
pole -1: strongly support police with few restrictions
pole +1: reform police with accountability measures
score a: -0.90
score b: +0.50
models: sonnet a -0.90 b +0.60 · gpt-5 a -0.90 b +0.40 · confidence a 0.9 b 0.6
reason a: Strongly supports police with backing and harsh penalties for crimes against officers without mentioning accountability measures.
reason b: Acknowledges police brutality concerns and racial disparities while noting most cops are good, suggesting reform orientation.
quotes a:
- q66 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "Together, we're showing what is possible when you finally have a President in the White House who supports our police, who lets you do your jobs, and who always backs the blue."
- q91 (2025-03-04, 2025 State of the Union address to Joint Session of Congress, https://www.ontheissues.org/2024/Donald_Trump_Crime.htm): "I've already signed an executive order requiring a mandatory death penalty for anyone who murders a police officer."
quotes b:
- q148 (2023-02-07, 2023 State of the Union speech, https://www.ontheissues.org/SOTU_2023.htm): "I've never had to have "The Talk" with my children that so many Black and Brown families have had with their children: "If a police officer pulls you over, turn on your interior lights. Don't reach for your license. Keep your hands on the steering wheel.""
- q149 (2023-02-07, 2023 State of the Union speech, https://www.ontheissues.org/SOTU_2023.htm): "I know most cops are good. decent people. They risk their lives every time they put on that shield. But what happened to Tyre in Memphis happens too often."

## 7. climate-policy
keep: yes
question: should climate action be prioritized over economic concerns?
pole -1: prioritize fossil fuels and energy independence
pole +1: prioritize climate action and clean energy
score a: -0.92
score b: +0.88
models: sonnet a -0.95 b +0.85 · gpt-5 a -0.90 b +0.90 · confidence a 0.9 b 0.9
reason a: Prioritizes fossil fuels as cheaper and better, focuses on energy independence over climate concerns.
reason b: Explicitly prioritizes climate action as most significant ever while rejecting economic tradeoffs and opposing fossil fuel interests.
quotes a:
- q177 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "We want oil and gasoline and natural gas because it is cheaper, better and much more powerful."
- q178 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "Under my leadership we will regain energy independence that we had three years ago."
quotes b:
- q2 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "You know, we've proven we don't have to choose between protecting the environment and growing the economy. We're doing both. But powerful forces want to wield their unchecked influence to eliminate the steps we've taken to tackle the climate crisis to serve their own interest for power and profit. We must not be bullied into sacrificing the future, the future of our children and our grandchildren…"
- q67 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm taking the most significant action ever on climate in the history of the world."

## 8. us-alliances-nato
keep: yes
question: should the US maintain strong NATO and international alliances?
pole -1: reduce reliance on NATO and alliances
pole +1: strengthen NATO and international partnerships
score a: -0.72
score b: +0.65
models: sonnet a -0.75 b +0.70 · gpt-5 a -0.70 b +0.60 · confidence a 0.7 b 0.6
reason a: States US needs nothing from NATO and emphasizes unilateral American dominance over alliance cooperation.
reason b: Emphasizes keeping commitments to allies and expresses concern about NATO countries' security.
quotes a:
- q15 (2026-03-26, "'Done Absolutely Nothing': Trump Fires At NATO Nations For No Action…, https://www.news18.com/world/done-absolutely-nothing-trump-fires-at-nato-nations-for-no-action-on-lunatic-iran-9998722.html): "NATO nations have done absolutely nothing to help with the lunatic nation, now militarily decimated, of Iran. the U.S.A needs nothing from NATO, but “never forget" this very important point in time!""
- q22 (2026-01-03, wikiquote: Remarks on U.S. military operations in Venezuela (3 Januar…, https://en.wikiquote.org/wiki/Donald_Trump): "Under our new national security strategy, American dominance in the western hemisphere will never be questioned again."
quotes b:
- q54 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024/Joe_Biden_Principles_+_Values.htm): "For all our problems and all our opportunities, we're the most progressive country in the world and getting things done. We're the strongest country in the world. We're country in the world who keeps our word and everybody trusts us, all of our allies."
- q59 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "What do you think happens to Poland? What do you think of Belarus? What do you think happens to those NATO countries?"

## 9. gun-policy
keep: yes
question: should the US implement stricter gun control measures?
pole -1: protect gun rights without restrictions
pole +1: implement assault weapon bans and background checks
score a: -0.77
score b: +0.93
models: sonnet a -0.85 b +0.90 · gpt-5 a -0.70 b +0.95 · confidence a 0.7 b 0.95
reason a: Explicitly rejects gun control measures, calling it a mental health and cultural problem rather than a gun problem.
reason b: Demands assault weapon bans, high capacity magazine bans, and universal background checks.
quotes a:
- q172 (2023-04-14, wikiquote: NRA convention speech (April 14, 2023), https://en.wikiquote.org/wiki/Donald_Trump): "Our country has been chock full of guns for centuries, and there was no talk of massacres of schoolchildren until around the year 2000. That's what it really started. They started talking about it. This is not a gun problem. This is a mental health problem. This is a social problem. This is a cultural problem. This is a spiritual problem."
quotes b:
- q74 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm demanding a ban on assault weapons and high capacity magazines. Pass universal background checks."

## 10. election-integrity
keep: yes
question: should election security be treated as a urgent priority?
pole -1: elections are fundamentally compromised and rigged
pole +1: protect election integrity through fair processes
score a: -0.75
score b: +0.78
models: sonnet a -0.70 b +0.75 · gpt-5 a -0.80 b +0.80 · confidence a 0.75 b 0.8
reason a: Claims elections are bad and fraudulent with allegations about illegal immigrants voting.
reason b: Emphasizes defending democracy through fair elections and rejecting political violence while calling for trust in institutions.
quotes a:
- q119 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "The election, people should never be thinking about an election as fraudulent. We need two things. We need walls. We have to have borders. And we have to have good elections."
- q120 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "Our elections are bad. And a lot of these illegal immigrants coming in, they're trying to get them to vote."
quotes b:
- q38 (2024-08-19, wikiquote: Speech at the 2024 Democratic National Convention (19 Augu…, https://en.wikiquote.org/wiki/Joe_Biden): "Folks, all of us carry a special obligation. Independents, Republicans, Democrats. We saved democracy in 2020, and now we must save it again in 2024. The vote that each of us cast this year will determine whether democracy and freedom will prevail. It’s that simple. It’s that serious. And the power is literally in your hands. History’s in your hands. Not hyperbole. It’s in your hands. America’s f…"
- q78 (2024-03-07, 2024 State of the Union address on Jan. 6th Capitol Riots, https://www.ontheissues.org/January_6th.htm): "I ask all of you without regard to party, to join together and defend democracy. Respect free and fair elections. Restore trust in our institutions and make clear, political violence has absolutely no place in America."

## 11. pandemic-response
keep: yes
question: did the US handle the pandemic response effectively?
pole -1: pandemic response was handled well
pole +1: pandemic response was inadequate
score a: -0.90
score b: +0.80
models: sonnet a -0.90 b +0.70 · gpt-5 a -0.90 b +0.90 · confidence a 0.85 b 0.75
reason a: Trump states they did a phenomenal job with the pandemic and left the country in strong condition.
reason b: Biden states the previous administration had no real plan through one of the toughest periods.
quotes a:
- q123 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "We did a phenomenal job with the pandemic. We handed them over a country where the economy and where the stock market was higher than it was before the pandemic came in."
quotes b:
- q106 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "The previous administration, quite frankly, had no plan—real plan—to get us through one of the toughest periods in our Nation's history."

## 12. employment-economy
keep: yes
question: has the economy created sufficient job opportunities?
pole -1: economy is weak with inadequate jobs
pole +1: economy achieved record job creation
score a: +0.05
score b: +0.95
models: sonnet a +0.80 b +0.95 · gpt-5 a -0.70 b +0.95 · confidence a 0.6 b 0.95
FLAG: models disagree on A by 1.5
reason a: Trump describes the nation as failing, in serious decline, and being laughed at worldwide.
reason b: Biden claims record job creation with 15-16 million new jobs, lowest unemployment in 50 years, and economy as envy of the world.
quotes a:
- q125 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "We're a failing nation. We're a nation that's in serious decline. We're being laughed at all over the world."
quotes b:
- q76 (2024-03-07, CNN FactCheck on 2024 State of the Union address, https://www.ontheissues.org/2024_FactCheck.htm): "Before I came to office, the country was hit by the worst pandemic and the worst economic crisis in the century. Now, our economy is literally the envy of the world. 15 million new jobs in just three years, a record."
- q98 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "Over 16 million new jobs—that's new jobs—the most in any single Presidential term in American history; the lowest average unemployment rate of any administration in the last 50 years; 20 million applications for new business records—I mean, it's—it's for a new business—for—that is a record, I should say; stock market hits record highs."

## 13. education-control
keep: no
question: should education policy be controlled by states or federal government?
pole -1: return education control to states
pole +1: maintain federal standards and investment in education
score a: -0.97
score b: +0.50
models: sonnet a -0.95 b +0.60 · gpt-5 a -1.00 b +0.40 · confidence a 0.95 b 0.5
note: not clear enough -> confidence a 0.95, b 0.5 (needs 0.6)
reason a: Trump explicitly states he will close federal education buildings and send all control back to states.
reason b: Biden discusses expanding federal tutoring programs and connecting schools with businesses, suggesting federal involvement.
quotes a:
- q162 (2023-09-13, PoliticalWire.com on 2023 Presidential hopefuls, https://www.ontheissues.org/2023_Hopefuls.htm): "We're going to end education coming out of Washington, DC. We're going to close it up--all those buildings all over the place and people that in many cases hate our children. We're going to send it all back to the states."
quotes b:
- q69 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I want to expand high-quality tutoring and summer learning to see that every child learns to read by third grade."
- q70 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm also connecting local businesses and high schools so students get hands-on experience and a path to a good-paying job whether or not they go to college, and I want to make sure that college more affordable."

## 14. china-trade-relations
keep: no
question: should the US pursue confrontation or engagement with China?
pole -1: take strong confrontational stance against China
pole +1: pursue diplomatic engagement with China
score a: -0.30
score b: +0.35
models: sonnet a -0.30 b +0.30 · gpt-5 a -0.30 b +0.40 · confidence a 0.5 b 0.45
note: not clear enough -> confidence a 0.5, b 0.45 (needs 0.6)
reason a: Trump emphasizes his good relationship with Xi and that Xi respected him and the country.
reason b: Biden mentions meeting with Xi and expresses optimism about possibilities in the region.
quotes a:
- q164 (2023-08-23, Tucker on X interview opposite 2023 GOP debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "If I'm president, they'll get out. Because I had a very good relationship with President Xi. He respected this country. He respected me and he'll get out."
quotes b:
- q127 (2023-11-16, Remarks after a Welcome Reception for APEC Leaders at The Exploratori…, https://www.whitehouse.gov/briefing-room/speeches-remarks/2023/11/15/remarks-by-president-biden-and-first-lady-jill-biden-after-a-welcome-reception-for-apec-leaders-san-francisco-ca/): "I had some comments to make to you. I'm not going to make them. I'm going to just summarize this way: You know, tonight, as I met with some of my colleagues that I've worked with from countries all across the region, including earlier today with Xi Jinping of China, you know, there's reason to be optimistic. There's reason to be optimistic. I look at all of you and I see the enthusiasm, I see the…"
