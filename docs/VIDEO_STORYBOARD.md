# MBA Demo Storyboard (Desktop-Only)

## Scope

- Format: Desktop recording only
- Resolution target: 1440x900
- Audience: instructor and rubric evaluators
- Runtime target: 8 to 10 minutes
- Story style: owner dashboard plus cashier checkout simulation
- Version note: reflects latest flow where non-pipeline pages use Dataset A by default, while pipeline iterations auto-include datasets in chronological order (A, B, then uploads)

## Required Coverage (Integrated)

- Demo explicitly uses both Dataset A and Dataset B.
- Show at least 3 self-learning iterations (recommended: v1, v2, v3, plus optional v4 using uploaded Dataset C for "3+" evidence).
- Explain key code parts and system logic in plain language while navigating relevant screens.
- Explain usefulness in terms of business decision support (bundling, promo targeting, cross-sell timing, and checkout actions).

## Recording Setup

1. Start backend API on port 8000 and frontend on port 3000.
2. Set browser zoom to 100% and keep one desktop window in focus.
3. Record desktop viewport only (no mobile captures).
4. Show terminal only for reproducibility and test proof.
5. Keep route transitions quick and intentional; narrate why each screen matters.
6. Prepare one quick upload action for Dataset C so you can optionally show a 4th iteration as proof of "3+" self-learning loops.

## Scene Flow (With Explanation Prompts)

1. Scene 1: Problem Framing (0:00 to 0:45)
- Visual: Dashboard hero plus KPI cards.
- Explain: who uses the system (owner and cashier), what decisions improve (bundles, promos, checkout suggestions), and why this is a real business problem.
- Rubric link: Business Context and Problem Framing.

2. Scene 2: Data Inputs and Quality (0:45 to 1:40)
- Visual: Transactions page diagnostics and upload area.
- Explain: Dataset A as baseline behavior on non-pipeline pages, and Dataset B as additional behavior source consumed in the learning pipeline.
- Explain: transaction count, raw vs normalized unique items, and unmapped terms as a data quality safeguard.
- Rubric link: Data Handling and Transaction Quality.

3. Scene 3: Pipeline Architecture (1:40 to 2:35)
- Visual: Pipeline architecture section and iteration source metadata.
- Explain: ingestion -> cleaning -> mining -> rules -> scoring -> storage -> recommendation services.
- New behavior to call out: pipeline now resolves dataset sources automatically in chronological order and persists dataset source lists per run.
- Code logic callout (brief): show where this orchestration lives and summarize each module responsibility (pipeline orchestration, frequent itemset mining, rule scoring, drift detection, threshold adaptation).
- Rubric link: Pipeline Architecture Diagram and Loop Clarity.

4. Scene 4: Iteration v1 Baseline (2:35 to 3:20)
- Visual: Pipeline iteration table/charts for first run.
- Explain: v1 starts from baseline behavior (Dataset A) and establishes initial top rules and thresholds.
- Rubric link: Self-Learning and Automation.

5. Scene 5: Iteration v2 Cumulative Learning (3:20 to 4:10)
- Visual: Metric changes between v1 and v2.
- Explain: adding Dataset B shifts support distributions, rule counts, and quality metrics.
- Emphasize: this is cumulative learning, not a disconnected rerun.
- Rubric link: Self-Learning and Evaluation.

6. Scene 6: Iteration v3 Drift Simulation (4:10 to 5:10)
- Visual: Drift and stability section.
- Explain: Jaccard-based drift signal, adaptive threshold response, and final stability verdict from top-rule survival.
- Rubric link: Self-Learning Core Requirement and Intelligent Mechanism.

7. Scene 7: Iteration v4 Optional (Upload-Driven "3+" Proof) (5:10 to 5:40)
- Visual: quick Dataset C upload then rerun pipeline and show new run metadata.
- Explain: this demonstrates the system can continue learning beyond three fixed iterations as new data arrives.
- Rubric link: Automation Continuity and Extensibility.

