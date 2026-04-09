---
slug: early-warning-loan-delinquency
title: "Early Warning Systems for Loan Delinquency: From Static Rules to Production ML"
date: 2026-04-08
readMin: 28
tags:
  - Machine Learning
  - Risk
  - Data Science
excerpt: A practitioner’s tour of rules, sequences, and ML for loan early warning—plus a hands-on Weights & Biases path from data logging to monitoring.
---

**Keywords:** early warning systems, loan delinquency prediction, credit risk monitoring

*Who this is for:* You’re already comfortable with supervised classification, ranking metrics like ROC-AUC and PR-AUC, feature work on tabular and time-series data, and the basics of experiment tracking and batch scoring. We won’t re-teach those ideas—we’ll talk about where they actually bite in credit early warning.

## Introduction: Why early warning systems for loan delinquency matter

Most portfolios don’t blow up overnight. Long before a charge-off hits the ledger, you usually see softer shifts: payments slip, balances creep, engagement changes. An **early warning system (EWS)** is how you turn those weak signals into something operations can use—tighter limits, collections outreach, hardship programs, trimming exposure—within the guardrails your model-risk and credit-monitoring frameworks expect. Catching stress early isn’t vanity; under scrutiny from regulators and capital models, **thirty days of extra lead time** versus ninety can change loss given default, provisioning, and whether remediation even lands in time.

If you’ve shipped risk models in production, you already know the uncomfortable middle ground. You want enough **lead time** to act, but you can’t flood the business with **false positives**—review teams burn out, customers get angry, and people stop trusting the alerts. And the world doesn’t stand still: products change, macro moves, borrower mixes shift. So this piece walks from **static rules** and **sequences** through **supervised and unsupervised ML**, then ties it to something you can actually run: **experiment tracking**, **orchestration**, and **monitoring**, so early warning stays a system you maintain—not a one-off notebook you emailed six months ago.

---

## Common techniques for early delinquency detection

### Rules-based systems

**Static rules** are the honest place most institutions start: explicit if/then logic on current or lightly rolled-up account state. Think of the usual suspects:

- **Missed payment thresholds**—flag after one or two consecutive misses, depending on product policy.
- **Utilization spikes** compared with the borrower’s own history or the limit.
- **Payment amounts** that suddenly drop versus a trailing average.
- **Velocity rules** on new draws or balance growth on revolving lines.

They’re easy to explain to an auditor, fast to wire into servicing systems, and they don’t need a GPU.

The catch is what you already suspect. Rules often wake up **late**—once a hard threshold trips, the borrower may already be in real trouble. They’re also brittle when risk is **combinatorial**: the same utilization number can mean something different by segment, product, or season. New channels and macro shocks don’t invent themselves new rules; someone has to write them. And for **slow-burn** stress—the kind that never crosses a single line in one month—rule sets either sprawl into fragile thresholds or demand constant manual tuning.

### Temporal and sequence modeling

Delinquency isn’t a snapshot; it’s a **story over time**. Gaps between payments stack. Income shocks play out across pay cycles. Seasonal bills bump against due dates. If you squash everything into one row per borrower, you throw away the difference between a one-off miss and a pattern that’s settling in. What you often care about is **cadence** (payments relative to due dates), **persistence** (does the shortfall repeat?), and **momentum** (are balances and minimums drifting apart?).

**Sequence models**—RNN/LSTM/GRU stacks, **TCNs**, **attention** over event sequences—exist to read that ordered history: payments, draws, fees, logins, how outreach went. They’re built for **slow buildup**: someone edging toward trouble may never hit a static rule until it’s almost too late, while a sequence model can accumulate small red flags across many periods. The price is real engineering: **variable lengths**, **censoring** when accounts close or reporting stops, and ruthless attention to **label leakage** when you build targets at each time step. Get that wrong and the model looks brilliant offline and collapses in production.

---

## Machine learning approaches for early warning systems

### Supervised learning

The textbook picture: at observation time \(t\), predict a **binary or graded outcome** over a forward window—“30+ DPD sometime in the next six months,” “stage-2 delinquency,” whatever your policy uses. Labels come from **historical performance**: account-month or account-week rows aligned to how the loan actually behaved. Features lean on **payment and transaction history**—recency, rolling shortfalls, payment-to-due trends, utilization, fees, product quirks like redraws or prepayments.

You’ll still report precision, recall, ROC-AUC, PR-AUC, calibration—but **class imbalance** is the story. Stress events are rare; “accuracy” will lie to you. Teams reach for **stratified sampling**, **class weights**, **calibrated probabilities** (reliability plots, Platt or isotonic scaling when policy needs interpretable scores), and metrics that match ops—**capture at fixed review capacity**, cost-weighted errors, that kind of thing. Don’t sleep on **label delay** either: with long horizons, the most recent vintages don’t have outcomes yet. Without **survival-style** setups, landmarking, or careful cohort cuts, you quietly train on “we don’t know yet” as if it were “clean.”

### Unsupervised and semi-supervised learning

Sometimes the important signal **isn’t in your default labels yet**. **Unsupervised** methods look for **emerging patterns** without demanding a delinquency tag—useful when labels are thin, slow, or when you want to see **drift** before it shows up as losses. **Clustering** on behavioral features, or **representation learning** (autoencoders, contrastive sequence models, predict-the-next-event games), can highlight trajectories that look “off” even when they haven’t defaulted inside your training window.

**Semi-supervised** setups pair a smaller labeled set with a lot of unlabeled history: **pretrain** on reconstruction or next-event tasks, then **fine-tune** on delinquency classification. That helps when the future doesn’t look like the past—new channels, merchant mix, how people use your app—so your **monitoring** layer can flag **population shifts** before they poison the supervised model.

---

