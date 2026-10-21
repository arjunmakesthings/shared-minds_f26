# jd-vance & nikki-haley — review

approved: yes

a = jd vance, b = nikki haley. 181 quotes from a, 221 from b, 11 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js jd-vance nikki-haley`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. ukraine-support
keep: no
question: should the united states provide military aid to ukraine against russia?
pole -1: provide aid to help ukraine defend itself
pole +1: end aid and let europe handle it
score a: +0.40
score b: -0.85
models: sonnet a +0.60 b -0.80 · gpt-5 a +0.20 b -0.90 · confidence a 0.4 b 0.9
note: not clear enough -> confidence a 0.4, b 0.9 (needs 0.6)
reason a: Views continuation of conflict as bad and seeks peace, suggesting preference for ending rather than continuing aid.
reason b: Strongly advocates supporting Ukraine as preventing war and standing up for democracies, characterizing it as small portion of defense budget.
quotes a:
- q26 (2025, Remarks by the Vice President at the Munich Leaders Meeting in Washin…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-munich-leaders-meeting-washington-dc): "our strong view is that the continuation of this conflict is bad for us, it's bad for Europe, it's bad for Russia, and it's bad for Ukraine."
- q38 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "we seek peace, and we believe the best path to peace is through mutual strength."
quotes b:
- q1 (2025-04-23, "Nikki Haley on Russia and Ukraine says US should 'want to be on the …, https://www.foxnews.com/politics/nikki-haley-russia-ukraine-says-us-should-want-right-side-history): "Rewarding an aggressor will only lead to more aggressive actions. Failing to stand up for democracies who are invaded will lead to more invasions of free countries. To reward Russia for bad behavior and punish Ukraine for fighting to defend itself would be a terrible injustice, America should know the difference between right and wrong and want to be on the right side of history,"
- q27 (2024-01-10, CNN 2024 pre-Iowa caucus one-on-one debate, https://www.ontheissues.org/2024_GOP_Iowa.htm): "This is about preventing war. It's always been about preventing war. If we support Ukraine, that's only 3.5% of our defense budget."

## 2. china-threat
keep: yes
question: is china the primary strategic competitor for the united states?
pole -1: china is the top priority threat
pole +1: multiple threats require balanced focus
score a: -0.75
score b: -0.95
models: sonnet a -0.70 b -0.90 · gpt-5 a -0.80 b -1.00 · confidence a 0.8 b 0.95
reason a: Identifies China as most powerful competitor US has had and calls for pivoting to Asia with Europeans handling Europe.
reason b: Calls China an existential threat, enemy, and most dangerous foreign threat since WWII in explicit terms.
quotes a:
- q43 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "I believe that if our nations fail to keep pace, the consequences for the Indo-Pacific, but really the consequences for the entire world, will be quite dire."
- q169 (2024-05-15, Cincinnati Enquirer on 2024 Veepstakes, https://www.ontheissues.org/Media_OH_Cincy.htm): "We have to pivot to Asia. China is the most powerful competitor the U.S. has had since we became a world power. We need to focus on Asia; we need to let the Europeans focus on Europe."
quotes b:
- q155 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "China is an existential threat. It has spent half a century plotting to defeat us."
- q210 (2023, Remarks on Foreign Policy at the American Enterprise Institute in Was…, https://www.presidency.ucsb.edu/documents/remarks-foreign-policy-the-american-enterprise-institute-washington-dc): "Communist China is the greatest threat to American security and prosperity, by far."
- q212 (2023, Remarks on Foreign Policy at the American Enterprise Institute in Was…, https://www.presidency.ucsb.edu/documents/remarks-foreign-policy-the-american-enterprise-institute-washington-dc): "Communist China is an enemy. It is the most dangerous foreign threat we've faced since the Second World War."

## 3. trade-fairness
keep: no
question: should the us pursue more reciprocal trade agreements?
pole -1: demand reciprocal and fair trade terms
pole +1: maintain current trade arrangements
score a: -0.85
score b: -0.10
models: sonnet a -0.80 b +0.00 · gpt-5 a -0.90 b -0.20 · confidence a 0.9 b 0.3
note: not clear enough -> confidence a 0.9, b 0.3 (needs 0.6)
reason a: Explicitly calls for rebalancing trade for American workers and manufacturers using fairness and reciprocity.
reason b: Only mentions selling to various countries including China but doesn't address reciprocity or fairness of trade terms.
quotes a:
- q28 (2025, Remarks by the Vice President at the Munich Leaders Meeting in Washin…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-munich-leaders-meeting-washington-dc): "we want to rebalance trade in the interests of American workers, in the interests of American manufacturers."
- q30 (2025, Remarks by the Vice President at the Munich Leaders Meeting in Washin…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-munich-leaders-meeting-washington-dc): "We just want a little bit more fairness or, to use the president's favorite word, "reciprocity.""
- q33 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "Our administration seeks trade partners on the basis of fairness and of shared national interests."
quotes b:
- q107 (2023-06-04, CNN Town Hall: interviews of 2024 presidential candidates, https://www.ontheissues.org/2024/Nikki_Haley_Free_Trade.htm): "I don't want our farmers to just sell to China. I will be their ambassador. In South Carolina, when I was governor, I sold South Carolina to everyone."

## 4. domestic-energy
keep: yes
question: should the us prioritize domestic energy production and independence?
pole -1: maximize domestic oil and gas production
pole +1: transition away from fossil fuels
score a: -0.60
score b: -0.72
models: sonnet a -0.70 b -0.75 · gpt-5 a -0.50 b -0.70 · confidence a 0.6 b 0.8
reason a: Emphasizes preventing energy crisis and importance of cheap dependable energy for economic independence.
reason b: Advocates drilling oil and gas extensively for energy independence and dominance while avoiding foreign sources.
quotes a:
- q1 (2026-09-03, "JD Vance Says You Should Be Grateful Gas Prices Aren’t Even Higher" …, https://newrepublic.com/post/215113/jd-vance-grateful-gas-prices-not-higher): "We’re going to do what we have to do in order to ensure that their efforts don’t lead to a worldwide energy crisis. We’ve been quite successful up to this point. Gas, frankly, could’ve been much, much higher were it not for our efforts."
- q40 (2025, Remarks by the Vice President on the U.S. and India's Shared Economic…, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-us-and-indias-shared-economic-priorities-jaipur-india): "This administration recognizes that cheap, dependable energy en- -- is an essential part of making things and is an essential part of economic independence for both of our nations."
quotes b:
- q98 (2023-07-30, CBS Face the Nation on 2023 Presidential primary hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Energy_+_Oil.htm): "What we don't want to do is go hat in hand to Saudi Arabia or get dirty oil from Iran or Venezuela. What we do want to do is look at what does transitioning look like."
- q197 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "We'll drill so much oil and gas, families will save big on their utility bills. Energy independence is just the start. We'll be energy dominant."

## 5. green-subsidies
keep: yes
question: should the federal government fund green energy subsidies?
pole -1: eliminate green energy subsidies
pole +1: support green energy investments
score a: -0.65
score b: -0.85
models: sonnet a -0.70 b -0.80 · gpt-5 a -0.60 b -0.90 · confidence a 0.7 b 0.85
reason a: Criticizes spending taxpayer money on solar panels made in China as making economy dirtier.
reason b: Explicitly calls for eliminating Biden's green energy subsidies, characterizing them as cash windfalls for China.
quotes a:
- q115 (2024-10-01, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "if you're spending billions of dollars of American taxpayer money on solar panels that are made in China, you're going to make the economy dirtier."
quotes b:
- q168 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "We should also eliminate Joe Biden's $500 billion in green energy subsidies. No more cash windfalls for China."

## 6. immigration-enforcement
keep: yes
question: should the us enforce stricter immigration policies?
pole -1: enforce strict immigration controls
pole +1: maintain current immigration levels
score a: -0.87
score b: -0.87
models: sonnet a -0.90 b -0.85 · gpt-5 a -0.85 b -0.90 · confidence a 0.78 b 0.75
reason a: Strongly advocates for strict enforcement focusing on deporting illegal aliens and blames them for overwhelming public services.
reason b: Supports defunding sanctuary cities and remain in Mexico policy, indicating strict enforcement preferences.
quotes a:
- q111 (2024-10-02, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "We've got 20, 25 million illegal aliens who are here in the country. I think the first thing that we do is we start with the criminal migrants."
- q117 (2024-10-01, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "In Springfield and all across this country, you've got schools and hospitals that are overwhelmed,; you've got housing that is totally unaffordable because we brought in millions of illegal immigrants to compete with Americans for scarce homes."
quotes b:
- q118 (2023-05-14, CBS Face the Nation on 2023 Presidential hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Immigration.htm): "I would defund sanctuary cities. I would go back to remain in Mexico because no one wants to remain in Mexico."

## 7. abortion-policy
keep: no
question: what should be the us policy on abortion?
pole -1: restrict abortion with some exceptions
pole +1: allow unrestricted abortion access
score a: -0.20
score b: -0.65
models: sonnet a -0.30 b -0.60 · gpt-5 a -0.10 b -0.70 · confidence a 0.45 b 0.75
note: not clear enough -> confidence a 0.45, b 0.75 (needs 0.6)
reason a: Attempts to balance autonomy with life, suggesting moderate restrictions rather than extreme position.
reason b: Identifies as unapologetically pro-life and advocates for banning late-term abortions, indicating restrictive stance.
quotes a:
- q89 (2024-11-01, Joe Rogan interview: 2024 Vice Presidential Veepstakes, https://www.ontheissues.org/2024/JD_Vance_Abortion.htm): "I think autonomy is really important, I also think life is really important. And what we're trying to talk about fundamentally, I think again, I'm trying to be fair to both sides here, is to balance the interest in life against the interest in autonomy."
quotes b:
- q88 (2023-08-23, wikiquote: Republican Presidential Debate in Milwaukee, Wisconsin (23…, https://en.wikiquote.org/wiki/Nikki_Haley): "Bret, I think we're all pro-life. But what I would love is for someone to ask Biden and Kamala Harris, are they for 38 weeks or are they for 39 weeks, are they for 40 weeks? Because that's what the media needs to be asking."
- q92 (2023-08-23, Fox News 2023 Republican primary debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "I am unapologetically pro-life. Having said that, we need to stop demonizing this issue."
- q94 (2023-08-23, Fox News 2023 Republican primary debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "Can't we all agree that we should ban late term abortions? Can't we all agree that we should encourage adoptions? Can't we all agree that doctors and nurses who don't believe in abortion shouldn't have to perform them?"

## 8. foreign-aid
keep: no
question: should the us reduce its global military commitments?
pole -1: reduce global military commitments
pole +1: maintain strong global military presence
score a: -0.75
score b: +0.55
models: sonnet a -0.80 b +0.70 · gpt-5 a -0.70 b +0.40 · confidence a 0.8 b 0.55
note: not clear enough -> confidence a 0.8, b 0.55 (needs 0.6)
reason a: Explicitly opposes America being the policeman of the world and wants to empower regional self-policing.
reason b: Advocates for America actively siding with good over evil globally, suggesting maintaining strong international engagement.
quotes a:
- q99 (2024-10-29, "Vance: US and Israeli interests won’t always overlap; we don’t want …, https://www.timesofisrael.com/vance-us-and-israeli-interests-wont-always-overlap-we-dont-want-war-with-iran/): "America doesn’t have to constantly police every region of the world. We should empower people to police their own regions of the world. One: We would save a lot of money. Two: We’d save a lot of focus."
- q171 (2024-05-15, Cincinnati Enquirer on 2024 Veepstakes, https://www.ontheissues.org/Media_OH_Cincy.htm): "Until that foundation is repaired, I don't want to hear about us being the policeman of the world."
quotes b:
- q141 (2023, Remarks to the Republican Jewish Coalition Annual Leadership Summit i…, https://www.presidency.ucsb.edu/documents/remarks-the-republican-jewish-coalition-annual-leadership-summit-las-vegas-nevada-1): "America can never be neutral between good and evil. We must pick a side. And we serve our own national interests best when we side with good."

## 9. middle-class-focus
keep: no
question: should policy prioritize helping the middle class?
pole -1: focus on middle-class economic relief
pole +1: general economic growth for all
score a: -0.55
score b: -0.77
models: sonnet a -0.70 b -0.75 · gpt-5 a -0.40 b -0.80 · confidence a 0.55 b 0.85
note: not clear enough -> confidence a 0.55, b 0.85 (needs 0.6)
reason a: Emphasizes financial insecurity and loss of identity for middle-class workers, indicating focus on their specific challenges.
reason b: Explicitly states need to beef up the middle class and proposes targeted tax relief for middle-class families.
quotes a:
- q54 (2025, Remarks by the Vice President at the American Dynamism Summit, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-american-dynamism-summit): "American workers are faced not only with financial insecurity, they're also faced with a profound loss of personal and communal identity."
- q56 (2025, Remarks by the Vice President at the American Dynamism Summit, https://www.presidency.ucsb.edu/documents/remarks-the-vice-president-the-american-dynamism-summit): "America could no longer support middle-class families working on middle-class wages"
quotes b:
- q81 (2023-11-08, NBC News 2023 Republican primary debate in Miami, https://www.ontheissues.org/2024/Nikki_Haley_Tax_Reform.htm): "I can tell you what we're seeing now in America is the rich are getting richer and the poor are getting poorer. We have to go and start beefing up the middle class and the first thing I would do is I'll eliminate the federal gas and diesel tax in this country."
- q164 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "My plan starts by giving real relief and financial freedom to middle class Americans. Every middle-class family will get thousands of dollars in tax relief."

## 10. regulatory-burden
keep: yes
question: should the us reduce federal regulations on business?
pole -1: reduce federal regulatory burden
pole +1: maintain regulatory protections
score a: -0.75
score b: -0.87
models: sonnet a -0.80 b -0.90 · gpt-5 a -0.70 b -0.85 · confidence a 0.7 b 0.85
reason a: Criticizes federal administration for making it harder to build and develop through excessive regulation.
reason b: Strongly criticizes regulatory costs and proposes forcing congressional votes on all regulations to reduce them.
quotes a:
- q109 (2024-10-02, 2024 Vice Presidential debate: Tim Walz vs. JD Vance, https://www.ontheissues.org/2024_Veep_Debate.htm): "Look, we are a country of builders. We're a country of doers. We're a country of explorers. But we increasingly have a Federal administration that makes it harder to develop our resources, makes it harder to build things, and wants to throw people in jail for not doing everything exactly as Kamala Harris says that they have to do."
quotes b:
- q191 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "Biden's regulatory avalanche has already cost families and job creators more than $400 billion in higher prices, with billions more on the way."
- q193 (2023, Remarks at St. Anselm College in Manchester, New Hampshire, https://www.presidency.ucsb.edu/documents/remarks-st-anselm-college-manchester-new-hampshire): "I'll force Congress to vote on every rule and regulation, period. When politicians have to vote on every price-hiking, job-destroying, family-crushing mandate, you can bet we'll see a lot fewer rules coming down."

## 11. gender-ideology
keep: yes
question: should schools teach gender ideology to students?
pole -1: prevent schools from teaching gender topics
pole +1: allow gender curriculum in schools
score a: -0.82
score b: -0.95
models: sonnet a -0.85 b -0.90 · gpt-5 a -0.80 b -1.00 · confidence a 0.7 b 0.85
reason a: Strongly opposes what he characterizes as sexualization in schools and supports bills preventing gender-related content.
reason b: Explicitly states schools should not talk to kids about gender at all, reserving this entirely for parents.
quotes a:
- q158 (2024-07-16, NBC News on 2024 Veepstakes, https://www.ontheissues.org/2024_Hopefuls.htm): "I'll stop calling people 'groomers' when they stop freaking out about bills that prevent the sexualization of my children"
quotes b:
- q103 (2023-06-04, CNN Town Hall: interviews of 2024 presidential candidates, https://www.ontheissues.org/2024_CNN_Town_Halls.htm): "I don't think that went far enough. They should not be talking to our kids about gender, period. That's what parents talk to their kids about, not in school."
