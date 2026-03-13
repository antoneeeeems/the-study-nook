# MBA Demo Storyboard (Desktop-Only)

## Scope

- Format: Desktop recording only
- Resolution target: 1440x900
- Audience: instructor and rubric evaluators
- Runtime target: 8 to 10 minutes
- Story style: owner dashboard plus cashier checkout simulation
- Version note: reflects latest flow where non-pipeline pages use Dataset A by default, while pipeline iterations auto-include datasets in chronological order (A, B, then uploads)

## Recording Setup

1. Start backend API on port 8000 and frontend on port 3000.
2. Set browser zoom to 100% and keep one desktop window in focus.
3. Record desktop viewport only (no mobile captures).
4. Show terminal only for reproducibility and test proof.
5. Keep route transitions quick and intentional; narrate why each screen matters.

## Scene Flow (With Explanation Prompts)

1. Scene 1: Problem Framing (0:00 to 0:45)
- Visual: Dashboard hero plus KPI cards.
- Explain: who uses the system (owner and cashier), what decisions improve (bundles, promos, checkout suggestions), and why this is a real business problem.
- Rubric link: Business Context and Problem Framing.

2. Scene 2: Data Inputs and Quality (0:45 to 1:40)
- Visual: Transactions page diagnostics and upload area.
- Explain: transaction count, raw vs normalized unique items, and unmapped terms as a data quality safeguard.
- Rubric link: Data Handling and Transaction Quality.

3. Scene 3: Pipeline Architecture (1:40 to 2:35)
- Visual: Pipeline architecture section and iteration source metadata.
- Explain: ingestion -> cleaning -> mining -> rules -> scoring -> storage -> recommendation services.
- New behavior to call out: pipeline now resolves dataset sources automatically in chronological order and persists dataset source lists per run.
- Rubric link: Pipeline Architecture Diagram and Loop Clarity.

4. Scene 4: Iteration v1 Baseline (2:35 to 3:20)
- Visual: Pipeline iteration table/charts for first run.
- Explain: v1 starts from baseline behavior (Dataset A) and establishes initial top rules and thresholds.
- Rubric link: Self-Learning and Automation.

5. Scene 5: Iteration v2 Cumulative Learning (3:20 to 4:10)
- Visual: Metric changes between v1 and v2.
- Explain: adding later datasets changes support distributions, rule counts, and rule quality signals.
- Emphasize: this is cumulative learning, not a disconnected rerun.
- Rubric link: Self-Learning and Evaluation.

6. Scene 6: Iteration v3 Drift Simulation (4:10 to 5:10)
- Visual: Drift and stability section.
- Explain: Jaccard-based drift signal, adaptive threshold response, and final stability verdict from top-rule survival.
- Rubric link: Self-Learning Core Requirement and Intelligent Mechanism.

7. Scene 7: Outputs for Real Decisions (5:10 to 7:00)
- Visual sequence: Bundles -> Rules -> Promos -> Insights.
- Explain each metric in decision language:
	- Support: how often a pattern appears.
	- Confidence: conditional likelihood of consequent purchase.
	- Lift: strength beyond random co-occurrence.
	- Leverage and conviction: additional reliability context.
- New behavior to call out: cross-dataset comparison entry points are consolidated under Insights and Pipeline.
- Rubric link: MBA Engine Correctness and Business Insights.

8. Scene 8: Store Simulation (7:00 to 8:15)
- Visual: Shop page and Cart page.
- Explain: product discovery, recommendation prompts, quantity controls, and backend-calculated promo stacking breakdown.
- New behavior to call out: cart promotions are computed server-side with deterministic non-overlapping unit usage.
- Rubric link: Real System Behavior and Creativity.

9. Scene 9: Reproducibility and Testing (8:15 to 9:05)
- Visual: terminal commands plus passing test output.
- Explain: deterministic behavior (seeded flow), saved run artifacts, and backend tests that guard contracts/drift/determinism.
- Rubric link: Code Quality and Reproducibility.

10. Scene 10: Limitations and Next Steps (9:05 to 9:45)
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
- Explain reproducibility proof points: deterministic tests, run history JSONs, and clear rerun commands.

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