## Tutorial: Implementing early warning systems with Weights & Biases

What follows is **Steps 1–5** right after the concepts, so you can read the “why” and the “how” in one sitting. If you’re dropping this into slides or an appendix, there’s a short **packaging note** at the **end**.

### Data: production-like public options (none required)

There’s no mandated public dataset—pick what fits your **license**, **region**, and **columns**. The code assumes **Python** and **borrower–period** rows (say monthly): ids, as-of dates, balances, performance flags—the **shape** of a warehouse extract, without locking you to one vendor.

**Reasonable public-style options** (always re-read the license and field docs):

- **Fannie Mae** [Single-Family Loan Performance Data](https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk/single-family-loan-performance-data) — longitudinal mortgage performance; a common sandbox for EWS-style work.
- **Freddie Mac** [Single-Family Loan-Level Dataset](http://www.freddiemac.com/research/datasets/sf-loanlevel-dataset) — similar idea; good for a second opinion across agencies.
- **Consumer / term-loan** archives people use in courses and competitions (e.g. older **Lending Club**-style dumps on [Kaggle](https://www.kaggle.com/))—handy for **tabular** prototypes; availability and terms change, so treat as illustrative.
- **HMDA** can help with **fairness** and geography when **joined** to loan-level keys; on its own it’s usually too aggregate for account-level sequences.

Swap in your real path instead of `loan_snapshots.parquet`; the W&B steps stay the same.

### Step 1: Data logging with Weights & Biases Tables

Log what you’ll actually model: **borrower-level** repayment and behavior—ids, as-of, scheduled vs paid, DPD, balance, limit or original amount, product. For sequences, pack **time-series fields** as arrays or nested structures per row, and align **labels** to a clear forward window from each as-of.

W&B **Tables** give you versioned snapshots, metadata (source, snapshot date, schema version), and a place to catch **leakage** and gaps before you burn GPU hours. If you care about semi-supervised or monitoring later, log **unlabeled** periods with explicit nulls so nothing ambiguous slips through.

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

Train something that matches the problem: **logit** or **boosted trees (XGBoost, LightGBM, …)** on tabular features, or a **sequence model** if you’re feeding padded tensors from payment history. Each run, log **hyperparameters**, **seed**, and metrics that map to decisions—recall at a fixed precision (or the reverse), ROC-AUC, PR-AUC, and if you can define it cleanly, **early-warning lead time** (how early you’d have flagged before serious delinquency).

Try **different feature sets** (rules-only vs engineered vs sequence embeddings) and **different history windows** (30 vs 60 vs 90 days of behavior). W&B’s run comparison is where you see whether you’re buying real lead time or just buying noise.

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

A score only matters once you **threshold** or **rank** under real capacity. Compare models and cut points on a **time-ordered holdout**—never shuffle months like i.i.d. candy. You’re trading off catching people early against **false positives** that chew through ops and annoy customers. Log **calibration** (reliability curves), **Brier** if you care about probability quality, and **slices** (product, geo, vintage) so one global cutoff doesn’t hide a pocket that’s quietly failing.

If you also log confusion-style metrics at a few candidate thresholds and translate them into **how many reviews per week** you’re buying, you’re speaking the business’s language—not just the metric’s.

### Step 4: Workflow orchestration with Weave

Nightly (or weekly) scoring isn’t magic—it’s **ingestion**, **features**, **model**, **writes**, **checks**. **Weave** (W&B’s workflow side) or whatever you already run—**Airflow**, **Dagster**, **Prefect**, **Argo**, even **cron**—should implement the same **stages** and still **log to W&B** so you have lineage when someone asks “what scored this book on Tuesday?”

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

What you want from this is boring in a good way: **repeatable** scoring, with enough logged context that model risk and audit can answer what ran, with which **model version**, on which **data snapshot**.

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

Point your scheduler at `run_ews_batch`. Weave’s sweet spot is expressing that graph with **typed ops**, **cached intermediates**, and **lineage** wired into W&B; other tools get you there with explicit tasks and the same `wandb.init` / `wandb.log` hooks.

### Step 5: Deployment monitoring and drift detection

After go-live, keep logging **scores** next to **what actually happened** as labels mature. Watch **population stability** on features and score distributions—big moves often mean **drift** or a product change you forgot to model. Alert when drift stats or **ranking quality** on labeled windows crosses the line, and hook those alerts to **retrain** and **re-eval** playbooks people will actually run.

That closed loop—**scores → outcomes → drift → retrain**—is what keeps the system honest after launch.

---

## Conclusion

<div class="key-takeaway" role="note"><strong>Key takeaway:</strong> Durable early warning happens when <strong>interpretable rules</strong>, <strong>sequence-aware modeling</strong>, and <strong>MLOps discipline</strong> (tracking, thresholds, orchestration, monitoring) reinforce each other—not when any single model ships in isolation.</div>

Early warning for delinquency isn’t one trick. **Rules** keep you explainable and cover edge cases policy cares about. **Sequences** catch stress that builds slowly. **Supervised** learning ranks and calibrates when your labels mean what you think they mean; **unsupervised and semi-supervised** stuff helps when labels lie, arrive late, or the world moves. Stack that with **experiment tracking** (W&B), honest **threshold work**, **orchestrated scoring** (Weave or whatever you run), and **monitoring**, and you’ve turned a notebook into something a team can **own**—tune as products and borrowers change, without giving up auditability.

<details>
<summary>Author note — packaging the tutorial</summary>

If you’re exporting to **slides**, **tabbed docs**, or an **appendix** that splits “story” from “runbook,” you can lift **Steps 1–5** verbatim into a standalone implementation section—the steps don’t depend on the prose around them. Templates that ask for a “second tab” for the tutorial can paste that block as-is.

</details>
