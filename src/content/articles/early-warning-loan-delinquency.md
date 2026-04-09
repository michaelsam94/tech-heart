---
slug: early-warning-loan-delinquency
title: "Early Warning Systems for Loan Delinquency: From Static Rules to Production ML"
date: 2026-04-08
readMin: 16
tags:
  - Machine Learning
  - Risk
  - Data Science
excerpt: Rules, sequences, and ML for loan early warning, plus a hands-on Weights & Biases path—from logging to drift in production.
---

**Keywords:** early warning systems, loan delinquency prediction, credit risk monitoring

*Who this is for:* Supervised classification, ROC/PR-AUC, tabular and time-series features, basic experiment tracking and batch scoring. This is where credit EWS actually hurts—not the textbook recap.

## Introduction: Why early warning systems for loan delinquency matter

Most portfolios don’t blow up overnight; you see stress earlier—payments slip, balances creep, engagement drops. An **early warning system (EWS)** turns those signals into actions ops can use (limits, collections, hardship programs, exposure cuts) within model-risk and monitoring constraints. **Thirty extra days of lead time** versus ninety moves loss given default, provisioning, and whether remediation lands in time.

You want **lead time**, but **false positives** that flood the queue don’t just waste effort—they **kill trust**. Once collections or underwriting stops believing the rank, the model is dead no matter what offline metrics say. Products, macro, and borrower mix **drift**; silent policy changes to terms or grace windows are a common culprit—and we’ll tie drift to monitoring in Step 5.

We cover **static rules**, **sequences**, **supervised and unsupervised ML**, then **tracking**, **orchestration**, and **monitoring**—so you leave with a path someone can operate, not a one-off notebook.

**Contrarian:** biggest wins in EWS usually come from **labels, horizons, and time alignment**, not swapping XGBoost for a transformer—don’t chase architecture until leakage is under control.

The **concepts** and **W&B tutorial** are separable: skim the narrative, or jump to Steps 1–5 and treat the rest as context for model-risk conversations.

---

## Common techniques for early delinquency detection

### Rules-based systems

Shops still start with **static rules**: if/then on rolled-up state—**missed-payment thresholds**, **utilization spikes** vs history or limit, **payment drops** vs a baseline, **velocity** on draws or balance growth.

Auditor-friendly, fast to wire, no GPU. The cost: rules fire **late**—often after obvious distress—so you get explainability without much **lead time**. They’re weak on **combinatorial** risk (same utilization, different segment/season), macro and new channels need manual rules, and **slow-burn** stress becomes fragile thresholds or endless tuning.

### Temporal and sequence modeling

Delinquency is **over time**—cadence, persistence, momentum—not one snapshot. **Sequence models** (RNN/LSTM/GRU, **TCNs**, **attention**) read ordered events (payments, draws, fees, logins) and can stack weak evidence across months when static rules stay quiet.

In practice, with messy events and leakage risk, **boosted trees on engineered history** often ship faster, explain better to risk, and debug easier—we moved to heavier sequence models only after **tabular + rolling features** stopped improving **lead time**. Engineering still hurts: **variable lengths**, **censoring**, and **leakage** per time step—get that wrong and offline scores crush production.

---

## Machine learning approaches for early warning systems

### Supervised learning

At time \(t\), predict a **binary or graded outcome** over a forward window (e.g. “30+ DPD in six months”). Labels from **historical performance**; features from **payment and transaction history** (recency, rolling shortfalls, utilization, fees, product quirks).

**Class imbalance** is the usual trap: in many retail books, **positives are ~1–5%** per horizon, so **95% accuracy** is mostly predicting “no.” Use **stratified sampling**, **class weights**, **calibration** (Platt/isotonic when you need probabilities), and ops-aligned metrics: **capture at fixed review capacity**, cost-weighted errors. Higher **recall** only helps if **review capacity** can absorb it—otherwise you re-cut thresholds by segment, not because the scores were “wrong.”

**Leakage example:** after a feature refresh, offline PR-AUC jumped **~15–20 points**; within two weeks in monitoring, the lift vanished. We’d folded in **post-delinquency fees and reage events** not known at decision time—plausible enough to pass a quick review because they **tracked stress in time**, not a column labeled “future default.” Retrain, post-mortem, then **every feature gets a “known at \(t\)”** check before training.

**Label delay** on long horizons means recent cohorts lack outcomes—without **survival** targets, landmarking, or tight cohort filters, you train “unknown” as negative.

### Unsupervised and semi-supervised learning

When defaults **aren’t** the signal you need first, **unsupervised** methods (clustering, autoencoders, next-event prediction) surface **drift** and odd trajectories before labels catch up. **Semi-supervised**: pretrain on unlabeled history, **fine-tune** on delinquency—useful when **channels or behavior** shift away from historical defaults. Use these as **signals for monitoring and triage**, not as a replacement for a governed supervised model unless policy explicitly allows it.

