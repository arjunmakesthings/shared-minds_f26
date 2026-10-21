# jd-vance & joe-biden — review

approved: yes

a = jd vance, b = joe biden. 181 quotes from a, 169 from b, 11 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js jd-vance joe-biden`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. energy-independence
keep: yes
question: should the us prioritize cheap energy over climate concerns?
pole -1: cheap energy is essential for economic independence
pole +1: climate action must not be sacrificed for cheaper energy
score a: -0.77
score b: +0.85
models: sonnet a -0.85 b +0.90 · gpt-5 a -0.70 b +0.80 · confidence a 0.75 b 0.9
reason a: He emphasizes cheap dependable energy as essential for economic independence and making things.
reason b: He explicitly rejects choosing cheap energy over environmental protection and insists climate action must not be sacrificed.
quotes a:
- q1 (2026-09-03, "JD Vance Says You Should Be Grateful Gas Prices Aren’t Even Higher" …, https://newrepublic.com/post/215113/jd-vance-grateful-gas-prices-not-higher): "We’re going to do what we have to do in order to ensure that their efforts don’t lead to a worldwide energy crisis. We’ve been quite successful up to this point. Gas, frankly, could’ve been much, much higher were it not for our efforts."
- q40 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "This administration recognizes that cheap, dependable energy en- -- is an essential part of making things and is an essential part of economic independence for both of our nations."
quotes b:
- q2 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "You know, we've proven we don't have to choose between protecting the environment and growing the economy. We're doing both. But powerful forces want to wield their unchecked influence to eliminate the steps we've taken to tackle the climate crisis to serve their own interest for power and profit. We must not be bullied into sacrificing the future, the future of our children and our grandchildren…"
- q67 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm taking the most significant action ever on climate in the history of the world."

## 2. trade-fairness
keep: no
question: should us trade policy prioritize reciprocal fairness with partners?
pole -1: trade should be rebalanced for American worker interests
pole +1: trade should follow established rules and patterns
score a: -0.85
score b: +0.10
models: sonnet a -0.80 b +0.00 · gpt-5 a -0.90 b +0.20 · confidence a 0.85 b 0.3
note: not clear enough -> confidence a 0.85, b 0.3 (needs 0.6)
reason a: He explicitly wants to rebalance trade for American workers and manufacturers with reciprocity and fairness.
reason b: His quote about investing in America is vaguely related but doesn't clearly address trade policy or reciprocity versus established rules.
quotes a:
- q28 (2025, Remarks by the Vice President at the Munich Leaders Meeting in Washin…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-munich-leaders-meeting-washington-dc): "we want to rebalance trade in the interests of American workers, in the interests of American manufacturers."
- q30 (2025, Remarks by the Vice President at the Munich Leaders Meeting in Washin…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-munich-leaders-meeting-washington-dc): "We just want a little bit more fairness or, to use the president's favorite word, "reciprocity.""
- q33 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "Our administration seeks trade partners on the basis of fairness and of shared national interests."
quotes b:
- q116 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "I came into office with a different vision for America that's been consistent with my record—good, bad, or indifferent—since I've been a Senator: grow the economy from the middle out and the bottom up; invest in America and American products."

## 3. inflation-responsibility
keep: no
question: should current leadership take credit for inflation reduction?
pole -1: current leadership successfully reduced inflation
pole +1: current leadership caused and mismanaged inflation
score a: +0.00
score b: +0.00
models: sonnet a +0.00 b +0.00 · gpt-5 a +0.00 b +0.00 · confidence a 0.1 b 0.15
note: not clear enough -> confidence a 0.1, b 0.15 (needs 0.6)
reason a: The quote about foreign policy has no clear connection to inflation or leadership credit.
reason b: The quote discusses investment plans but doesn't directly address inflation or taking credit for reducing it.
quotes a:
- q101 (2024-10-27, CBS Face the Nation interview: 2024 Veepstakes, https://www.ontheissues.org/2024_CBS.htm): "I think we should set American foreign policy based on what's in our best interest."
quotes b:
- q113 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "The next President has a game plan I laid out. And by the way, he's going to find, since I made a promise I'd invest as much in red States as blue, he's going to have a trouble not doing it."

## 4. middle-east-ceasefire
keep: no
question: can sustained diplomacy achieve lasting mideast peace?
pole -1: diplomatic pressure achieves ceasefires and peace
pole +1: military strength is needed to stop conflicts
score a: +0.00
score b: +0.48
models: sonnet a +0.00 b +0.35 · gpt-5 a +0.00 b +0.60 · confidence a 0.15 b 0.55
note: not clear enough -> confidence a 0.15, b 0.55 (needs 0.6)
reason a: The quote about energy crisis and gas prices doesn't clearly address diplomatic versus military approaches to Middle East peace.
reason b: He emphasizes standing with Israel and supporting their military response while mentioning rule of law, showing a mixed approach favoring strength over pure diplomacy.
quotes a:
- q1 (2026-09-03, "JD Vance Says You Should Be Grateful Gas Prices Aren’t Even Higher" …, https://newrepublic.com/post/215113/jd-vance-grateful-gas-prices-not-higher): "We’re going to do what we have to do in order to ensure that their efforts don’t lead to a worldwide energy crisis. We’ve been quite successful up to this point. Gas, frankly, could’ve been much, much higher were it not for our efforts."
quotes b:
- q163 (2023, wikiquote: October 2023, https://en.wikiquote.org/wiki/Joe_Biden): "So, in this moment, we must be crystal clear: We stand with Israel. We stand with Israel. And we will make sure Israel has what it needs to take care of its citizens, defend itself, and respond to this attack. There is no justification for terrorism. There is no excuse. Hamas does not stand for the Palestinian people’s right to dignity and self-determination. Its stated purpose is the annihilatio…"
- q164 (2023, wikiquote: October 2023, https://en.wikiquote.org/wiki/Joe_Biden): "I just got off the phone with — the third call with Prime Minister Netanyahu. And I told him if the United States experienced what Israel is experiencing, our response would be swift, decisive, and overwhelming. We also discussed how democracies like Israel and the United States are stronger and more secure when we act according to the rule of law. Terrorists … purposefully target civilians, kill…"

## 5. border-control
keep: yes
question: should the us limit immigration to protect workers?
pole -1: immigration harms american workers and communities
pole +1: border closures are not serious policy solutions
score a: -0.75
score b: +0.63
models: sonnet a -0.80 b +0.65 · gpt-5 a -0.70 b +0.60 · confidence a 0.8 b 0.7
reason a: He describes illegal immigration as harming communities through overwhelmed services and competing with Americans for housing.
reason b: He dismisses border walls as not serious policy, suggesting opposition to restrictive immigration controls.
quotes a:
- q111 (2024-10-02, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "We've got 20, 25 million illegal aliens who are here in the country. I think the first thing that we do is we start with the criminal migrants."
- q117 (2024-10-01, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "In Springfield and all across this country, you've got schools and hospitals that are overwhelmed,; you've got housing that is totally unaffordable because we brought in millions of illegal immigrants to compete with Americans for scarce homes."
quotes b:
- q129 (2023-10-06, CNBC and Reuters analysis of Biden Promises, https://www.ontheissues.org/Biden_Promises.htm): "building a massive wall that spans the entire southern border is not a serious policy solution."

## 6. israel-support
keep: no
question: should us unconditionally support israel militarily?
pole -1: us must ensure israel has military capability
pole +1: military support should follow diplomatic negotiations
score a: +0.00
score b: +0.45
models: sonnet a +0.00 b +0.50 · gpt-5 a +0.00 b +0.40 · confidence a 0 b 0.7
note: not clear enough -> confidence a 0, b 0.7 (needs 0.6)
reason a: Quote discusses Europe's deindustrialization and energy policy, not Israel support.
reason b: He balances firm Israel support with pursuing diplomacy to avoid wider war.
quotes a:
- q166 (2024-05-19, CBS Face the Nation on 2024 Republican Veepstakes, https://www.ontheissues.org/2024_CBS.htm): "The reason Europe has become weaker is because they've deindustrialized. And why have they deindustrialized? Because they've pursued a green energy agenda, following the lead of the Biden administration, and that necessarily empowers China and Russia."
quotes b:
- q6 (2025, Remarks on Implementation of the Cease-Fire and Hostage-Release Deal …, https://www.presidency.ucsb.edu/documents/remarks-implementation-the-cease-fire-and-hostage-release-deal-between-israel-and-hamas): "Some said my policy of a firm support for Israel is relentlessly pursuing diplomacy risked drawing America into a wider war in the region. I listened to those voices, many of whom I respected a great deal. But I concluded abandoning the course I was on would not have led us to the cease-fire we're seeing today, but instead, it would have risked the wider war in the region that so many feared."

## 7. china-competition
keep: no
question: is china america's primary strategic competitor?
pole -1: china is the most important strategic focus
pole +1: multiple regions require balanced strategic attention
score a: -0.85
score b: +0.25
models: sonnet a -0.80 b +0.20 · gpt-5 a -0.90 b +0.30 · confidence a 0.9 b 0.5
note: not clear enough -> confidence a 0.9, b 0.5 (needs 0.6)
reason a: He calls China the most powerful competitor and says the US must pivot to Asia focus.
reason b: He discusses regional changes and multiple economic priorities but doesn't clearly prioritize China versus balanced attention.
quotes a:
- q43 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "I believe that if our nations fail to keep pace, the consequences for the Indo-Pacific, but really the consequences for the entire world, will be quite dire."
- q169 (2024-05-15, Cincinnati Enquirer on 2024 Veepstakes, https://www.ontheissues.org/Media_OH_Cincy.htm): "We have to pivot to Asia. China is the most powerful competitor the U.S. has had since we became a world power. We need to focus on Asia; we need to let the Europeans focus on Europe."
quotes b:
- q125 (2023-11-16, Remarks at the APEC CEO Summit, San Francisco, California (16 Novembe…, https://www.whitehouse.gov/briefing-room/speeches-remarks/2023/11/16/remarks-by-president-biden-at-the-apec-ceo-summit-san-francisco-ca/): "We're going to see more changes in the next 10 years than we've seen in the last 50 years. That brings me back to the summit and where we go from here. The world is fundamentally different than it was 30 years ago at the first annual APEC Leaders' Meeting at Blake Island in Washington State. --> … The questions we must answer today are not about how much we trade, but about how we build resilienc…"

## 8. democracy-threat
keep: yes
question: is censorship the primary threat to democracy?
pole -1: censorship threatens american democracy most
pole +1: political violence threatens democracy most
score a: -0.90
score b: +0.85
models: sonnet a -0.90 b +0.80 · gpt-5 a -0.90 b +0.90 · confidence a 0.9 b 0.8
reason a: He explicitly states censorship is the threat to democracy in this country.
reason b: He explicitly calls political violence the primary threat with absolutely no place in America.
quotes a:
- q119 (2024-10-01, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "We're focused on the future. I believe that we actually do have a threat to democracy in this country, but it is the threat of censorship."
quotes b:
- q78 (2024-03-07, 2024 State of the Union address on Jan. 6th Capitol Riots, https://www.ontheissues.org/January_6th.htm): "I ask all of you without regard to party, to join together and defend democracy. Respect free and fair elections. Restore trust in our institutions and make clear, political violence has absolutely no place in America."

## 9. infrastructure-investment
keep: no
question: should government invest in infrastructure development?
pole -1: government must invest in infrastructure
pole +1: previous administrations failed on infrastructure
score a: +0.10
score b: +0.10
models: sonnet a +0.00 b -0.60 · gpt-5 a +0.20 b +0.80 · confidence a 0.2 b 0.5
FLAG: models disagree on B by 1.4
note: not clear enough -> confidence a 0.2, b 0.5 (needs 0.6)
reason a: Quote mentions building a future with India through rebalancing trade, only tangentially related to infrastructure.
reason b: He criticizes previous administration's failure to build infrastructure, implying support for actual investment.
quotes a:
- q35 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "He seeks to rebalance global trade so that America, with friends like India, can build a future worth having for all of our people together."
quotes b:
- q111 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "Remember "Infrastructure Week"? We had Infrastructure Week for 4 years. Nothing got built."

## 10. corporate-regulation
keep: yes
question: should corporations face more government restrictions?
pole -1: corporations need more regulation and oversight
pole +1: corporations should operate with less government intervention
score a: -0.55
score b: +0.55
models: sonnet a -0.60 b +0.50 · gpt-5 a -0.50 b +0.60 · confidence a 0.7 b 0.6
reason a: He argues private companies like tech platforms deserve scrutiny and regulation for their power.
reason b: He explicitly states he is not anticorporation and has represented corporate interests.
quotes a:
- q123 (2024-09-24, Project 2025 comments by 2024 Vice Presidential Veepstakes, https://www.ontheissues.org/2024_Veepstakes.htm): "A private company that can censor speech, influence elections, and work seamlessly with intelligence services and other federal bureaucrats deserves the scrutiny of the Right, not its support."
- q144 (2024-08-02, 2024 Trump Research Book, https://www.ontheissues.org/2024/JD_Vance_Health_Care.htm): "The Democratic Party increasingly represents professional class elites. And Republicans represent middle- and working-class wage earners."
quotes b:
- q103 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "I'm not anticorporation. For 36 years, I represented corporate America. I—my State has more corporations in—registered in my State than every other State in the Union."

## 11. ai-governance
keep: no
question: should ai development be regulated before public release?
pole -1: ai must be governed by humans before use
pole +1: innovation requires minimal regulatory barriers
score a: +0.00
score b: +0.00
models: sonnet a +0.00 b +0.00 · gpt-5 a +0.00 b +0.00 · confidence a 0 b 0
note: not clear enough -> confidence a 0, b 0 (needs 0.6)
reason a: No quotes provided relate to AI development or regulation.
reason b: No quotes provided relate to AI development or regulation.
quotes a:
- q135 (2024-08-18, Claimed when commenting polls presented by Fox News, quoted in "JD Va…, https://www.salon.com/2024/08/18/jd-vance-thinks-polls-showing-surge-of-harris-support-are-fake/): "Consistently what you’ve seen in 2016 and 2020, is that the media uses fake polls to drive down Republican turnout and to create dissension and conflict within Republican voters."
quotes b:
- q52 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "You had a four-star general stand at your side, who was on your staff, who said you said it, period [referring to Trump chief of staff John Kelly]."
