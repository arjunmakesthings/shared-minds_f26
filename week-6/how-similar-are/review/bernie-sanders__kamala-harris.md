# bernie-sanders & kamala-harris — review

approved: yes

a = bernie sanders, b = kamala harris. 11 quotes from a, 157 from b, 4 shared topics found.
to review: read each topic. change `keep:` to yes/no, fix a score or a pole if it's wrong, then set `approved: yes` above and run `node scripts/publish.js bernie-sanders kamala-harris`.
scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.

## 1. democracy-threat
keep: yes
question: Is Donald Trump a threat to American democracy?
pole -1: Trump threatens democracy and must be opposed
pole +1: Trump respects democratic principles and governance
score a: -1.00
score b: -1.00
models: sonnet a -1.00 b -1.00 · gpt-5 a -1.00 b -1.00 · confidence a 0.95 b 0.9
reason a: Sanders explicitly calls Trump a pathological liar who waged insurrection and is moving against democracy, calling him an authoritarian and very dangerous person.
reason b: Harris states Trump wants unchecked power, wants a military loyal to him not the Constitution, and is unhinged and unstable.
quotes a:
- q5 (2023-09-03, Face the Nation (3 September 2023), https://en.wikiquote.org/wiki/Bernie_Sanders): "We are living in an unprecedented moment in American history. Donald Trump is not only a pathological liar, has not only helped wage an insurrection … to prevent President Biden from taking office. Not only is denying American democracy — moving against the American democracy. So I think at this moment … we have got to bring the progressive community together to say, you know what, we're gonna fi…"
- q6 (2023-08-27, Meet the Press (27 August 2023) · transcript, https://www.youtube.com/watch?v=u8nOcUYJ5Do): "I think in this particular time, this particular moment in American history, when we're taking on somebody — the former President, who in fact does not believe in democracy — he is an authoritarian, and a very, very dangerous person — I think at this moment there has to be a unification of progressive people in general all over this country — people who are prepared to make sure that women contro…"
quotes b:
- q12 (2024-10-23, 23 October 2024 tweet cited in New York Post article by Miranda Devine, https://x.com/KamalaHarris/status/1849147561027707058): "Donald Trump is out for unchecked power. He wants a military like Adolf Hitler had, who will be loyal to him, not our Constitution. He is unhinged, unstable, and given a second term, there would be no one to stop him from pursuing his worst impulses."

## 2. israel-palestine
keep: no
question: Should Israel and Palestinians receive equal security and dignity?
pole -1: Equal security and dignity for both sides
pole +1: Israeli security takes priority over Palestinian concerns
score a: -0.25
score b: -0.95
models: sonnet a -0.30 b -1.00 · gpt-5 a -0.20 b -0.90 · confidence a 0.5 b 0.95
note: not clear enough -> confidence a 0.5, b 0.95 (needs 0.6)
reason a: Sanders affirms Israel's right to defend itself while emphasizing protection of civilians and noting U.S. concerns about ground invasion risks.
reason b: Harris explicitly states Palestinians are entitled to an equal amount of security and dignity as Israelis.
quotes a:
- q4 (2023-11-01, in a press release posted on his web site at NEWS: Sanders, Warren, W…, https://www.sanders.senate.gov/press-releases/news-sanders-warren-welch-merkley-send-urgent-letter-to-president-biden-amid-israels-invasion-and-potential-occupation-of-gaza/): "Israel suffered a barbaric attack and is well within its rights to defend itself in keeping with international law, including the protection of civilians. As a response, Israel is contemplating a large-scale ground invasion targeting Hamas. Reports indicate Israeli ground forces are already active in Gaza. We note recent reports that senior U.S. officials – including Secretary of Defense Austin –…"
quotes b:
- q33 (2024-09-10, ABC News 2024 Presidential debate in Philadelphia, https://www.ontheissues.org/2024_Sept_Debate.htm): "We must chart a course for a two-state solution. And in that solution, there must be security for the Israeli people and Israel and in equal measure for the Palestinians."
- q89 (2024-03-24, ABC This Week on 2024 Democratic Veepstakes, https://www.ontheissues.org/2024/Kamala_Harris_Foreign_Policy.htm): "We've been very clear that far too many innocent Palestinians have been killed. We have been very clear that Israel and the Israeli people and Palestinians are entitled to an equal amount of security and dignity."

## 3. climate-action
keep: yes
question: Is climate change an existential threat requiring urgent action?
pole -1: Climate change is existential and demands priority
pole +1: Climate concerns can be balanced with other goals
score a: -0.97
score b: -0.65
models: sonnet a -1.00 b -0.60 · gpt-5 a -0.95 b -0.70 · confidence a 0.8 b 0.6
reason a: Sanders explicitly calls climate change an existential threat and says he would feel awful if we turned our back on it.
reason b: Harris calls climate a clear crisis that must be taken seriously, though the quote lacks detail on urgency or prioritization.
quotes a:
- q1 (2024-07-07, CBS Face the Nation on 2024 Vermont Senate race, https://www.ontheissues.org/2024/Bernie_Sanders_Principles_+_Values.htm): "Well, I would feel awful, as somebody who has opposed virtually all of Trump's policies. And I would feel awful if the American people lost the democracy which we've had for 250 years. And I would feel awful if we turned our back on the existential threat of climate change."
quotes b:
- q51 (2024-08-29, CNN on 2024 Hopefuls: joint interview of Harris and Walz, https://www.ontheissues.org/2024_Veepstakes.htm): "My values have not changed. I believe it is very important that we take seriously what we must do to guard against what is a clear crisis in terms of the climate."

## 4. wealth-inequality
keep: no
question: Is wealth inequality a major problem requiring government action?
pole -1: Extreme inequality harms economy and requires intervention
pole +1: Market outcomes are acceptable regardless of inequality
score a: -1.00
score b: +0.00
models: sonnet a -1.00 b +0.20 · gpt-5 a -1.00 b -0.20 · confidence a 0.95 b 0.4
note: not clear enough -> confidence a 0.95, b 0.4 (needs 0.6)
reason a: Sanders describes extreme wealth inequality as unprecedented, highlighting that three people own more than the bottom half while millions live on starvation wages.
reason b: Harris discusses capital gains tax rates for high earners but frames it around encouraging investment and economic growth rather than addressing inequality.
quotes a:
- q10 (2023, wikiquote: 2023, https://en.wikiquote.org/wiki/Bernie_Sanders): "In terms of labor and our economy, we must recognize that we live in a period of more income and wealth inequality than at any time in the last hundred years. While the very rich become richer and three people now own more wealth than the bottom half of American society, 60% of American workers live paycheck to paycheck and millions are trying to exist on starvation wages. Meanwhile, we have a pa…"
quotes b:
- q48 (2024-09-09, 2024 Presidential campaign website KamalaHarris.com, https://www.ontheissues.org/2024/Kamala_Harris_Tax_Reform.htm): "Under her plan, the tax rate on long-term capital gains for those earning a million dollars a year or more will be 28 percent, because when the government encourages investment, it leads to broad-based economic growth and creates jobs."
