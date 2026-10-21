# bernie-sanders & donald-trump — review

approved: yes

a = bernie sanders, b = donald trump. 11 quotes from a, 182 from b, 5 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js bernie-sanders donald-trump`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. democracy-threat
keep: no
question: Is democratic governance under serious threat in America?
pole -1: Democracy faces existential threats requiring urgent action
pole +1: Democracy remains fundamentally sound and resilient
score a: -0.90
score b: +0.25
models: sonnet a -0.90 b +0.30 · gpt-5 a -0.90 b +0.20 · confidence a 0.86 b 0.4
note: not clear enough -> confidence a 0.86, b 0.4 (needs 0.6)
reason a: Sanders repeatedly states that Trump poses an existential threat to American democracy requiring urgent action from progressives.
reason b: Trump mentions election integrity concerns but doesn't clearly indicate whether democracy faces serious threats or is fundamentally sound.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
- q5 (2023-09-03, Face the Nation (3 September 2023), https://en.wikiquote.org/wiki/Bernie_Sanders): "We are living in an unprecedented moment in American history. Donald Trump is not only a pathological liar, has not only helped wage an insurrection … to prevent President Biden from taking office. Not only is denying American democracy — moving against the American democracy. So I think at this moment … we have got to bring the progressive community together to say, you know what, we're gonna fi…"
- q6 (2023-08-27, Meet the Press (27 August 2023) · transcript, https://www.youtube.com/watch?v=u8nOcUYJ5Do): "I think in this particular time, this particular moment in American history, when we're taking on somebody — the former President, who in fact does not believe in democracy — he is an authoritarian, and a very, very dangerous person — I think at this moment there has to be a unification of progressive people in general all over this country — people who are prepared to make sure that women contro…"
quotes b:
- q119 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "The election, people should never be thinking about an election as fraudulent. We need two things. We need walls. We have to have borders. And we have to have good elections."

## 2. money-politics
keep: no
question: Does money from wealthy interests corrupt the political system?
pole -1: Money corrupts politics and must be controlled
pole +1: Money in politics reflects legitimate influence and choice
score a: -0.95
score b: -0.45
models: sonnet a -0.95 b -0.50 · gpt-5 a -0.95 b -0.40 · confidence a 0.84 b 0.45
note: not clear enough -> confidence a 0.84, b 0.45 (needs 0.6)
reason a: Sanders explicitly states the political system is corrupt due to money and special interests and calls for taking them on.
reason b: Trump states the system is rigged but lacks specificity about wealthy interests corrupting politics versus other forms of rigging.
quotes a:
- q2 (2024, Speech at the Center for International Policy, https://www.youtube.com/watch?v=G-X_9cLDaDY): "[A]nyone who wants to talk about foreign policy or, for that matter, anything that goes on in Congress, without recognizing the corrupt political system that we have and the impact that money has over what we do, really doesn't know very much about what's going on."
- q11 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "At a time when too many Americans are giving up on democracy, now is the time to attempt to restore faith in our government. Now is the time for Congress to have the courage to take on the lobbyists and powerful special interests and show the American people that our government can work for them, and not just the 1%. Let’s do it."
quotes b:
- q108 (2024-10-16, Chicago Economic Club transcript: 2024 Presidential hopefuls, https://www.ontheissues.org/2024/Donald_Trump_Technology.htm): "I think it's a whole rigged deal. I think Google's rigged just like our government is rigged all over the place."

## 3. police-support
keep: yes
question: Should police departments be strengthened and supported?
pole -1: Police need better training, pay and support
pole +1: Police departments should be defunded or abolished
score a: -0.73
score b: -0.85
models: sonnet a -0.65 b -0.80 · gpt-5 a -0.80 b -0.90 · confidence a 0.85 b 0.75
reason a: Sanders opposes abolishing police, advocates for well-trained, well-educated, and well-paid professionals with better-defined roles.
reason b: Trump expresses strong support for police and letting them do their jobs, backing law enforcement.
quotes a:
- q7 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "Do I think we should not have police departments in America? No, I don't. There's no city in the world that does not have police departments."
- q8 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "I think we want to redefine what police departments do, give them the support they need to make their jobs better defined. So I do believe that we need well-trained, well-educated, and well-paid professionals in police departments."
- q9 (2023-07-19, New Yorker magazine on 2024 Vermont Senate race, https://www.ontheissues.org/Media_New_Yorker.htm): "Anyone who thinks that we should abolish all police departments in America, I don't agree."
quotes b:
- q66 (2026, Remarks on Law Enforcement in Garden City, New York, https://www.presidency.ucsb.edu/documents/remarks-law-enforcement-garden-city-new-york): "Together, we're showing what is possible when you finally have a President in the White House who supports our police, who lets you do your jobs, and who always backs the blue."

## 4. wealth-inequality
keep: no
question: Is wealth inequality a major problem requiring action?
pole -1: Extreme inequality harms society and needs addressing
pole +1: Wealth distribution reflects natural market outcomes
score a: -0.95
score b: +0.20
models: sonnet a -0.95 b +0.20 · gpt-5 a -0.95 b +0.20 · confidence a 0.86 b 0.3
note: not clear enough -> confidence a 0.86, b 0.3 (needs 0.6)
reason a: Sanders describes extreme inequality as a defining problem with the rich getting richer while workers struggle on starvation wages.
reason b: Trump's comment about stock market rising under his leadership suggests positive view of wealth creation but doesn't directly address inequality.
quotes a:
- q10 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "In terms of labor and our economy, we must recognize that we live in a period of more income and wealth inequality than at any time in the last hundred years. While the very rich become richer and three people now own more wealth than the bottom half of American society, 60% of American workers live paycheck to paycheck and millions are trying to exist on starvation wages. Meanwhile, we have a pa…"
quotes b:
- q155 (2024-01-10, Fox News Town Hall 2024 pre-Iowa caucus, https://www.ontheissues.org/2024/Donald_Trump_Budget_+_Economy.htm): "We have a situation which I believe the stock market goes up because I'm leading."

## 5. energy-independence
keep: yes
question: Should America prioritize fossil fuel energy over alternatives?
pole -1: Pursue oil, gas and natural energy independence
pole +1: Transition away from fossil fuels
score a: +0.75
score b: -0.87
models: sonnet a +0.70 b -0.85 · gpt-5 a +0.80 b -0.90 · confidence a 0.62 b 0.86
reason a: Sanders identifies climate change as an existential threat, indicating support for transitioning away from fossil fuels.
reason b: Trump explicitly advocates for oil, gas and natural gas as cheaper and better, seeking energy independence through fossil fuels.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
quotes b:
- q177 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "We want oil and gasoline and natural gas because it is cheaper, better and much more powerful."
- q178 (2023-03-04, Speech at the 2023 CPAC Conference in Maryland, https://www.ontheissues.org/2024/Donald_Trump_Energy_+_Oil.htm): "Under my leadership we will regain energy independence that we had three years ago."
