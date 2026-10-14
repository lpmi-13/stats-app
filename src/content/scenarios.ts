import type { Scenario } from './types'

/**
 * The seed deck. These are fictional teaching scenarios: assume the ordinary
 * conditions suggested by each story are plausible, while the feedback still
 * reminds learners to check them with real data.
 *
 * Every card stores its accepted alternatives and its feedback explicitly.
 * Nothing is inferred from keywords. `validateContent` checks the structure at startup.
 */
export const scenarios: Scenario[] = [
  {
    id: '01',
    title: 'Two tutoring formats',
    prompt:
      'A course team randomly assigns 120 students to one of two tutoring formats: weekly small-group sessions or on-demand online tutoring. At the end of term, each student sits one final exam scored from 0 to 100.',
    question: 'Do the two tutoring formats differ in mean final exam score?',
    clues: {
      aim: 'Compare mean exam scores between formats',
      outcome: 'Final exam score, 0–100 (numeric)',
      predictorOrGroups: 'Tutoring format: 2 groups',
      observations: 'Independent: each student is in one group and gives one score',
    },
    bestMethodId: 'independent-t',
    alsoDefensible: [
      {
        methodId: 'simple-linear-regression',
        explanation:
          'Regressing exam score on a 0/1 format indicator works: the slope is the difference in group means, and its test matches the equal-variance (pooled) t-test. That framing helps if you later add covariates, but the t-test answers this two-group question most directly.',
      },
      {
        methodId: 'one-way-anova',
        explanation:
          'With exactly two groups, the one-way ANOVA F-test is equivalent to the pooled t-test (F = t²), so it reaches the same conclusion. ANOVA is usually kept for three or more groups, and the t-test also shows which format scored higher.',
      },
    ],
    explanation:
      'Students are split into two separate groups, and each contributes one numeric exam score. The question asks whether the two group means differ, which is exactly what an independent-samples t-test compares.',
    decisiveClue: 'Two independent groups, one continuous outcome, and a difference in means as the target.',
    likelyConfusion:
      'Picking the paired t-test because both groups sit the same exam. Pairing needs two measurements on the same student, or deliberately matched pairs, not a shared test.',
    conditionToCheck:
      'Check that scores are independent (for example, that small-group sessions didn’t create clusters of students who influence one another) and look at each group’s distribution for strong skew or outliers. Welch’s version of the t-test avoids assuming equal group variances.',
    designNote:
      'Because formats were randomly assigned, a clear difference in means can reasonably be attributed to the format, within the limits of this sample.',
    reconsider: {
      'paired-t':
        'The scores you would compare come from different students, so there are no natural pairs. A paired test needs two measurements on the same unit, such as each student’s before and after score.',
      'pearson-correlation':
        'Tutoring format isn’t a quantitative variable; it’s a label with two groups. Correlation describes how two numeric measures move together, not a difference between group means.',
      'chi-square-independence':
        'The outcome is a numeric score, not a category. Chi-square compares counts across categories, and turning scores into pass/fail would throw away information the question uses.',
      'binary-logistic-regression':
        'Logistic regression models a yes/no outcome. Here the outcome is a score from 0 to 100, and the question is about its mean.',
      'none-fits':
        'One of the listed methods fits: there are two independent groups and one numeric outcome per student. Which method compares two group means?',
    },
  },
  {
    id: '02',
    title: 'Workshop before and after',
    prompt:
      'Thirty-five students take a numeric data-skills test, attend a two-week workshop, and then take a parallel version of the same test. Every student completes both tests.',
    question: 'Is the mean within-student change in test score different from zero?',
    clues: {
      aim: 'Estimate the mean change within each student',
      outcome: 'Skills test score (numeric)',
      predictorOrGroups: 'Time point: before and after',
      observations: 'Paired: each student gives a before and an after score',
    },
    bestMethodId: 'paired-t',
    alsoDefensible: [],
    explanation:
      'Each student supplies two scores, so match each after score to that student’s before score and analyze the differences. The question is about the mean of those within-student differences, which is what a paired t-test examines.',
    decisiveClue: 'The same students are measured twice, and the target is the mean within-student change.',
    likelyConfusion:
      'Treating before and after as two independent groups. That ignores how much students differ from one another, which usually makes a real change harder to detect.',
    conditionToCheck:
      'Compute each student’s difference and inspect those differences: look for strong skew or outliers, and confirm that one student’s change doesn’t depend on another’s.',
    designNote:
      'This is a method choice, not proof that the workshop caused the change. Practice with the test, time passing, and other coursework could also move scores, and there is no comparison group.',
    reconsider: {
      'independent-t':
        'The outcome is numeric, but the two scores come from the same students. Match each student’s after score to their before score and analyze the differences.',
      'one-way-anova':
        'One-way ANOVA compares independent groups, and the before and after scores belong to the same students. Look for a method built around each student’s change.',
      'pearson-correlation':
        'Correlating before and after scores shows whether students keep their rank order, not whether scores rose on average. A strong correlation is possible with no change at all.',
      'simple-linear-regression':
        'Predicting after scores from before scores describes how they relate, but the question asks about the average change. Work with each student’s difference instead.',
      'chi-square-independence':
        'There are no category counts here; each student has two numeric scores. Chi-square needs categorical variables.',
      'binary-logistic-regression':
        'The outcome isn’t yes/no. Each student has numeric before and after scores, and the question asks about the mean change.',
      'none-fits':
        'A listed method fits: two numeric measurements on each student, with the mean difference as the target.',
    },
  },
  {
    id: '03',
    title: 'Three revision formats',
    prompt:
      'Ninety students are randomly assigned to one of three revision formats: flashcards, practice quizzes, or summary notes. Each student then takes one exam scored from 0 to 100.',
    question: 'Is there evidence that any of the three formats has a different mean exam score?',
    clues: {
      aim: 'Compare mean exam scores across formats',
      outcome: 'Exam score, 0–100 (numeric)',
      predictorOrGroups: 'Revision format: 3 groups',
      observations: 'Independent: each student is in one group and gives one score',
    },
    bestMethodId: 'one-way-anova',
    alsoDefensible: [],
    explanation:
      'There are three separate groups and one numeric score per student. One-way ANOVA tests whether any of the group means differ, using one overall test instead of several pairwise comparisons.',
    decisiveClue: 'One grouping variable with three levels and a continuous outcome.',
    likelyConfusion:
      'Running three separate two-group t-tests. Each extra test adds another chance of a false alarm, so start with one overall test and follow up only if it is warranted.',
    conditionToCheck:
      'Check that observations are independent, then inspect the residuals (each score minus its group mean) for similar spread across groups and no extreme outliers.',
    designNote:
      'A significant ANOVA says at least one mean differs, not which one. Follow-up comparisons with an adjustment for multiple tests answer that, and this deck doesn’t cover them in detail.',
    reconsider: {
      'independent-t':
        'An independent-samples t-test compares exactly two groups, and there are three here. Several t-tests inflate the chance of a false alarm; count the groups and look for one overall test.',
      'paired-t':
        'Each student appears in only one format, so there are no pairs. A paired test needs repeated measurements on the same unit.',
      'pearson-correlation':
        'Revision format is a category with three levels, not a quantitative variable. Correlation needs two numeric measures.',
      'simple-linear-regression':
        'Simple linear regression uses one quantitative predictor, and coding the formats as 1, 2, and 3 would wrongly treat them as ordered and equally spaced. A regression with two indicator variables can reproduce the right test, but that is a multiple regression outside this palette.',
      'chi-square-independence':
        'Exam score is numeric, and the question is about mean scores. Chi-square compares counts of a categorical outcome.',
      'binary-logistic-regression':
        'The outcome is a 0–100 score, not a yes/no result.',
      'none-fits':
        'A listed method fits: three independent groups and one numeric outcome per student.',
    },
  },
  {
    id: '04',
    title: 'Sleep and concentration',
    prompt:
      'A campus survey asks 200 students how many hours they slept last night, and each completes a short concentration task scored from 0 to 50. Each respondent appears once.',
    question:
      'How strong is the linear association between sleep hours and concentration score, and in what direction?',
    clues: {
      aim: 'Describe the strength and direction of a linear association',
      outcome: 'None named as the response',
      predictorOrGroups: 'Two numeric measures: sleep hours and concentration score',
      observations: 'Independent: one pair of measurements per respondent',
    },
    bestMethodId: 'pearson-correlation',
    alsoDefensible: [
      {
        methodId: 'simple-linear-regression',
        explanation:
          'Regressing concentration on sleep shows the same direction and gives the same test of association, and R² equals r². But the question names no response variable and asks for strength, which r reports directly on a unitless scale from −1 to 1.',
      },
    ],
    explanation:
      'Each respondent gives two numeric measurements, and the question asks how strongly and in which direction they move together. Pearson’s r summarizes exactly that on a scale from −1 to 1, without naming either variable as the response.',
    decisiveClue: 'Two quantitative measures, a symmetric question, and strength of association as the target.',
    likelyConfusion:
      'Reaching for regression because both variables are numeric. Regression fits better when the question names a response and asks how much it changes per unit of a predictor.',
    conditionToCheck:
      'Plot the scatterplot first. Pearson’s r only captures linear patterns, and a few outliers or a curved relationship can make it misleading.',
    designNote:
      'This is an observational survey, so even a strong correlation wouldn’t show that more sleep improves concentration. Self-reported sleep may also be measured with error.',
    reconsider: {
      'independent-t':
        'There are no groups to compare. Both variables are numeric measurements on the same respondents.',
      'paired-t':
        'Sleep hours and concentration score measure different things on different scales, so their difference has no meaning. Pairing is for two measurements of the same quantity.',
      'one-way-anova':
        'There are no groups here. Both variables are quantitative, and the question asks how they move together.',
      'chi-square-independence':
        'Both variables are numeric. Cutting them into categories would discard information, and the question asks about the strength of a linear association.',
      'binary-logistic-regression': 'Neither variable is a yes/no outcome.',
      'none-fits':
        'A listed method fits: two numeric variables measured on each respondent, with strength and direction as the target.',
    },
  },
  {
    id: '05',
    title: 'Revision hours and final score',
    prompt:
      'An observational study records each student’s average weekly revision hours across a term and their final course score from 0 to 100. Students chose how much to revise.',
    question: 'By how much does the mean final score change for each extra weekly revision hour?',
    clues: {
      aim: 'Estimate the change in mean score per extra revision hour',
      outcome: 'Final course score, 0–100 (numeric)',
      predictorOrGroups: 'Weekly revision hours (numeric)',
      observations: 'Independent: one record per student',
    },
    bestMethodId: 'simple-linear-regression',
    alsoDefensible: [],
    explanation:
      'The question names a response (final score) and one quantitative predictor (revision hours), and it asks for the change in mean score per hour. That quantity is the slope of a simple linear regression, reported in points per hour.',
    decisiveClue: 'A continuous outcome, one quantitative predictor, and a slope as the target.',
    likelyConfusion:
      'Choosing correlation because both variables are numeric. Correlation is unitless and symmetric, so it can’t say how many points one extra hour is associated with.',
    conditionToCheck:
      'Plot score against revision hours to check that a straight line is reasonable, then inspect the residuals for curvature, unequal spread, and influential points.',
    designNote:
      'Students chose their own revision hours, so the slope describes an association, not the effect of revising more. Students who revise more may differ in other ways, such as prior attainment.',
    reconsider: {
      'independent-t':
        'There are no two groups to compare. Revision hours is a quantitative predictor, and the question asks for a per-hour change.',
      'paired-t':
        'Each student has one score and one revision-hours value, which measure different things. There are no repeated measurements of the same quantity.',
      'one-way-anova':
        'ANOVA compares group means, but revision hours is quantitative, not a set of groups. Binning hours into groups would lose the per-hour change the question asks for.',
      'pearson-correlation':
        'Correlation would describe how strongly the two variables are associated, but it has no units. The question asks for points per extra hour, which is a slope.',
      'chi-square-independence':
        'Both variables are numeric, and the target is a change in mean score per hour, not an association between categories.',
      'binary-logistic-regression':
        'The outcome is a 0–100 score, not a yes/no result.',
      'none-fits':
        'A listed method fits: a numeric outcome, one quantitative predictor, and a per-hour change as the target.',
    },
  },
  {
    id: '06',
    title: 'Year of study and study location',
    prompt:
      'A large student survey records each respondent’s year of study (first, second, or third) and their preferred study location (home, library, or café). Each respondent is counted once, and every cell of the resulting table has an adequate expected count.',
    question: 'Are year of study and preferred study location associated?',
    clues: {
      aim: 'Test whether two categorical variables are associated',
      outcome: 'None named as the response',
      predictorOrGroups: 'Year of study (3 levels) and study location (3 levels)',
      observations: 'Independent: each respondent counted once',
    },
    bestMethodId: 'chi-square-independence',
    alsoDefensible: [],
    explanation:
      'Both variables are categorical, so the data form a three-by-three table of counts. A chi-square test of independence asks whether the pattern of study locations differs by year more than chance alone would suggest.',
    decisiveClue: 'A three-by-three table of independent counts, with no binary outcome or adjustment requested.',
    likelyConfusion:
      'Choosing logistic regression because the survey has an outcome-like variable. Binary logistic regression needs a yes/no outcome; study location has three categories, and no adjustment is requested.',
    conditionToCheck:
      'Confirm that each respondent appears in exactly one cell, and check the expected counts. Many small expected counts make the chi-square approximation unreliable.',
    designNote:
      'A significant result says the variables are associated, not why. Look at the table, for example the row percentages, to describe where the pattern lies.',
    reconsider: {
      'independent-t':
        'There’s no numeric outcome to average. Both variables are categories, and the data are counts.',
      'paired-t':
        'There are no paired measurements; each respondent is counted once, in one cell of the table.',
      'one-way-anova':
        'ANOVA compares mean numeric outcomes across groups, but study location is a category, so there is no mean to compare.',
      'pearson-correlation':
        'Neither variable is quantitative. Coding the categories as numbers would invent an order and spacing they don’t have.',
      'simple-linear-regression':
        'Regression needs a numeric response, and preferred study location is a category.',
      'binary-logistic-regression':
        'Binary logistic regression needs a yes/no outcome. Study location has three categories, and the question asks about association, not an adjusted model.',
      'none-fits':
        'A listed method fits: two categorical variables summarized as a table of counts.',
    },
  },
  {
    id: '07',
    title: 'Online course completion',
    prompt:
      'A university follows 600 students who enroll in a self-paced online course. It records whether each student completes the course within 30 days (yes or no), their weekly study hours, and their prior grade average.',
    question:
      'How are weekly study hours associated with the odds of completion, after adjusting for prior grade average?',
    clues: {
      aim: 'Model completion odds, adjusting for prior grades',
      outcome: 'Completed within 30 days: yes or no',
      predictorOrGroups: 'Weekly study hours and prior grade average (both numeric)',
      observations: 'Independent: one record per student',
    },
    bestMethodId: 'binary-logistic-regression',
    alsoDefensible: [],
    explanation:
      'The outcome is binary, and the question asks about study hours while holding prior grade average constant. Binary logistic regression models the odds of completion from several predictors at once, so it gives that adjusted association.',
    decisiveClue: 'A yes/no outcome plus a request to adjust for a second predictor.',
    likelyConfusion:
      'Choosing chi-square because completion is categorical. A chi-square test can’t adjust for prior grades, and it would require cutting study hours into bins.',
    conditionToCheck:
      'Check that students are independent (no ignored clustering by section or tutor), that there are enough completions and non-completions for the number of predictors, and that the model fits reasonably.',
    designNote:
      'Adjusting for prior grades helps, but it doesn’t make this a causal estimate. Other differences between students, such as motivation or available time, could still explain the association.',
    reconsider: {
      'independent-t':
        'Comparing mean study hours between completers and non-completers flips the roles of the variables and can’t adjust for prior grade average. The outcome here is completion.',
      'paired-t': 'Each student has one record; there are no repeated measurements to pair.',
      'one-way-anova':
        'The outcome is yes/no, not a numeric score with group means, and the predictors are quantitative.',
      'pearson-correlation':
        'Correlation relates two numeric variables without any adjustment. Here the outcome is yes/no, and the question asks for an adjusted association.',
      'simple-linear-regression':
        'Simple linear regression models a numeric outcome from one predictor. Here the outcome is yes/no, and there are two predictors.',
      'chi-square-independence':
        'Chi-square tests whether two categorical variables are associated, but it can’t adjust for prior grade average, and study hours would have to be cut into bins.',
      'none-fits': 'A listed method fits: a binary outcome with more than one predictor.',
    },
  },
  {
    id: '08',
    title: 'Music or silence',
    prompt:
      'Sixty volunteers are randomly assigned to complete the same puzzle task either while music plays or in silence. Each volunteer takes part once and everyone finishes; the researchers record each completion time in seconds.',
    question: 'Do the music and silence groups differ in mean completion time?',
    clues: {
      aim: 'Compare mean completion times between conditions',
      outcome: 'Completion time in seconds (numeric)',
      predictorOrGroups: 'Condition: music or silence (2 groups)',
      observations: 'Independent: each volunteer is in one group and gives one time',
    },
    bestMethodId: 'independent-t',
    alsoDefensible: [
      {
        methodId: 'simple-linear-regression',
        explanation:
          'Regressing completion time on a 0/1 music indicator gives a slope equal to the difference in group means, and its test matches the pooled t-test. The two-group t-test is the more direct way to state this comparison.',
      },
      {
        methodId: 'one-way-anova',
        explanation:
          'With two groups, the one-way ANOVA F-test is equivalent to the pooled t-test, so it reaches the same conclusion. The t-test is the simpler match for exactly two groups and shows which group was faster.',
      },
    ],
    explanation:
      'Different volunteers are in each condition, and each contributes one numeric completion time. That is the same structure as a two-group comparison of means, so an independent-samples t-test fits. Methods are never used up; several cards can share one.',
    decisiveClue: 'Two independent groups and a continuous outcome.',
    likelyConfusion:
      'Looking for a different answer because this method already fitted another card. The choice depends on the data structure, and several cards share a structure.',
    conditionToCheck:
      'Completion times are often right-skewed, with a few very slow volunteers. Look at each group’s distribution; with strong skew or outliers, consider analyzing log times or ask about a method designed for skewed data.',
    designNote:
      'Random assignment supports attributing a difference in mean time to the condition. If some volunteers had not finished, the data would need methods for time-to-event outcomes.',
    reconsider: {
      'paired-t':
        'Each volunteer took part once, so there are no pairs. A paired design would have each volunteer do the task under both conditions.',
      'pearson-correlation':
        'Condition is a two-level label, not a quantitative measure, and the question asks about a difference in means.',
      'chi-square-independence':
        'Completion time is numeric. Chi-square compares counts across categories.',
      'binary-logistic-regression':
        'There’s no yes/no outcome: everyone finished, and the outcome is a time in seconds.',
      'none-fits':
        'A listed method fits: two independent groups and one numeric outcome per person. The same method can be the answer to more than one card.',
    },
  },
  {
    id: '09',
    title: 'Seedlings and light',
    prompt:
      'In a greenhouse trial, 48 seedlings growing in separate pots are each randomly assigned a daily light duration between 8 and 16 hours. On day 21, the researchers measure each seedling’s height in centimeters. Over this range, the relationship is expected to be roughly linear.',
    question: 'By how much does mean seedling height change for each additional daily hour of light?',
    clues: {
      aim: 'Estimate the change in mean height per extra hour of light',
      outcome: 'Height on day 21, in cm (numeric)',
      predictorOrGroups: 'Daily hours of light, 8 to 16 (numeric)',
      observations: 'Independent: one height per seedling, in separate pots',
    },
    bestMethodId: 'simple-linear-regression',
    alsoDefensible: [],
    explanation:
      'Height is the response and daily hours of light is a single quantitative predictor. The question asks for centimeters per extra hour, which is the slope of a simple linear regression.',
    decisiveClue: 'A continuous response, one quantitative predictor, and a slope as the target.',
    likelyConfusion:
      'Treating light levels as groups and using ANOVA. That ignores the ordering and spacing of the hours and doesn’t give a per-hour change.',
    conditionToCheck:
      'Plot height against light to confirm that a straight line fits between 8 and 16 hours, check the residuals, and avoid predicting outside that range.',
    designNote:
      'Because light durations were randomly assigned, the slope can be read as an effect of light under these greenhouse conditions, but only within the 8–16 hour range studied.',
    reconsider: {
      'independent-t':
        'There aren’t two groups; light varies across a range of hours. The question asks for a per-hour change.',
      'paired-t': 'Each seedling is measured once, so there are no pairs.',
      'one-way-anova':
        'Light is a quantitative predictor. Treating each light level as a separate group would ignore its ordering and wouldn’t give the per-hour change the question asks for.',
      'pearson-correlation':
        'Correlation would describe how strongly height and light move together, but the question asks for centimeters per extra hour, which is a slope.',
      'chi-square-independence':
        'Height and light are both numeric; there are no category counts.',
      'binary-logistic-regression':
        'Height is measured in centimeters, not as a yes/no outcome.',
      'none-fits':
        'A listed method fits: a numeric response, one quantitative predictor, and a per-hour change as the target.',
    },
  },
  {
    id: '10',
    title: 'Why students leave a course',
    prompt:
      'Researchers hold open-ended interviews with 15 students who left a course before it finished. They plan to read the transcripts closely and identify recurring themes. They are not planning to score responses or count categories.',
    question: 'What themes appear in students’ accounts of why they left?',
    clues: {
      aim: 'Identify themes in interview accounts',
      outcome: 'No numeric or categorical outcome planned',
      predictorOrGroups: 'None defined',
      observations: 'Interview transcripts from 15 students',
    },
    bestMethodId: 'none-fits',
    alsoDefensible: [],
    explanation:
      'The aim is to understand and describe themes in what students say, and there is no numeric outcome or set of category counts to test. That calls for a qualitative analysis plan, such as thematic analysis, rather than a statistical test.',
    decisiveClue: 'An open-ended, thematic question with no numeric outcome or counts planned.',
    likelyConfusion:
      'Forcing a test onto the data because this is a research study. Not every research question is answered with a hypothesis test.',
    conditionToCheck:
      'Write down the qualitative approach before analyzing: how transcripts will be coded, who codes them, and how disagreements are resolved. If a later question involves counting coded themes, revisit the method choice then.',
    designNote:
      'Fifteen students who left can describe reasons for leaving, but they can’t estimate how common each reason is among everyone who leaves.',
    reconsider: {
      'independent-t':
        'There are no groups or numeric outcome to compare. The aim is to identify themes in what students say.',
      'paired-t': 'There are no repeated numeric measurements; the data are interview transcripts.',
      'one-way-anova':
        'There are no groups with numeric outcomes. The question asks what themes appear, not whether means differ.',
      'pearson-correlation':
        'There are no two quantitative variables to correlate. The data are open-ended accounts.',
      'simple-linear-regression':
        'There’s no numeric response or predictor. Transcripts call for a qualitative analysis, not a fitted line.',
      'chi-square-independence':
        'Chi-square needs counts in categories, and the researchers aren’t planning to count anything. Counting coded themes later would be a different question.',
      'binary-logistic-regression':
        'There’s no yes/no outcome to model. Every interviewee left the course, so leaving doesn’t vary.',
    },
  },
]