8. Scene 8: Outputs for Real Decisions (5:40 to 7:20)
- Visual sequence: Bundles -> Rules -> Promos -> Insights.
- Explain each metric in decision language:
	- Support: how often a pattern appears.
	- Confidence: conditional likelihood of consequent purchase.
	- Lift: strength beyond random co-occurrence.
	- Leverage and conviction: additional reliability context.
- New behavior to call out: cross-dataset comparison entry points are consolidated under Insights and Pipeline.
- Decision-support framing: for each page, state one concrete store action (what to bundle, what to discount, what to surface at checkout, what to prioritize on homepage).
- Rubric link: MBA Engine Correctness and Business Insights.

9. Scene 9: Store Simulation (7:20 to 8:35)
- Visual: Shop page and Cart page.
- Explain: product discovery, recommendation prompts, quantity controls, and backend-calculated promo stacking breakdown.
- New behavior to call out: cart promotions are computed server-side with deterministic non-overlapping unit usage.
- Rubric link: Real System Behavior and Creativity.

10. Scene 10: Key Code Walkthrough and Reproducibility (8:35 to 9:30)
- Visual: terminal commands plus passing test output.
- Explain: deterministic behavior (seeded flow), saved run artifacts, and backend tests that guard contracts/drift/determinism.
- Explain key code parts quickly with business linkage:
	- pipeline orchestrator: why iterations are ordered and cumulative.
	- rules and scoring: why confidence/lift/conviction affect decision trust.
	- drift and thresholds: why automation adapts instead of using static settings.
- Rubric link: Code Quality and Reproducibility.

11. Scene 11: Limitations and Next Steps (9:30 to 10:00)
- Visual: Insights summary area and closing dashboard revisit.
- Explain: current limitations (synthetic drift, no inventory optimization, no time-aware seasonality) and concrete next enhancements.
- Rubric link: Documentation Quality and Critical Thinking.

## Desktop Shot List

- Dashboard: value proposition and KPI cards
- Transactions: diagnostics and upload validation feedback
- Pipeline: architecture diagram, ordered dataset source list, iteration metrics, drift/stability
- Bundles: top bundle cards and business action interpretation
- Rules: ranked rules and full metric columns
- Promos: tiered promo cards and applicability logic
- Insights: overlap/divergence interpretation and recommendation direction
- Shop: product controls and recommendation panels
- Cart: quantity controls, stacked promo breakdown, and total savings

## Narration Checklist

- Explain why FP-Growth fits dense baskets better than Apriori.
- Explain adaptive thresholds and drift detection as automation enablers.
- Give one practical business action per output page.
- Contrast Dataset A baseline behavior with broader cumulative behavior after Dataset B/uploads in pipeline.
- Explicitly say "This demo includes Dataset A and Dataset B" during Scene 2 or Scene 3.
- Explicitly show "3+" iteration evidence (v1-v3 minimum, plus optional v4 with Dataset C upload).
- Translate every technical metric to owner/cashier decisions (what to stock, promote, bundle, and recommend at checkout).
- Explain reproducibility proof points: deterministic tests, run history JSONs, and clear rerun commands.

## Quick Code-to-Logic Talking Points (Use During Scene 3 and Scene 10)

- Orchestration flow: dataset ingestion, normalization, mining, rule generation, scoring, persistence, recommendation serving.
- Mining choice: FP-Growth for dense baskets to reduce candidate explosion versus Apriori.
- Rule quality stack: support + confidence + lift + leverage + conviction used together to avoid shallow recommendations.
- Self-learning behavior: each iteration extends learning context, drift is measured, then thresholds adapt for the next cycle.
- Business utility: output artifacts become decisions for shelf bundles, checkout nudges, promo eligibility, and homepage ranking.

## Demo Commands (Optional On-Camera)

1. Backend tests
```bash
cd backend
pytest -q
```

2. Run backend API
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. Run frontend
```bash
cd frontend
npm run dev
```

## Do and Do Not

Do:
- Use desktop visuals only.
- Keep transitions short and purposeful.
- Tie each scene to a rubric category and business decision.
- Convert technical metrics into plain-language action.

Do not:
- Mix mobile screenshots into the recording.
- Spend time on visual polish without analytical explanation.
- Show raw numbers without interpretation.
