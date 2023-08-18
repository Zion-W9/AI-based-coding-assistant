## AI-Based Coding Assistant

We've developed an AI-powered code generation extension for VScode. This model leverages the capabilities of CodeT5 combined with retrieval enhancement technology. The user interface and interaction are facilitated through [CodeGeex](https://github.com/THUDM/CodeGeeX).

![Demo](https://github.com/Zion-W9/AI-based-coding-assistant/blob/main/20230416_234219.gif)

**Experiments and Results**

**Dataset:** CoNaLa

**Experiment Settings:**
- ![Environment Configuration](https://github.com/Zion-W9/AI-based-coding-assistant/blob/main/Experiment1.jpg)
- ![Model Hyperparameter Settings](https://github.com/Zion-W9/AI-based-coding-assistant/blob/main/Experiment2.jpg)

**Experimental Results and Comparative Analysis:**

For our research, we use the CodeT5 model as the foundational baseline and integrate two retrieval techniques to develop a retrieval generative model. To validate the model's efficacy, we also incorporated other pre-trained models. Here's a brief overview of the models used:

- **CodeT5:** Serving as our baseline, CodeT5 offers various pre-training versions. The smaller version boasts 60M parameters, while the base version has 220M, which is double the size of bert-base. Due to hardware constraints, we opted for the smaller version for our experiments.

- **CodeT5+DPR:** This model synergizes the CodeT5 model with a DPR-based retriever.

Based on these models, our research encompasses the following experiments:

![Results](https://github.com/Zion-W9/AI-based-coding-assistant/blob/main/Results.jpg)

Table 4.3 presents the model's performance on the CoNaLa dataset. "Retrieval data" denotes the dataset portion used for retrieval, while "Positive example" signifies if the retrieved data contains object code information corresponding to the natural language input.

When comparing CodeT5+DPR with CodeT5 on the CoNaLa dataset, there's a 28.88% increase in the BLEU score. This indicates that models enhanced with retrieval technology significantly improve code generation capabilities.

To understand the relationship between the retrieval database and the retrieved training data on code generation, we conducted several comparative experiments on the CodeT5+DPR model using the control variable method. Table 4.4 and Figure 4.1 showcase the results. In Table 4.4, "retrieval data" retains its previous definition, while "Additional search data" denotes the inclusion of the Conala-Mined dataset in the search database.

A comparison between experiments labeled 1 and 2 in Table 4.4 reveals a 7.15% drop in the BLEU score for the latter when processed with weakly correlated additional retrieval data. This suggests that when there's a weak correlation between the retrieval database and the retrieved data, the enhanced data might adversely affect the code generation task.

However, comparing experiments 1 and 7 in Table 4.4, we observe that enhancing the original data with non-positive data retrieval leads to a 0.38% rise in the BLEU score. This implies that even if the retrieved data doesn't match the target code segment, a strong correlation between the training dataset and the retrieval database can still benefit the code generation task.

Evaluating CodeT5+DPR across different k values in Figure 4.1, we deduced that as the correlation data increases, so does the BLEU score. This underscores the importance of a high-quality retrieval database for practical code generation tasks.
