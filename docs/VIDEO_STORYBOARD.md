# MBA Demo Storyboard (Desktop-Only)

## Scope

- Format: Desktop recording only
- Resolution target: 1440x900
- Audience: instructor and rubric evaluators
- Runtime target: 8 to 10 minutes
- Story style: owner dashboard plus cashier checkout simulation

## Recording Setup

1. Open backend API on port 8000 and frontend on port 3000.
2. Set browser zoom to 100% and keep a single desktop window.
3. Use only desktop screenshots and desktop screen captures for all scenes.
4. Keep terminal visible only when showing reproducibility commands.

## Scene Flow

1. Scene 1: Problem Framing (0:00 to 0:45)
- Visual: Dashboard hero and summary cards.
- Script: Explain business context, users (owner and cashier), and decisions improved.
- Rubric: Business Context and Problem Framing.

2. Scene 2: Data Inputs and Quality (0:45 to 1:40)
- Visual: Transactions page with dataset diagnostics.
- Script: Show transaction volume, unique items, normalization effects, unmapped items.
- Rubric: Data Handling and Transaction Quality.

3. Scene 3: Pipeline Architecture (1:40 to 2:30)
- Visual: Pipeline page architecture section.
- Script: Walk through data source to cleaning to mining to rules to scoring to storage to recommendations.
- Rubric: Pipeline Architecture Diagram and Loop Clarity.

4. Scene 4: Iteration v1 Baseline (2:30 to 3:20)
- Visual: Pipeline iteration table and charts.
- Script: Show v1 outputs from initial dataset and key top rule.
- Rubric: Self-Learning and Automation.

5. Scene 5: Iteration v2 Cumulative Learning (3:20 to 4:10)
- Visual: Pipeline metrics changing from v1 to v2.
- Script: Explain how adding new data updates thresholds, rule counts, and quality.
- Rubric: Self-Learning and Evaluation.

6. Scene 6: Iteration v3 Drift Simulation (4:10 to 5:10)
- Visual: Pipeline drift and stability section.
- Script: Explain drift detection, adaptation message, and stability verdict.
- Rubric: Self-Learning core requirement and intelligent mechanism.

7. Scene 7: Outputs for Real Decisions (5:10 to 7:00)
- Visual sequence: Bundles page, Rules page, Promos page, Insights page.
- Script: Explain support, confidence, lift, leverage, conviction and how each output informs business actions.
- Rubric: MBA Engine Correctness and Business Insights.

8. Scene 8: Store Simulation (7:00 to 8:10)
- Visual: Shop page and Cart page with promo stacking breakdown.
- Script: Demonstrate frequently bought together, cross-sell suggestions, and cart promo application.
- Rubric: Real system behavior and creativity.

9. Scene 9: Reproducibility and Testing (8:10 to 9:00)
- Visual: Terminal commands and passing test output.
- Script: Show deterministic seeded runs, test suite execution, and run history persistence.
- Rubric: Code Quality and Reproducibility.

10. Scene 10: Limitations and Next Steps (9:00 to 9:40)
- Visual: Insights page with summary notes.
- Script: Discuss limitations and planned enhancements.
- Rubric: Documentation quality and critical thinking.

## Desktop Shot List

- Dashboard: value proposition and KPI cards
- Transactions: upload and diagnostics panel
- Pipeline: architecture diagram, iteration list, drift and stability
- Bundles: top bundles with explanation
- Rules: full metrics and ranking
- Promos: tiered promo recommendations
- Insights: cross-dataset reasoning and overlap metrics
- Shop: product discovery and recommendation panel
- Cart: quantity controls and promo stacking breakdown

## Narration Checklist

- Explain why FP-Growth is a better fit than Apriori for dense baskets.
- Explain how adaptive thresholding and drift detection drive automated updates.
- Explain at least one concrete business action per output page.
- Explain differences between Dataset A and Dataset B behavior.
- Explain reproducibility approach (seed, run history, deterministic tests).

## Do and Do Not

Do:
- Use only desktop viewport visuals.
- Keep transitions quick and purposeful.
- Tie every scene to rubric value.

Do not:
- Mix in mobile screenshots or recordings.
- Spend time on UI aesthetics without business explanation.
- Show raw metrics without decision context.
