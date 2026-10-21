# donald-trump & kamala-harris — review

approved: yes

a = donald trump, b = kamala harris. 182 quotes from a, 157 from b, 12 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js donald-trump kamala-harris`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. iran-nuclear-program
keep: no
question: Should the US pursue diplomatic deals to limit Iran's nuclear program?
pole -1: Pursue diplomatic negotiations with Iran
pole +1: Take military action against Iran
score a: -0.30
score b: -0.05
models: sonnet a -0.20 b -0.40 · gpt-5 a -0.40 b +0.30 · confidence a 0.5 b 0.4
FLAG: models disagree on B by 0.7
note: not clear enough -> confidence a 0.5, b 0.4 (needs 0.6)
reason a: Mentions both making deals with Iran and potential military action, showing willingness to negotiate but also threatening force.
reason b: States willingness to take necessary action to defend against Iran but primarily emphasizes defensive posture rather than diplomatic deals or offensive action.
quotes a:
- q2 (2026-09-23, “Trump Tells U.N. Iran Faces A Risk Of Obliteration” (print headline)…, https://www.nytimes.com/2026/09/22/us/politics/un-trump-speech-iran-venezuela-greenland.html?smid=nytcore-ios-share): "I have a big decision to make, will a deal be made with Iran that lets them rebuild and create a far greater country than it ever was before - maybe one of the greatest in the Middle East or even the world? Or do I annihilate the Islamic Republic and do it quickly, never giving them a chance to kill and destroy people and countries again?"
- q87 (2025-06-15, "Trump threatens Iran with retaliation ‘at levels never seen before’"…, https://www.politico.eu/article/donald-trump-iran-retaliation-levels-never-seen-before/): "We can easily get a deal done between Iran and Israel, and end this bloody conflict."
quotes b:
- q65 (2024-08-22, wikiquote: Keynote Address at the Democratic National Convention (22 …, https://en.wikiquote.org/wiki/Kamala_Harris): "I will never hesitate to take whatever action is necessary to defend our forces and our interests against Iran and Iran-backed terrorists. I will not cozy up to tyrants and dictators like Kim Jong Un, who are rooting for Trump — who are rooting for Trump. Because, you know, they know — they know he is easy to manipulate with flattery and favors. They know Trump won’t hold autocrats accountable be…"

## 2. border-security-policy
keep: yes
question: Should the US prioritize stricter border enforcement and deportations?
pole -1: Strengthen enforcement and deport undocumented immigrants
pole +1: Pursue comprehensive immigration reform with pathways to citizenship
score a: -0.90
score b: +0.40
models: sonnet a -0.90 b +0.40 · gpt-5 a -0.90 b +0.40 · confidence a 0.8 b 0.8
reason a: Clearly prioritizes ending border invasion, securing borders, and sending undocumented immigrants back home.
reason b: Supports border security measures but also clearly advocates for comprehensive immigration reform with earned pathway to citizenship.
quotes a:
- q61 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "the day I took the oath of office as your 47th President, we ended the border invasion."
- q153 (2024-03-07, Trump Prebuttal to 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "my priority is securing our border, and sending Crooked Joe's illegals back home."
quotes b:
- q8 (2024-10-30, 2024 Presidential hopefuls: Rally on the Ellipse, https://www.ontheissues.org/2024/Kamala_Harris_Immigration.htm): "At the same time, we must acknowledge we are a nation of immigrants and I'll work with Congress to pass immigration reform including an earned path to citizenship for hardworking immigrants like farm workers and our dreamers."
- q21 (2024-10-10, Howard Stern Show interview of 2024 Presidential hopefuls, https://www.ontheissues.org/2024/Kamala_Harris_Immigration.htm): "The bill is and would have been the strongest border security bill in years. It would have put 1,500 more border agents at the border. I've been down to the border. Those border agents are working around the clock. They need help."
- q62 (2024-08-22, wikiquote: Keynote Address at the Democratic National Convention (22 …, https://en.wikiquote.org/wiki/Kamala_Harris): "After decades in law enforcement, I know the importance of safety and security, especially at our border. Last year, Joe and I brought together Democrats and conservative Republicans to write the strongest border bill in decades. The Border Patrol endorsed it. But Donald Trump believes a border deal would hurt his campaign, so he ordered his allies in Congress to kill the deal. Well, I refuse to …"

## 3. israel-palestine-conflict
keep: no
question: Should the US support a two-state solution with equal security for both sides?
pole -1: Support Israeli military operations without restrictions
pole +1: Advocate for two-state solution with equal Palestinian security
score a: -0.65
score b: +0.85
models: sonnet a -0.70 b +0.80 · gpt-5 a -0.60 b +0.90 · confidence a 0.3 b 0.9
note: not clear enough -> confidence a 0.3, b 0.9 (needs 0.6)
reason a: Quote about sinking Iranian ships suggests military approach but doesn't directly address Israel-Palestine two-state solution.
reason b: Explicitly advocates for two-state solution with equal security and dignity for both Israelis and Palestinians.
quotes a:
- q18 (2026-03-11, "Hormuz Strait Attacks Follow Trump Saying Crews Should ‘Show Some Gu…, https://www.newsweek.com/hormuz-strait-attacks-follow-trump-saying-crews-should-show-some-guts-11660339): "These ships should go through the Strait of Hormuz and show some guts, there’s nothing to be afraid of ... They have no Navy, we sunk all their ships."
quotes b:
- q33 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "We must chart a course for a two-state solution. And in that solution, there must be security for the Israeli people and Israel and in equal measure for the Palestinians."
- q89 (2024-03-24, ABC This Week on 2024 Democratic Veepstakes, https://www.ontheissues.org/2024/Kamala_Harris_Foreign_Policy.htm): "We've been very clear that far too many innocent Palestinians have been killed. We have been very clear that Israel and the Israeli people and Palestinians are entitled to an equal amount of security and dignity."
- q149 (2023-10-29, "Vice President Kamala Harris on Israel, Ukraine, gun violence and th…, https://www.cbsnews.com/news/kamala-harris-interview-60-minutes-transcript/): "A terrorist organization, Hamas, slaughtered hundreds of young people at a concert. By most estimates at least fourteen hundred Israelis are dead. Israel, without any question, has a right to defend itself. That being said, it is very important that there be no conflation between Hamas and the Palestinians. The Palestinians deserve equal measures of safety and security, self-determination and dig…"

## 4. reproductive-rights
keep: yes
question: Should abortion access be decided by states or protected federally?
pole -1: Allow states to decide abortion policy
pole +1: Protect abortion rights at the federal level
score a: -0.85
score b: +0.90
models: sonnet a -0.80 b +0.90 · gpt-5 a -0.90 b +0.90 · confidence a 0.9 b 0.9
reason a: Explicitly opposes federal abortion ban and states abortion policy should be decided by states based on will of voters.
reason b: Pledges to sign federal legislation restoring reproductive freedom and criticizes state-level restrictions from Supreme Court decision.
quotes a:
- q109 (2024-10-02, 2024 Vice Presidential debate: Donald Trump Play-by-Play, https://www.ontheissues.org/2024_Veep_Debate.htm): "EVERYONE KNOWS I WOULD NOT SUPPORT A FEDERAL ABORTION BAN, UNDER ANY CIRCUMSTANCES, AND WOULD, IN FACT, VETO IT, BECAUSE IT IS UP TO THE STATES TO DECIDE BASED ON THE WILL OF THEIR VOTERS (THE WILL OF THE PEOPLE!)."
- q112 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "I believe in the exceptions for rape, incest and life of the mother. I believe strongly in it."
quotes b:
- q23 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "Donald Trump hand-selected three members of the United States Supreme Court with the intention that they would undo the protections of Roe V. Wade. And they did exactly as he intended."
- q60 (2024-08-22, wikiquote: Keynote Address at the Democratic National Convention (22 …, https://en.wikiquote.org/wiki/Kamala_Harris): "I believe America cannot truly be prosperous unless Americans are fully able to make their own decisions about their own lives, especially on matters of heart and home. But tonight, in America, too many women are not able to make those decisions. And let’s be clear about how we got here. Donald Trump handpicked members of the United States Supreme Court to take away reproductive freedom. And now …"
- q84 (2024-05-08, Vice Presidential 2024 press release:"Reproductive Freedoms", https://www.ontheissues.org/2024_Pres_P_R.htm): "We witnessed, about two years ago, the highest court in our land take a constitutional right that had been recognized, from the women of America."

## 5. energy-independence
keep: yes
question: Should the US prioritize fossil fuels for energy independence?
pole -1: Prioritize oil, gas, and natural gas development
pole +1: Invest in diverse renewable energy sources
score a: -0.90
score b: +0.65
models: sonnet a -0.90 b +0.60 · gpt-5 a -0.90 b +0.70 · confidence a 0.9 b 0.7
reason a: Clearly prioritizes oil, gasoline, and natural gas as cheaper, better, and more powerful for energy independence.
reason b: Advocates for investing in diverse sources of energy to reduce foreign oil reliance rather than prioritizing fossil fuels.
quotes a:
- q177 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "We want oil and gasoline and natural gas because it is cheaper, better and much more powerful."
- q178 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "Under my leadership we will regain energy independence that we had three years ago."
quotes b:
- q29 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "My position is that we have got to invest in diverse sources of energy so we reduce our reliance on foreign oil."

## 6. nato-alliances
keep: yes
question: Are NATO alliances essential for US national security?
pole -1: NATO alliances are unnecessary for US security
pole +1: Strong alliances keep America safe and secure
score a: -0.80
score b: +0.90
models: sonnet a -0.80 b +0.90 · gpt-5 a -0.80 b +0.90 · confidence a 0.7 b 0.8
reason a: Dismisses NATO's value and states the US needs nothing from NATO.
reason b: Affirms that alliances keep Americans safe and make America stronger and more secure.
quotes a:
- q15 (2026-03-26, "'Done Absolutely Nothing': Trump Fires At NATO Nations For No Action…, https://www.news18.com/world/done-absolutely-nothing-trump-fires-at-nato-nations-for-no-action-on-lunatic-iran-9998722.html): "NATO nations have done absolutely nothing to help with the lunatic nation, now militarily decimated, of Iran. the U.S.A needs nothing from NATO, but “never forget" this very important point in time!""
quotes b:
- q5 (2024-10-30, 2024 Presidential hopefuls: Rally on the Ellipse, https://www.ontheissues.org/2024/Kamala_Harris_Foreign_Policy.htm): "I know that our alliances keep American people safe and make America stronger and more secure."

## 7. election-integrity
keep: yes
question: Are recent US elections secure and legitimate?
pole -1: Elections are rigged and fraudulent
pole +1: Elections are secure and must be accepted
score a: -0.70
score b: +0.93
models: sonnet a -0.70 b +0.95 · gpt-5 a -0.70 b +0.90 · confidence a 0.7 b 0.8
reason a: Claims elections are bad, fraudulent, and being manipulated by illegal immigrants voting.
reason b: Accepts election results, emphasizes peaceful transfer of power, and states accepting results is fundamental to democracy.
quotes a:
- q119 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "The election, people should never be thinking about an election as fraudulent. We need two things. We need walls. We have to have borders. And we have to have good elections."
- q120 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "Our elections are bad. And a lot of these illegal immigrants coming in, they're trying to get them to vote."
quotes b:
- q98 (2024, wikiquote: Speech conceding the 2024 United States presidential elect…, https://en.wikiquote.org/wiki/Kamala_Harris): "Now I know that folks are feeling and experiencing a range of emotions right now. I get it. But we must accept the results of this election. Earlier today, I spoke with President-Elect Trump and congratulated him on his victory. I also told him that we will help him and his team with their transition. And that we will engage in a peaceful transfer of power."
- q99 (2024, wikiquote: Speech conceding the 2024 United States presidential elect…, https://en.wikiquote.org/wiki/Kamala_Harris): "A fundamental principle of American democracy is that when we lose an election, we accept the results. That principle, as much as any other, distinguishes democracy from monarchy or tyranny. And anyone who seeks the public trust must honor it. At the same time, in our nation, we owe loyalty not to a president or a party, but to the Constitution of the United States, and loyalty to our conscience …"

## 8. immigration-reform
keep: yes
question: Should undocumented immigrants have a pathway to citizenship?
pole -1: No amnesty for illegal immigrants
pole +1: Create earned pathway to citizenship for immigrants
score a: -0.80
score b: +0.93
models: sonnet a -0.90 b +0.90 · gpt-5 a -0.70 b +0.95 · confidence a 0.6 b 0.9
reason a: Explicitly opposes amnesty for illegal immigrants.
reason b: Clearly supports earned pathway to citizenship for undocumented immigrants including farmworkers and dreamers.
quotes a:
- q55 (2026, Remarks During a Telerally for South Carolina Republican Senatorial C…, https://www.presidency.ucsb.edu/documents/remarks-during-telerally-for-south-carolina-republican-senatorial-candidate-senator-1): "She'll always vote to lower your taxes, big paychecks, no amnesty for illegal aliens, and she will always protect your Second Amendment and the right to keep and bear arms."
quotes b:
- q8 (2024-10-30, 2024 Presidential hopefuls: Rally on the Ellipse, https://www.ontheissues.org/2024/Kamala_Harris_Immigration.htm): "At the same time, we must acknowledge we are a nation of immigrants and I'll work with Congress to pass immigration reform including an earned path to citizenship for hardworking immigrants like farm workers and our dreamers."
- q63 (2024-08-22, wikiquote: Keynote Address at the Democratic National Convention (22 …, https://en.wikiquote.org/wiki/Kamala_Harris): "I know we can live up to our proud heritage as a nation of immigrants and reform our broken immigration system. We can create an earned pathway to citizenship and secure our border. And, America, we must also be steadfast in advancing our security and values abroad. As vice president, I have confronted threats to our security, negotiated with foreign leaders, strengthened our alliances, and engag…"

## 9. gun-policy
keep: yes
question: Should the US implement stricter gun control measures?
pole -1: Gun violence is a cultural problem, not guns
pole +1: Ban assault weapons and implement gun restrictions
score a: -0.92
score b: +0.93
models: sonnet a -0.95 b +0.90 · gpt-5 a -0.90 b +0.95 · confidence a 0.8 b 0.85
reason a: Explicitly states gun violence is not a gun problem but mental health, social, cultural, and spiritual problem.
reason b: Calls for banning assault weapons, high-capacity magazines, red flag laws, and universal background checks.
quotes a:
- q172 (2023-04-14, wikiquote: NRA convention speech (April 14, 2023), https://en.wikiquote.org/wiki/Donald_Trump): "Our country has been chock full of guns for centuries, and there was no talk of massacres of schoolchildren until around the year 2000. That's what it really started. They started talking about it. This is not a gun problem. This is a mental health problem. This is a social problem. This is a cultural problem. This is a spiritual problem."
quotes b:
- q82 (2024-06-14, White House Vice Presidential 2024 press release: "Cargill", https://www.ontheissues.org/2024_Pres_P_R.htm): "Unfortunately, today's Supreme Court ruling strikes down this important, commonsense regulation on devices that convert semiautomatic rifles into weapons that can fire hundreds of bullets per minute."
- q93 (2024-01-18, White House Vice Presidential 2024 press release: "Uvalde", https://www.ontheissues.org/2024_Pres_P_R.htm): "I am continuing to call on Congress and state legislators throughout America to have the courage to act by banning assault weapons and high-capacity magazines, passing red flag laws, and making background checks universal."

## 10. social-security-medicare
keep: yes
question: Should Social Security and Medicare be protected from cuts?
pole -1: Reform entitlements through cuts and restructuring
pole +1: Protect and expand Social Security and Medicare
score a: -0.62
score b: +0.73
models: sonnet a -0.65 b +0.85 · gpt-5 a -0.60 b +0.60 · confidence a 0.6 b 0.6
reason a: Suggests cutting entitlements and reforming management, though frames partly as addressing waste.
reason b: Opposes cuts to Social Security and Medicare, accusing opponent of trying to cut these programs.
quotes a:
- q150 (2024-03-15, FactCheck.org on 2024 State of the Union, https://www.ontheissues.org/SOTU_2024.htm): "There is a lot you can do in terms of entitlements in terms of cutting and in terms of also the theft and the tremendous bad management of entitlements."
quotes b:
- q57 (2024-08-22, wikiquote: Keynote Address at the Democratic National Convention (22 …, https://en.wikiquote.org/wiki/Kamala_Harris): "We are not going back to when Donald Trump tried to cut Social Security and Medicare. We are not going back to when he tried to get rid of the Affordable Care Act, when insurance companies could deny people with preexisting conditions. We are not going to let him eliminate the Department of Education that funds our public schools. We are not going to let him end programs like Head Start that prov…"

## 11. law-enforcement-support
keep: yes
question: Should government support and expand police authority?
pole -1: Support police with expanded law enforcement authority
pole +1: Reform justice system and hold officials accountable
score a: -0.90
score b: +0.65
models: sonnet a -0.90 b +0.70 · gpt-5 a -0.90 b +0.60 · confidence a 0.85 b 0.6
reason a: Strongly supports police with expanded authority and emphasizes backing law enforcement without qualification.
reason b: Emphasizes accountability and justice system reform, suggesting oversight over expanded authority.
quotes a:
- q66 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "Together, we're showing what is possible when you finally have a President in the White House who supports our police, who lets you do your jobs, and who always backs the blue."
- q70 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "But since I took office, Federal law enforcement has arrested, incredibly, 1.2 million criminals nationwide and bad ones."
quotes b:
- q44 (2024-09-09, 2024 Presidential campaign website KamalaHarris.com, https://www.ontheissues.org/2024/Kamala_Harris_Government_Reform.htm): "Vice President Harris believes that no one is above the law. She'll fight to ensure that no former president has immunity for crimes committed while in the White House."
- q73 (2024-07-23, Vice Presidential 2024 press release "Sonya Massey", https://www.ontheissues.org/2024_Pres_P_R.htm): "we have much work to do to ensure that our justice system fully lives up to its name."

## 12. democratic-norms
keep: yes
question: Should former presidents be immune from criminal prosecution?
pole -1: Former presidents should have immunity from prosecution
pole +1: No one is above the law regardless of office
score a: -0.70
score b: +0.98
models: sonnet a -0.80 b +0.95 · gpt-5 a -0.60 b +1.00 · confidence a 0.6 b 0.95
reason a: Argues presidential actions fall under special protections and should not face criminal prosecution.
reason b: Explicitly states no one including former presidents is above the law and opposes immunity.
quotes a:
- q167 (2023-06-13, CBS News FactCheck of 2024 Presidential primary hopefuls, https://www.ontheissues.org/2024_FactCheck.htm): "I fall within the Presidential Records Act. It's very simple. It's a civil thing. And this should never have been an indictment. There's no criminal."
quotes b:
- q44 (2024-09-09, 2024 Presidential campaign website KamalaHarris.com, https://www.ontheissues.org/2024/Kamala_Harris_Government_Reform.htm): "Vice President Harris believes that no one is above the law. She'll fight to ensure that no former president has immunity for crimes committed while in the White House."