---

## Tutorial: Implementing early warning systems with Weights & Biases

**Steps 1–5** below match the concepts above. **Packaging note** at the **end** if you split story from runbook.

### Data: production-like public options (none required)

Pick data that fits **license**, **region**, and **schema**. Snippets assume **Python**, **borrower–period** rows (e.g. monthly): ids, as-of, balances, performance flags.

- **Fannie Mae** [Single-Family Loan Performance Data](https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/fannie-mae-single-family-loan-performance-data) — longitudinal mortgages; search Fannie’s site if the URL moves.
- **Freddie Mac** [Single-Family Loan-Level Dataset](http://www.freddiemac.com/research/datasets/sf-loanlevel-dataset) — cross-check vs Fannie.
- **Kaggle**-style **Lending Club**-era sets — **tabular** prototypes only; terms change.
- **HMDA** — fairness/geography when **joined** to loan keys; too coarse alone for sequences.

Point at your real extract; W&B steps stay the same.

### Step 1: Data logging with Weights & Biases Tables

Log **borrower-level** fields you model (ids, as-of, scheduled vs paid, DPD, balance, limit/original amount, product). Sequences: **time-series** as arrays/nested columns; **labels** aligned to a forward window from each as-of. **Tables** give versioned snapshots and metadata to catch **leakage** before training. Log **unlabeled** spans as nulls if you’ll use them later.

**Practical logging:** logging every exploratory column once made runs unreadable; what actually drove decisions was **feature-set version, horizon, cohort, recall at a fixed weekly review budget**, and a few **slices** (product, channel). Raw Tables still help debug leakage—**more columns ≠ more control** unless those columns are tied to versioned transforms and an explicit data contract.

```python
import wandb
import pandas as pd

wandb.init(project="loan-early-warning", job_type="data-logging")
df = pd.read_parquet("loan_snapshots.parquet")  # borrower-period rows
table = wandb.Table(dataframe=df)
wandb.log({"loan_snapshots": table})
wandb.finish()
```

### Step 2: Model training and experiment tracking

Use **logit** or **boosted trees (XGBoost, LightGBM, …)** on tabular features, or a **sequence model** on padded payment tensors. Log **hyperparameters**, **seed**, **ROC-AUC**, **PR-AUC**, **recall at fixed precision** (or inverse), and **early-warning lead time** if defined. Compare **feature sets** and **history windows** (30/60/90 days) on **time-based** splits—ignore **PR-AUC** bumps that don’t move **days-to-flag**.

```python
import wandb
import numpy as np
from sklearn.metrics import (
    average_precision_score,
    precision_recall_curve,
    roc_auc_score,
)

def recall_at_precision(y_true, y_score, min_precision: float) -> float:
    """Maximum recall achievable subject to precision >= min_precision."""
    prec, rec, _ = precision_recall_curve(y_true, y_score)
    mask = prec >= min_precision
    return float(rec[mask].max()) if np.any(mask) else 0.0

wandb.init(
    project="loan-early-warning",
    config={"model": "xgboost", "horizon_days": 180, "seed": 42},
)
# ... train estimator, obtain y_score on a time-based validation split ...
y_true, y_score = [], []  # replace with val labels and predicted probabilities

wandb.log(
    {
        "roc_auc": roc_auc_score(y_true, y_score),
        "pr_auc": average_precision_score(y_true, y_score),
        "recall_at_precision_0.5": recall_at_precision(y_true, y_score, 0.5),
    }
)
wandb.finish()
```

### Step 3: Experimentation and threshold analysis

**Threshold** or **rank** under real capacity on a **time-ordered holdout**—don’t shuffle months as i.i.d. Trade early catch vs **false positives**; log **calibration**, **Brier** if needed, **slices** (product, geo, vintage). Translate a few cut points into **reviews per week** so risk and ops share one picture—e.g. ~**120** vs ~**340** accounts surfaced at two scores for the same staffing plan.

### Step 4: Workflow orchestration with Weave

Batch scoring is **ingest → features → model → writes → checks**. **Weave** (W&B workflows) or **Airflow / Dagster / Prefect / Argo / cron** should mirror training **stages** and **log to W&B** so “what scored the book Tuesday?” has an answer.

**Pipeline stages (typical batch EWS job):**

1. **Ingest** the latest warehouse or lake snapshot for a fixed `as_of` date.  
2. **Compute features** with the same SQL/Python transforms used in training (pin commit hash or artifact id).  
3. **Load** a **registered** model artifact (versioned in W&B Model Registry or your store).  
4. **Score** accounts and write probabilities to a **feature store** or decisioning table keyed by account and as-of.  
5. **Evaluate** offline on labeled holdout windows when labels exist; compare PR-AUC / recall-at-precision to **baselines**.  
6. **Gate**: if metrics fall below policy thresholds, **open a retraining ticket** or trigger an automated retrain pipeline (with human approval if required).

**Workflow diagram (logical DAG):**

```text
                    ┌─────────────┐
                    │   Ingest    │
                    │  snapshot   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  Features   │◄── same transforms as training
                    └──────┬──────┘
                           ▼
┌──────────┐         ┌─────────────┐         ┌──────────────────┐
│ Registry │────────►│    Score    │────────►│  Write scores    │
│  model   │         │  (batch)    │         │  to store/table  │
└──────────┘         └──────┬──────┘         └──────────────────┘
                            ▼
                     ┌─────────────┐         yes    ┌─────────────┐
                     │   Offline   │────────────────►│  Retrain /  │
                     │ eval / gate │                 │   ticket    │
                     └──────┬──────┘                 └─────────────┘
                            │ no
                            ▼
                     ┌─────────────┐
                     │  wandb.log  │
                     │  (lineage)  │
                     └─────────────┘
```

**Repeatable** scoring: enough context that audit can name **model version** and **data snapshot**.

**Runnable skeleton (fill in I/O; wire `run_ews_batch` to cron, Airflow, Dagster, or Weave):**

```python
# Batch EWS job—executable structure; plug in your data sources and model loader.
from __future__ import annotations

import wandb
import numpy as np
import pandas as pd

def load_warehouse_snapshot(as_of: str) -> pd.DataFrame:
    raise NotImplementedError("load from warehouse / lake for as_of")

def build_features(raw: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError("must match training-time feature code")

def load_registered_model(version: str):
    raise NotImplementedError("W&B Model Registry or pickle path")

def write_scores_to_store(ids: pd.Series, scores: np.ndarray, as_of: str) -> None:
    raise NotImplementedError("merge into risk_score table or feature store")

def backtest_vs_labels(scores: np.ndarray, as_of: str) -> dict:
    raise NotImplementedError('return {"pr_auc": float, ...} on holdout')

def trigger_retraining_pipeline() -> None:
    raise NotImplementedError("enqueue training job or open ticket")

def run_ews_batch(as_of: str, model_version: str, min_pr_auc: float = 0.25) -> None:
    run = wandb.init(
        project="loan-early-warning",
        job_type="batch-score",
        config={"as_of": as_of, "model": model_version},
    )
    raw = load_warehouse_snapshot(as_of)
    feats = build_features(raw)
    model = load_registered_model(model_version)
    scores = model.predict_proba(feats)[:, 1]
    write_scores_to_store(feats["account_id"], scores, as_of)
    offline = backtest_vs_labels(scores, as_of)
    wandb.log({"pr_auc_offline": offline["pr_auc"]})
    if offline["pr_auc"] < min_pr_auc:
        trigger_retraining_pipeline()
    run.finish()

if __name__ == "__main__":
    run_ews_batch(as_of="2024-01-01", model_version="registry/production@v3")
```

Point your scheduler at `run_ews_batch`. **Weave** adds **typed ops**, **cached intermediates**, and **lineage**; other stacks use the same `wandb.init` / `wandb.log` hooks.

### Step 5: Deployment monitoring and drift detection

After go-live, log **scores** next to **realized outcomes** as labels mature. Watch **population stability** on features and score distributions—big moves usually mean **drift**, a product change you didn’t model, or a broken feed. When drift stats or **ranking quality** on labeled windows crosses policy, wire that to **retrain** and **re-eval** steps your team will run (not a PDF no one opens).

**Scores → outcomes → drift → retrain** is the loop that keeps the system honest after launch.

---

## Conclusion

<div class="key-takeaway" role="note"><strong>Key takeaway:</strong> Durable early warning happens when <strong>interpretable rules</strong>, <strong>sequence-aware modeling</strong>, and <strong>MLOps discipline</strong> (tracking, thresholds, orchestration, monitoring) reinforce each other—not when any single model ships in isolation.</div>

**Rules** stay explainable for policy edge cases; **sequences** (or rich rollups) catch stress that builds slowly; **supervised** models rank and calibrate when labels mean what you think; **unsupervised / semi-supervised** help when labels are thin, late, or the population moves. Layer **W&B**, **threshold analysis**, **orchestrated batch scoring**, and **monitoring**, and you get a system a team can **own**—retune as products and borrowers shift without giving up auditability.

<details>
<summary>Author note — packaging the tutorial</summary>

Lift **Steps 1–5** (code + list + DAG) as a standalone block for slides or an appendix; prose above is optional.

</details>
