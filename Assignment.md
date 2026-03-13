THE MORE CREATIVE, THE BETTER
THE MORE INTELLIGENT THE PROGRAM IS, THE BETTER

image-2.png

 
1) What You Will Build

You will create a Market-Basket Analysis “Machine Learning” Program that learns from transactions and generates business-ready recommendations (bundles, cross-sell, homepage ranking, promo suggestions, etc.).

This is not just “run Apriori once.” Your system must behave like an evolving backend:

    It ingests transactions

    It mines patterns

    It evaluates and selects the best patterns

    It updates itself automatically when new transactions come in

    It outputs recommendations that change over time

You may ask AI for help, but you must be able to explain and justify your implementation.
2) Business Context (Choose One)

Pick ONE business scenario and design the system like it will be used in real life.

Examples (you may choose others if realistic):

    E-commerce recommender backend (what users see first on the homepage, “frequently bought together,” cart suggestions)

    Food stall / kiosk combo recommender

    Drugstore add-on recommender (vitamins + meds, hygiene bundles)

    Grocery bundling & shelf placement

    School supplies bundles

    Church souvenir shop bundles
    Or anything of your choosing

Your documentation + video must explain:
✅ Who uses it? (owner, cashier, admin, customer)
✅ What decisions it improves?
✅ What business value it creates?
3) MBA Engine (Not Limited to Apriori)

You may use any frequent pattern mining approach, including:

    Apriori

    FP-Growth

    ECLAT

    Hybrid approach (ex: Apriori for small subsets, FP-Growth for dense baskets)

Requirement:
You must include a section explaining:

    How your chosen method differs from Apriori

    Why it is the best fit for your dataset/business (speed, memory, basket density, scalability)

4) Machine Learning Requirement: “Self-Learning” Must Be Real

Your system must demonstrate automated learning behavior beyond “manual minsup/minconf input.”

Your program must show at least 3 iterations:

    Iteration 1: learn from initial data

    Iteration 2: data updates → system updates outputs

    Iteration 3: data updates again → system updates outputs again

Your system must include at least ONE intelligent mechanism of your choice. Examples (choose/innovate freely):

    Auto-threshold logic (system chooses minsup/minconf based on quality targets, number of rules, or stability)

    Rule stability test (best rule still appears after threshold changes)

    Drift/change detection (pattern support shifts → system adapts)

    Rule scoring model (custom scoring beyond one metric, e.g., weighted score of lift+confidence+support)

    Recommendation evaluation loop (test recommendations on a holdout set or simulate acceptance rate)

    Caching/Versioning (keep best models/rules per iteration; compare versions)
    OR IF YOU HAVE A BETTER IDEA, THEN GO FOR IT :)

You are encouraged to invent your own self-learning strategy (this is where critical thinking is graded).
5) Data Requirement (Two Datasets, 1,000+ each)

You must test on at least TWO (but not limited to) different transaction databases/datasets:

    Dataset A: ≥ 1,000 transactions

    Dataset B: ≥ 1,000 transactions

Minimum requirements for each:

    ≥ 15 unique items

    baskets must vary in size

    must simulate real-world transaction data

Allowed sources:

    Open datasets

    Generated synthetic data (must justify realism)

    Your own collected/encoded data

Your video must show your system working on these transaction databases/datsasets.
6) Outputs (Must Look Like a Real System)

Your system must output these (more is better):

    Top bundles (frequent itemsets) with explanation

    Top association rules with full measures:

        support, confidence, lift, leverage, conviction

    Homepage ranking logic (e-commerce style): “what users see first”

    “Frequently bought together” widget simulation

    Cross-sell suggestions when an item is added to cart

    Promo recommendation generator (bundle discounts, buy-2-get-1, etc.)

    Business insights (e.g., shelf placement suggestion)
    OR ANY RECOMMENDATION OF YOUR CHOOSING.

Your program must not only compute metrics; it must use them to decide.
7) Pipeline Architecture Diagram (Required)

