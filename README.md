# Method Match

A frontend-only practice app for introductory statistics students. Each card describes a short study; the learner reads the research question, inspects the variables, and matches it to one of eight methods. Feedback explains why a method fits, names reasonable alternatives, and gives one condition to check before using it on real data.

There is no backend, login, analytics, or external call. All content and scoring run in the browser, and the only thing stored is a local flag recording that the introduction has been seen.

## Commands

```bash
npm install
npm run dev       # local dev server
npm test          # content checks, round logic, and a keyboard-only round through the UI
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
npm run lint
```

## Where things live

| Path | What it holds |
| --- | --- |
| `src/content/methods.ts` | The eight answer choices, their order, and the method map text |
| `src/content/scenarios.ts` | The ten scenario cards, with all feedback written out |
| `src/content/validate.ts` | Startup checks on the content |
| `src/round/round.ts` | Round state: selection, checking, retry, reveal, summary |
| `src/components/` | UI: scenario panel, method picker, feedback card, summary |
| `src/index.css` | Styles, modelled on Shiny for R's bslib dashboard look |

## Editing content

Methods are referenced by stable IDs (`'paired-t'`, `'chi-square-independence'`, and so on), never by their labels. Each scenario stores:

- `bestMethodId`: the single best introductory answer
- `alsoDefensible`: methods that also answer the stated question, each with an explanation. Choosing one counts as a successful match.
- `reconsider`: a case-specific hint for **every** other method
- `explanation`, `decisiveClue`, `likelyConfusion`, `conditionToCheck`, and an optional `designNote`

When the app starts, it checks that every referenced method exists, that no card lists its best method as also defensible, and that every possible choice has authored feedback. If any check fails, the app shows the list of problems instead of the deck. `npm test` runs the same checks.

## Answer rules

- **Best fit** or **Also defensible** resolves the card. Also defensible feedback always shows the best fit too.
- **Reconsider** shows the hint for that choice and allows one retry. A second Reconsider reveals the best fit and its explanation, so no one gets stuck. Re-checking a method already marked Reconsider is refused instead of using up the retry.
- The summary counts cards understood on the first attempt (best fit or also defensible) and groups the misses by the method to revisit. Replaying a card from the summary does not change those counts.

## Judgement calls for the instructor review

The plan calls for an introductory statistics instructor to review every card before release. These choices in particular need a decision:

1. **Two-group cards (01 and 08)** accept both simple linear regression with a 0/1 indicator and one-way ANOVA as *also defensible*, because both are equivalent to the pooled t-test. If the course defines ANOVA strictly as a method for three or more groups, move `one-way-anova` from `alsoDefensible` to `reconsider` on those cards.
2. **Card 04 (correlation)** accepts simple linear regression as also defensible. **Card 05 (slope)** does not accept correlation, because r cannot give points per hour.
3. **Card 03 (three groups)** marks simple linear regression as Reconsider: one predictor coded 1/2/3 would impose an order. The hint says that regression with two indicators reproduces the test, but that it falls outside this palette.
4. **Card 09** now states that light durations were randomly assigned, which supports the causal reading in its design note. The plan's wording ("receive varying measured amounts") left this open.
5. **Card 08** says that everyone finished, so that the outcome isn't a time-to-event outcome.

## Deploying to Netlify

`netlify.toml` sets the build command to `npm run build`, the publish directory to `dist`, and Node 22. The MVP serves only `/`, so it needs no redirects or functions. To deploy, connect the repository to Netlify for deploy previews and production deploys. After the first deploy, check the public URL on a phone and a desktop browser.
