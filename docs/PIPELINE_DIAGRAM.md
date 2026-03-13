# Pipeline Architecture Diagram

```mermaid
flowchart LR
  A[Data Source\nDataset A B Uploads] --> B[Cleaning and Validation\nNormalize Items Remove Noise]
  B --> C[Transaction Encoding\nBasket Construction]
  C --> D[Mining Engine\nFP-Growth]
  D --> E[Rule Generation\nSupport Confidence Lift Leverage Conviction]
  E --> F[Rule Scoring\nComposite Score]
  F --> G[Storage and Versioning\nPipeline Run JSON]
  G --> H[Recommendation Services\nBundles Rules FBT Cross-Sell Promos Ranking]

  H --> I[Business UI\nDashboard Shop Cart Insights Pipeline]

  G --> J[Self-Learning Loop]
  J --> K[Drift Detection\nJaccard Stability]
  K --> L[Adaptive Thresholding\nminsup minconf]
  L --> D
```

## Loop Notes

1. Iteration 1 learns from baseline transactions.
2. Iteration 2 learns from cumulative datasets.
3. Iteration 3 applies drift simulation and adapts thresholds.
4. Stability verdict reports whether top rules survive across iterations.