Create a pipeline diagram showing:

    Data Source → Cleaning → Encoding → Mining Engine → Rules → Scoring → Storage → Recommendations

    The self-learning iteration loop

    Where logs/metrics/versions are stored

Tools allowed: draw.io, Lucidchart, PowerPoint, Canva, Figma, etc.
8) Deliverables (Submit ALL)
A) Code (Required)

    Python is required as the base language

    You may integrate SQL, Flask/FastAPI, Streamlit, React, etc.

    Must run end-to-end

    Include requirements.txt or environment.yml

    Include README with setup + how to run

B) Documentation (Required — 5 pages PDF)

Must include:

    Business context + system goal

    Dataset A & B description

    Pipeline architecture diagram

    Mining algorithm choice & comparison to Apriori

    Self-learning strategy (what triggers updates? what changes over time?)

    Results (top bundles/rules/recommendations) for both datasets

    Evaluation (rule stability, hit-rate, scoring, etc.)

    Limitations + future improvements

    AI Assistance Disclosure

C) Video Recording (Required)

Must show:

    Demo on Dataset A and Dataset B

    3+ self-learning iterations

    Explain key code parts and system logic

    Explain usefulness and business decision support value

    Creativity is required (branding, storyline, UI demo, roleplay, dashboard, etc.)

D) Slides (Optional)

If you used PPT, submit it.
9) Submission Format

Submit ONE ZIP file:

Filename: SECTION_GROUPNAME_MBA_ML_PROGRAM.zip

Inside ZIP:

    /code/

    /docs/ (5-page PDF)

    /data/ (or dataset links inside README)

    /video/ (mp4 or shareable link text file)

    /slides/ (optional)

10) Rubrics (200 Points)
1) Business Context & Problem Framing — 15 pts

    Clear purpose, users, and decisions improved

2) Data Handling & Transaction Quality — 20 pts

    Correct format, validation, cleaning, dataset statistics, edge cases handled

3) Pipeline Architecture Diagram & Loop Clarity — 15 pts

    Clean readable pipeline, shows iteration/self-learning clearly

4) MBA Engine Correctness & Depth — 35 pts

    Correct itemsets/rules

    Correct computation of support/confidence/lift/leverage/conviction

    Strong outputs beyond simple printing

5) Self-Learning & Automation (Core) — 40 pts

    3+ iterations shown

    Updates are automated and meaningful

    Includes an intelligent mechanism (scoring, drift, stability, evaluation, tuning, etc.)

    Shows improvement or adaptation over time

6) Evaluation & Insights (Dataset A vs B) — 25 pts

    Both datasets used properly

    Good comparison and reasoning

    Explains why patterns differ per dataset/business

7) Code Quality & Reproducibility — 20 pts

    Organized code, functions/modules, comments, error handling

    Runs with clear README

    Dependencies included

8) Documentation Quality (5 pages) — 15 pts

    Complete sections, diagram, results, evaluation, limitations, disclosure

9) Video Presentation & Creativity — 15 pts

    Clear, engaging, creative delivery

    Demonstrates working system + learning loop + business usefulness

TOTAL: 200 pts
11) Creativity, Milestones, and Possible Bonus Points

This project is designed to reward original thinking and creative engineering.

    The more creative and well-executed your system is (idea, design, implementation, presentation), the higher your chances of earning Milestones.

    Milestone teams may be considered for possible bonus points that can contribute to Long Tests and/or Major Exams (subject to class policy and final instructor decision).

    Creativity is not just “aesthetic.” It includes:

        A unique business concept and realistic features

        Innovative self-learning behavior

        A useful recommendation experience (e.g., homepage ranking, cart suggestions, promo generator)

        A clean pipeline architecture and thoughtful evaluation

        An engaging, well-produced video presentation (storytelling, demo flow, roleplay, branding, dashboard, etc.)

Reminder: Creativity must still be backed by correct MBA logic and clear explanation.