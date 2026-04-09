---
slug: early-warning-loan-delinquency
title: "Early Warning Systems for Loan Delinquency: From Static Rules to Production ML"
date: 2026-04-08
readMin: 28
tags:
  - Machine Learning
  - Risk
  - Data Science
excerpt: Rules, sequences, and ML for loan early warning, plus a hands-on Weights & Biases path from logging data to watching drift in production.
---

**Keywords:** early warning systems, loan delinquency prediction, credit risk monitoring

*Who this is for:* You’re fine with supervised classification, ROC-AUC and PR-AUC, feature work on tabular and time-series data, and basic experiment tracking plus batch scoring. We’re not re-teaching the textbook. We’re talking about where this stuff actually stings in credit EWS.

## Introduction: Why early warning systems for loan delinquency matter

Most portfolios don’t blow up overnight. You usually see the cracks forming earlier: payments slip, balances creep, engagement drops. That’s what an **early warning system (EWS)** is for: turning those weak signals into something ops can act on (tighter limits, collections, hardship programs, trimming exposure) while staying inside what your model-risk and credit-monitoring frameworks allow. Here’s why that matters for real money: under regulatory and capital pressure, **thirty extra days of lead time** versus ninety can move loss given default, provisioning, and whether remediation even arrives in time.

If you’ve shipped risk models in production, you know the squeeze. You want **lead time**. You also can’t drown the business in **false positives** or your review teams burn out, customers get angry, and nobody trusts the alerts anymore. The world doesn’t stand still either: products change, macro shifts, borrower mixes drift. So we walk from **static rules** and **sequences** through **supervised and unsupervised ML**, then land on something you can run: **experiment tracking**, **orchestration**, and **monitoring**—so this isn’t a notebook you emailed six months ago and forgot.

---

## Common techniques for early delinquency detection

### Rules-based systems

Most shops still start with **static rules**: plain if/then logic on current or lightly rolled-up account state. The usual suspects are **missed payment thresholds** (flag after one or two consecutive misses per policy), **utilization spikes** vs the borrower’s own history or the limit, **sudden drops in average payment** vs a trailing baseline, and **velocity rules** on draws or balance growth on revolvers.

They’re auditor-friendly, quick to wire into servicing, and you don’t need a GPU.

But here’s the catch. Rules often fire **late**. By the time a hard threshold trips, the borrower may already be in deep water. They’re also weak on **combinatorial** risk: the same utilization can mean different things by segment, product, or season. Macro shocks and new channels don’t write their own rules; someone has to. And **slow-burn** stress—the kind that never crosses one bright line in a single month—either turns into a mess of fragile thresholds or endless manual tuning.

### Temporal and sequence modeling

Delinquency isn’t one row in a spreadsheet. It’s a **story over time**. Gaps stack. Shocks play out across pay cycles. Seasonal bills run into due dates. Flatten everything to a single snapshot and you lose the gap between a one-off blip and something that’s settling in. In practice you care about **cadence** (payments vs due dates), **persistence** (does the shortfall repeat?), and **momentum** (are balances and minimums drifting apart?).

**Sequence models** (RNN/LSTM/GRU, **TCNs**, **attention** over events) are how you read that ordered history: payments, draws, fees, logins, outreach. They’re built for **slow buildup**: someone can slide toward trouble without ever tripping a static rule until it’s almost too late, while the model can stack weak evidence across months. The real pain is engineering: **variable lengths**, **censoring** when accounts vanish or reporting stops, and being ruthless about **label leakage** at each time step. Mess that up and the model crushes it offline and dies in prod.

---

## Machine learning approaches for early warning systems

### Supervised learning

Textbook setup: at observation time \(t\), predict a **binary or graded outcome** over a forward window (“30+ DPD in the next six months,” “stage-2 delinquency,” whatever your policy says). Labels come from **historical performance** (account-month or account-week rows tied to how the loan actually behaved). Features lean on **payment and transaction history**: recency, rolling shortfalls, payment-to-due trends, utilization, fees, product quirks like redraws or prepayments.

You’ll still log precision, recall, ROC-AUC, PR-AUC, calibration. The part that always bites teams is **class imbalance**: stress is rare, so “accuracy” lies. People reach for **stratified sampling**, **class weights**, **calibrated** scores (reliability plots, Platt or isotonic when policy needs interpretable probabilities), and metrics that match how ops actually works: **capture at fixed review capacity**, cost-weighted errors, that kind of thing. One thing people always forget: **label delay**. On long horizons, recent cohorts don’t have outcomes yet. If you don’t use **survival-style** targets, landmarking, or tight cohort filters, you end up training on “we don’t know yet” as if it were a clean negative.

### Unsupervised and semi-supervised learning

Sometimes the signal you need **isn’t in your default labels**. **Unsupervised** methods hunt **emerging patterns** without needing a delinquency tag first. That helps when labels are thin or slow, or when you want to see **drift** before it shows up in losses. **Clustering** on behavioral features, or **representation learning** (autoencoders, contrastive sequence stuff, predict-the-next-event), can surface trajectories that look wrong even when they haven’t defaulted inside your training window.

**Semi-supervised** is the usual move: a smaller labeled set, tons of unlabeled history—**pretrain** on reconstruction or next-event prediction, then **fine-tune** on delinquency. That’s how you catch **signals that don’t look like historical defaults** (new channels, merchant mix, app behavior) so **monitoring** can flag **population shifts** before they wreck your supervised model.

---

## Tutorial: Implementing early warning systems with Weights & Biases

