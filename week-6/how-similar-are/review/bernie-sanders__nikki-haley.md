# bernie-sanders & nikki-haley — review

approved: yes

a = bernie sanders, b = nikki haley. 11 quotes from a, 221 from b, 4 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js bernie-sanders nikki-haley`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. wealth-inequality
keep: no
question: should the federal government address wealth inequality between rich and poor?
pole -1: government must reduce extreme wealth inequality
pole +1: wealth inequality is not government's responsibility
score a: -0.92
score b: -0.40
models: sonnet a -0.95 b -0.40 · gpt-5 a -0.90 b -0.40 · confidence a 0.8 b 0.5
note: not clear enough -> confidence a 0.8, b 0.5 (needs 0.6)
reason a: Emphasizes extreme wealth inequality as a critical problem requiring federal action including raising minimum wage.
reason b: Acknowledges rich getting richer and poor getting poorer but proposes limited tax relief rather than systemic redistribution.
quotes a:
- q10 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "In terms of labor and our economy, we must recognize that we live in a period of more income and wealth inequality than at any time in the last hundred years. While the very rich become richer and three people now own more wealth than the bottom half of American society, 60% of American workers live paycheck to paycheck and millions are trying to exist on starvation wages. Meanwhile, we have a pa…"
quotes b:
- q81 (2023-11-08, NBC News 2023 Republican primary debate in Miami, https://www.ontheissues.org/2024/Nikki_Haley_Tax_Reform.htm): "I can tell you what we're seeing now in America is the rich are getting richer and the poor are getting poorer. We have to go and start beefing up the middle class and the first thing I would do is I'll eliminate the federal gas and diesel tax in this country."

## 2. democracy-threat
keep: no
question: is democracy itself under serious threat in america?
pole -1: democracy faces existential threat requiring action
pole +1: democracy concerns are overstated
score a: -0.92
score b: +0.10
models: sonnet a -0.95 b +0.00 · gpt-5 a -0.90 b +0.20 · confidence a 0.9 b 0.25
note: not clear enough -> confidence a 0.9, b 0.25 (needs 0.6)
reason a: Describes Trump as threatening American democracy through insurrection and denial, calling it unprecedented moment requiring progressive unity.
reason b: Quote questions whether Biden or Trump can unite country but doesn't directly address whether democracy faces existential threat.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
- q5 (2023-09-03, Face the Nation (3 September 2023), https://en.wikiquote.org/wiki/Bernie_Sanders): "We are living in an unprecedented moment in American history. Donald Trump is not only a pathological liar, has not only helped wage an insurrection … to prevent President Biden from taking office. Not only is denying American democracy — moving against the American democracy. So I think at this moment … we have got to bring the progressive community together to say, you know what, we're gonna fi…"
quotes b:
- q51 (2024, Remarks Following the South Carolina Primary Election in Charleston: …, https://www.presidency.ucsb.edu/documents/remarks-following-the-south-carolina-primary-election-charleston-the-fight-goes): "Does anyone seriously think Joe Biden or Donald Trump will unite our country to solve our problems?"

## 3. israel-hamas
keep: yes
question: should israel focus on eliminating hamas militarily?
pole -1: eliminate hamas as primary goal
pole +1: prioritize protecting palestinian civilians over hamas elimination
score a: +0.35
score b: -0.95
models: sonnet a +0.30 b -0.90 · gpt-5 a +0.40 b -1.00 · confidence a 0.6 b 0.95
reason a: Affirms Israel's right to defend itself but emphasizes protection of civilians and expresses concerns about ground invasion risks.
reason b: Explicitly supports giving Israel everything needed to destroy Hamas completely as primary goal.
quotes a:
- q4 (2023-11-01, in a press release posted on his web site at NEWS: Sanders, Warren, W…, https://www.sanders.senate.gov/press-releases/news-sanders-warren-welch-merkley-send-urgent-letter-to-president-biden-amid-israels-invasion-and-potential-occupation-of-gaza/): "Israel suffered a barbaric attack and is well within its rights to defend itself in keeping with international law, including the protection of civilians. As a response, Israel is contemplating a large-scale ground invasion targeting Hamas. Reports indicate Israeli ground forces are already active in Gaza. We note recent reports that senior U.S. officials – including Secretary of Defense Austin –…"
quotes b:
- q79 (2023-11-08, NBC News 2023 Republican primary debate in Miami, https://www.ontheissues.org/2024/Nikki_Haley_Foreign_Policy.htm): "The only thing we should be doing is supporting them in eliminating Hamas. It is not that Israel needs America, America needs Israel."
- q139 (2023, Remarks to the Republican Jewish Coalition Annual Leadership Summit i…, https://www.presidency.ucsb.edu/documents/remarks-the-republican-jewish-coalition-annual-leadership-summit-las-vegas-nevada-1): "That means fighting anti-Semitism in Congress and college campuses. And it means giving Israel everything she needs to destroy Hamas – once and for all!"

## 4. climate-action
keep: yes
question: should the us lead aggressive climate change action?
pole -1: us must lead on climate change
pole +1: focus on other nations first
score a: -0.85
score b: +0.55
models: sonnet a -0.90 b +0.60 · gpt-5 a -0.80 b +0.50 · confidence a 0.7 b 0.7
reason a: Calls climate change an existential threat that cannot be turned back on, indicating urgent US action needed.
reason b: Acknowledges climate change is real but prioritizes getting China and India to lower emissions before US action.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
quotes b:
- q96 (2023-08-23, Fox News 2023 Republican primary debate in Milwaukee, https://www.ontheissues.org/2023_GOP_Milwaukee.htm): "Is climate change real? Yes, it is. But if you want to really change the environment, then we need to start telling China and India that they have to lower their emissions."
- q98 (2023-07-30, CBS Face the Nation on 2023 Presidential primary hopefuls, https://www.ontheissues.org/2024/Nikki_Haley_Energy_+_Oil.htm): "What we don't want to do is go hat in hand to Saudi Arabia or get dirty oil from Iran or Venezuela. What we do want to do is look at what does transitioning look like."
