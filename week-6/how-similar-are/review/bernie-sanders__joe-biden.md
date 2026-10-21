# bernie-sanders & joe-biden — review

approved: yes

a = bernie sanders, b = joe biden. 11 quotes from a, 169 from b, 9 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js bernie-sanders joe-biden`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. democracy-threat
keep: yes
question: Is democracy currently facing an existential threat?
pole -1: Democracy faces serious, immediate threat
pole +1: Democracy is resilient and prevailing
score a: -0.90
score b: -0.60
models: sonnet a -0.90 b -0.60 · gpt-5 a -0.90 b -0.60 · confidence a 0.9 b 0.7
reason a: Sanders repeatedly describes democracy as under serious threat from Trump's authoritarianism and denialism.
reason b: Biden frames democracy as both prevailing and needing to be saved again, suggesting ongoing serious threat.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
- q5 (2023-09-03, Face the Nation (3 September 2023), https://en.wikiquote.org/wiki/Bernie_Sanders): "We are living in an unprecedented moment in American history. Donald Trump is not only a pathological liar, has not only helped wage an insurrection … to prevent President Biden from taking office. Not only is denying American democracy — moving against the American democracy. So I think at this moment … we have got to bring the progressive community together to say, you know what, we're gonna fi…"
- q6 (2023-08-27, Meet the Press (27 August 2023) · transcript, https://www.youtube.com/watch?v=u8nOcUYJ5Do): "I think in this particular time, this particular moment in American history, when we're taking on somebody — the former President, who in fact does not believe in democracy — he is an authoritarian, and a very, very dangerous person — I think at this moment there has to be a unification of progressive people in general all over this country — people who are prepared to make sure that women contro…"
quotes b:
- q33 (2024-08-19, wikiquote: Speech at the 2024 Democratic National Convention (19 Augu…, https://en.wikiquote.org/wiki/Joe_Biden): "Progress was and is possible. Justice is achievable, and our best days are not behind us, they’re before us. Now it’s summer. The winter has passed, and with a grateful heart I stand before you now on this August night to report that democracy has prevailed, democracy has delivered, and now democracy must be preserved. You’ve heard me say it before, we’re facing an inflection point, one of those …"
- q38 (2024-08-19, wikiquote: Speech at the 2024 Democratic National Convention (19 Augu…, https://en.wikiquote.org/wiki/Joe_Biden): "Folks, all of us carry a special obligation. Independents, Republicans, Democrats. We saved democracy in 2020, and now we must save it again in 2024. The vote that each of us cast this year will determine whether democracy and freedom will prevail. It’s that simple. It’s that serious. And the power is literally in your hands. History’s in your hands. Not hyperbole. It’s in your hands. America’s f…"

## 2. political-system-corruption
keep: no
question: Does money in politics corrupt the system?
pole -1: Money corrupts political system fundamentally
pole +1: Money is acceptable in politics
score a: -0.92
score b: +0.30
models: sonnet a -0.95 b +0.30 · gpt-5 a -0.90 b +0.30 · confidence a 0.85 b 0.4
note: not clear enough -> confidence a 0.85, b 0.4 (needs 0.6)
reason a: Sanders explicitly calls the political system corrupt and says money impacts everything Congress does.
reason b: Biden states he is not anticorporation and represented corporate America for decades, but quote doesn't directly address money corrupting politics.
quotes a:
- q2 (2024, Speech at the Center for International Policy, https://www.youtube.com/watch?v=G-X_9cLDaDY): "[A]nyone who wants to talk about foreign policy or, for that matter, anything that goes on in Congress, without recognizing the corrupt political system that we have and the impact that money has over what we do, really doesn't know very much about what's going on."
- q11 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "At a time when too many Americans are giving up on democracy, now is the time to attempt to restore faith in our government. Now is the time for Congress to have the courage to take on the lobbyists and powerful special interests and show the American people that our government can work for them, and not just the 1%. Let’s do it."
quotes b:
- q103 (2024, Remarks on the National Economy, https://www.presidency.ucsb.edu/documents/remarks-the-national-economy-38): "I'm not anticorporation. For 36 years, I represented corporate America. I—my State has more corporations in—registered in my State than every other State in the Union."

## 3. israel-defense-rights
keep: yes
question: Does Israel have the right to defend itself militarily?
pole -1: Israel has right to defend itself
pole +1: Israel should not use military force
score a: -0.70
score b: -0.87
models: sonnet a -0.70 b -0.85 · gpt-5 a -0.70 b -0.90 · confidence a 0.8 b 0.9
reason a: Sanders says Israel is well within its rights to defend itself in keeping with international law.
reason b: Biden firmly stands with Israel, supports its right to defend itself and respond decisively, comparing to how the US would respond.
quotes a:
- q4 (2023-11-01, in a press release posted on his web site at NEWS: Sanders, Warren, W…, https://www.sanders.senate.gov/press-releases/news-sanders-warren-welch-merkley-send-urgent-letter-to-president-biden-amid-israels-invasion-and-potential-occupation-of-gaza/): "Israel suffered a barbaric attack and is well within its rights to defend itself in keeping with international law, including the protection of civilians. As a response, Israel is contemplating a large-scale ground invasion targeting Hamas. Reports indicate Israeli ground forces are already active in Gaza. We note recent reports that senior U.S. officials – including Secretary of Defense Austin –…"
quotes b:
- q1 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "My fellow Americans, I am speaking to you tonight from the Oval Office. Before I begin, let me speak to important news from earlier today. After eight months of nonstop negotiation, my administration — by my administration, a ceasefire and a hostage deal has been reached by Israel and Hamas, the elements of which I laid out in great detail in May of this year. This plan was developed and negotiat…"
- q6 (2025, Remarks on Implementation of the Cease-Fire and Hostage-Release Deal …, https://www.presidency.ucsb.edu/documents/remarks-implementation-the-cease-fire-and-hostage-release-deal-between-israel-and-hamas): "Some said my policy of a firm support for Israel is relentlessly pursuing diplomacy risked drawing America into a wider war in the region. I listened to those voices, many of whom I respected a great deal. But I concluded abandoning the course I was on would not have led us to the cease-fire we're seeing today, but instead, it would have risked the wider war in the region that so many feared."
- q163 (2023, wikiquote: October 2023, https://en.wikiquote.org/wiki/Joe_Biden): "So, in this moment, we must be crystal clear: We stand with Israel. We stand with Israel. And we will make sure Israel has what it needs to take care of its citizens, defend itself, and respond to this attack. There is no justification for terrorism. There is no excuse. Hamas does not stand for the Palestinian people’s right to dignity and self-determination. Its stated purpose is the annihilatio…"

## 4. climate-action
keep: yes
question: Should government take major climate action?
pole -1: Climate action is existential priority
pole +1: Climate action harms the economy
score a: -0.92
score b: -0.90
models: sonnet a -0.95 b -0.90 · gpt-5 a -0.90 b -0.90 · confidence a 0.7 b 0.9
reason a: Sanders describes climate change as an existential threat that would be awful to turn our back on.
reason b: Biden calls climate crisis existential, claims historic climate action, and says there's no time to waste in pushing forward.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
quotes b:
- q2 (2025-01-15, wikiquote: Farewell Address to the Nation (15 January 2025), https://en.wikiquote.org/wiki/Joe_Biden): "You know, we've proven we don't have to choose between protecting the environment and growing the economy. We're doing both. But powerful forces want to wield their unchecked influence to eliminate the steps we've taken to tackle the climate crisis to serve their own interest for power and profit. We must not be bullied into sacrificing the future, the future of our children and our grandchildren…"
- q67 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm taking the most significant action ever on climate in the history of the world."
- q151 (2023-02-07, 2023 State of the Union speech as prepared for delivery, https://www.ontheissues.org/2024/Joe_Biden_Energy_+_Oil.htm): "The climate crisis doesn't care if your state is red or blue. It is an existential threat."

## 5. police-reform
keep: no
question: Should police departments be abolished or reformed?
pole -1: Reform police with better training
pole +1: Abolish all police departments
score a: -0.90
score b: -0.45
models: sonnet a -0.90 b -0.30 · gpt-5 a -0.90 b -0.60 · confidence a 0.95 b 0.3
note: not clear enough -> confidence a 0.95, b 0.3 (needs 0.6)
reason a: Sanders explicitly opposes abolishing police, favors redefining roles and improving training and pay for professionals.
reason b: Biden acknowledges most cops are good but problem happens too often, doesn't clearly indicate reform vs abolish position.
quotes a:
- q7 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "Do I think we should not have police departments in America? No, I don't. There's no city in the world that does not have police departments."
- q8 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "I think we want to redefine what police departments do, give them the support they need to make their jobs better defined. So I do believe that we need well-trained, well-educated, and well-paid professionals in police departments."
- q9 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "Anyone who thinks that we should abolish all police departments in America, I don't agree."
quotes b:
- q149 (2023-02-07, 2023 State of the Union speech, https://www.ontheissues.org/SOTU_2023.htm): "I know most cops are good. decent people. They risk their lives every time they put on that shield. But what happened to Tyre in Memphis happens too often."

## 6. wealth-inequality
keep: yes
question: Is income inequality a major problem?
pole -1: Inequality is urgent crisis
pole +1: Inequality is acceptable outcome
score a: -0.95
score b: -0.60
models: sonnet a -0.95 b -0.60 · gpt-5 a -0.95 b -0.60 · confidence a 0.95 b 0.65
reason a: Describes inequality as at historic highs and frames it as an urgent crisis requiring action.
reason b: Points to low billionaire tax rates as a problem requiring correction but frames it more moderately than as a crisis.
quotes a:
- q10 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "In terms of labor and our economy, we must recognize that we live in a period of more income and wealth inequality than at any time in the last hundred years. While the very rich become richer and three people now own more wealth than the bottom half of American society, 60% of American workers live paycheck to paycheck and millions are trying to exist on starvation wages. Meanwhile, we have a pa…"
quotes b:
- q57 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "We have a thousand billionaires in America. And what's happening? They're in a situation where they, in fact, pay 8.2% in taxes. If they just paid 24% or 25%, either one of those numbers, they'd raise $500 billion dollars in a 10-year period."
- q80 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm a capitalist. If you want to make a million of bucks, that's great; just pay your fair share in taxes."

## 7. billionaire-taxes
keep: no
question: Should billionaires pay higher tax rates?
pole -1: Billionaires should pay more taxes
pole +1: Billionaires should pay fewer taxes
score a: -0.72
score b: -0.85
models: sonnet a -0.85 b -0.75 · gpt-5 a -0.60 b -0.95 · confidence a 0.55 b 0.9
note: not clear enough -> confidence a 0.55, b 0.9 (needs 0.6)
reason a: Criticizes wealth concentration at the top and implies need for redistribution, though doesn't explicitly state tax policy.
reason b: Explicitly states billionaires should pay higher tax rates, proposing specific increases from 8.2% to 24-25%.
quotes a:
- q10 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "In terms of labor and our economy, we must recognize that we live in a period of more income and wealth inequality than at any time in the last hundred years. While the very rich become richer and three people now own more wealth than the bottom half of American society, 60% of American workers live paycheck to paycheck and millions are trying to exist on starvation wages. Meanwhile, we have a pa…"
quotes b:
- q57 (2024-06-27, First Trump-Biden debate, at CNN in Atlanta, https://www.ontheissues.org/2024_1st_Debate.htm): "We have a thousand billionaires in America. And what's happening? They're in a situation where they, in fact, pay 8.2% in taxes. If they just paid 24% or 25%, either one of those numbers, they'd raise $500 billion dollars in a 10-year period."
- q80 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "I'm a capitalist. If you want to make a million of bucks, that's great; just pay your fair share in taxes."

## 8. two-state-solution
keep: no
question: Should Israel and Palestine have two separate states?
pole -1: Two-state solution is necessary path
pole +1: One-state solution is preferable
score a: -0.20
score b: -0.92
models: sonnet a -0.30 b -0.90 · gpt-5 a -0.10 b -0.95 · confidence a 0.35 b 0.95
note: not clear enough -> confidence a 0.35, b 0.95 (needs 0.6)
reason a: Emphasizes Israel's right to defend itself with concerns about civilian protection, but doesn't address state solution preferences.
reason b: Explicitly states two-state solution is the only real path to guarantee both Israeli security and Palestinian dignity.
quotes a:
- q4 (2023-11-01, in a press release posted on his web site at NEWS: Sanders, Warren, W…, https://www.sanders.senate.gov/press-releases/news-sanders-warren-welch-merkley-send-urgent-letter-to-president-biden-amid-israels-invasion-and-potential-occupation-of-gaza/): "Israel suffered a barbaric attack and is well within its rights to defend itself in keeping with international law, including the protection of civilians. As a response, Israel is contemplating a large-scale ground invasion targeting Hamas. Reports indicate Israeli ground forces are already active in Gaza. We note recent reports that senior U.S. officials – including Secretary of Defense Austin –…"
quotes b:
- q84 (2024-03-07, 2024 State of the Union address, https://www.ontheissues.org/SOTU_2024.htm): "the only real solution to the situation is a two-state solution over time. There is no other path that guarantees Israel's security and democracy. There is no other path that guarantees Palestinian can live in peace with peace and dignity."

## 9. despair-vs-hope
keep: yes
question: Should Americans maintain hope during difficult times?
pole -1: Hope and determination are essential
pole +1: Despair is a rational response
score a: -0.95
score b: -0.82
models: sonnet a -0.95 b -0.85 · gpt-5 a -0.95 b -0.80 · confidence a 0.9 b 0.8
reason a: Directly states despair is not an option at this moment in history.
reason b: Expresses faith in American people and belief that America can accomplish anything together.
quotes a:
- q3 (2024, "I asked Bernie Sanders about a Gaza Ceasefire" - Hasan Minhaj, https://www.youtube.com/watch?v=_Bb04MsmzcI): "Look, at this particular moment in history, and perhaps at any moment in history, despair is not an option."
quotes b:
- q42 (2024-07-21, wikiquote: Announcement of the end of his 2024 reelection campaign (J…, https://en.wikiquote.org/wiki/Joe_Biden): "For now, let me express my deepest gratitude to all those who have worked so hard to see me reelected. I want to thank Vice President Kamala Harris for being an extraordinary partner in all this work. And let me express my heartfelt appreciation to the American people for the faith and trust you have placed in me. I believe today what I always have: that there is nothing America can't do - when w…"