What follows is **Steps 1–5** right after the concepts so you can read theory and implementation in one pass. Dropping this into slides or an appendix? There’s a **packaging note** at the **end**.

### Data: production-like public options (none required)

Nobody’s going to hand you a mandated public dataset. Pick what fits your **license**, **region**, and **schema**. The snippets assume **Python** and **borrower–period** rows (say monthly): ids, as-of dates, balances, performance flags—the **shape** of a warehouse pull, without marrying one vendor.

A few **reasonable public-style** sources (re-read license and field definitions every time):

- **Fannie Mae** [Single-Family Loan Performance Data](https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/fannie-mae-single-family-loan-performance-data) — longitudinal mortgage performance; a common sandbox for EWS-style work. (If this moves again, search Fannie Mae’s site for “Single-Family Loan Performance Data.”)
- **Freddie Mac** [Single-Family Loan-Level Dataset](http://www.freddiemac.com/research/datasets/sf-loanlevel-dataset) — same ballpark; nice for a sanity check across agencies.
- **Consumer / term-loan** dumps people use in courses and comps (older **Lending Club**-style sets on [Kaggle](https://www.kaggle.com/)) — fine for **tabular** prototypes; terms and availability change, so don’t treat them as gospel.
- **HMDA** helps on **fairness** and geography when **joined** to loan-level keys; alone it’s usually too coarse for account-level sequences.

Point the code at your real extract instead of `loan_snapshots.parquet`; the W&B steps don’t change.

### Step 1: Data logging with Weights & Biases Tables

Log what you’ll actually model: **borrower-level** repayment and behavior (ids, as-of, scheduled vs paid, DPD, balance, limit or original amount, product). For sequences, pack **time-series fields** as arrays or nested structures per row, and line up **labels** to a clear forward window from each as-of.

W&B **Tables** buy you versioned snapshots, metadata (source, snapshot date, schema version), and a chance to catch **leakage** and gaps before you waste GPU. Planning semi-supervised or monitoring later? Log **unlabeled** periods with explicit nulls so downstream steps don’t guess.

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

Train what matches the problem: **logit** or **boosted trees (XGBoost, LightGBM, …)** on tabular features, or a **sequence model** if you’re feeding padded tensors from payment history. Each run, log **hyperparameters**, **seed**, and metrics that tie to decisions: recall at a fixed precision (or the other way around), ROC-AUC, PR-AUC, and if you can define it, **early-warning lead time** (how early you’d have flagged before serious delinquency).

Try **different feature sets** (rules-only vs engineered vs sequence embeddings) and **different history windows** (30 vs 60 vs 90 days). W&B’s run comparison is where you see if you’re buying real lead time or just buying noise.

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

A score only matters after you **threshold** or **rank** under real capacity. Compare models and cut points on a **time-ordered holdout**. Don’t shuffle months like i.i.d. candy. You’re trading early catch vs **false positives** that eat ops and annoy customers. Log **calibration** (reliability curves), **Brier** if you care about probability quality, and **slices** (product, geo, vintage) so one global cutoff doesn’t hide a pocket that’s quietly dying.

Translate confusion-style metrics at a few thresholds into **how many reviews per week** and you’re speaking the business’s language, not just the leaderboard.

### Step 4: Workflow orchestration with Weave

Nightly scoring isn’t magic. It’s **ingestion**, **features**, **model**, **writes**, **checks**. **Weave** (W&B’s workflow side) or whatever you’re already on (**Airflow**, **Dagster**, **Prefect**, **Argo**, even **cron**) should implement the same **stages** and **log to W&B** so when someone asks what scored the book on Tuesday, you’ve got an answer.

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

What you want here is boring in the best way: **repeatable** scoring, with enough context logged that model risk and audit can say what ran, which **model version**, on which **data snapshot**.

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

Point your scheduler at `run_ews_batch`. Weave’s sweet spot is that graph with **typed ops**, **cached intermediates**, and **lineage** into W&B. Other stacks get there with explicit tasks and the same `wandb.init` / `wandb.log` hooks.

### Step 5: Deployment monitoring and drift detection

After go-live, log **scores** next to **what actually happened** as labels mature. Watch **population stability** on features and score distributions. Big moves usually mean **drift** or a product change you didn’t model. When drift stats or **ranking quality** on labeled windows crosses your line, wire that to **retrain** and **re-eval** playbooks people will actually run.

That loop (**scores → outcomes → drift → retrain**) is what keeps the system honest after launch.

---

## Conclusion

<div class="key-takeaway" role="note"><strong>Key takeaway:</strong> Durable early warning happens when <strong>interpretable rules</strong>, <strong>sequence-aware modeling</strong>, and <strong>MLOps discipline</strong> (tracking, thresholds, orchestration, monitoring) reinforce each other—not when any single model ships in isolation.</div>

Early warning for delinquency isn’t one trick. **Rules** keep you explainable and cover the edge cases policy cares about. **Sequences** catch stress that builds slowly. **Supervised** learning ranks and calibrates when your labels mean what you think they mean; **unsupervised and semi-supervised** help when labels lie, show up late, or the world moves. Add **experiment tracking** (W&B), real **threshold work**, **orchestrated scoring** (Weave or whatever you run), and **monitoring**, and you’ve got something a team can **own**—tune as products and borrowers shift, without giving up auditability.

<details>
<summary>Author note — packaging the tutorial</summary>

Exporting to **slides**, **tabbed docs**, or an **appendix** that splits story from runbook? You can lift **Steps 1–5** verbatim as a standalone block; they don’t depend on the prose above. If your template wants a “second tab” for the tutorial, paste that chunk as-is.

</details>
