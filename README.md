# SpendChase
Scan, analyze receipts and manage spending

# Setup LLM

The AWS Lambda function that performs the core receipt scanning and data extraction delegates the heavy lifting to a gpt-4.1 backed Azure OpenAI agent.

In fact, trial success of this with Gemini and the accuracy and ease is what gave me the motivation to start this project!

To reproduce,

1. Create an Azure OpenAI service.

        OpenAI's own API can probably work as alternative, if desired. If considering LLM models from other vendors, look for one that is multimodal.

2. Go to **Deployments > Deploy Model > Deploy base model** and deploy gpt-4.1 model.
5. For **Instructions**, copy and paste the text in [system-instructions.txt](https://github.com/dynatude/spendchase/backend/src/functions/upload-handler/system-instructions.txt).
6. In **Model settings**, set Temperature to the lowest value.
6. From the Azure OpenAI service page, find the following values and set the variables at `backend/.env` file

    AZURE_OPENAI_API_KEY=

    AZURE_OPENAI_ENDPOINT=

    AZURE_OPENAI_DEPLOYMENT=

    AZURE_OPENAI_API_VERSION=
    
    AZURE_OPENAI_MODEL_NAME=

# Deploying Infrastructure

Create IAM policy named `SpendChaseCDKPolicy` and paste the contents of [this file](https://github.com/dynatude/spendchase/spendchase-cdk-policy.json) in the JSON view of the policy. It contains properly constrained permissions needed to deploy and modify only the resource needed for this project (and avoids warnings of cdk assuming admin role). 

If your default CLI profile is not admin, set up AWS CLI profile with name `cdk-admin`. Then run the following to bootstrap the CDK environment.

```
cd cdk

cdk bootstrap --qualifier spendchase ----cloudformation-execution-policies arn:aws:iam::ACCOUNT_ID:policy/SpendChaseCDKPolicy --profile cdk-admin
```

You should get output like

     ✅  Environment aws://ACCOUNT_ID/us-east-1 bootstrapped.


Confirm no syntax and type errors exist in the cdk templates.

```
npm run build
```

Finally, deploy the environment. Since the NodejsFunction construct used to deploy Lambda requires Docker, make sure it is available and running on your system.

```
cdk deploy --profile cdk-admin
```

## Tearing Down

After experimenting, you can remove the entire environment via

```
cdk destroy --all --profile cdk-admin
```

or to to completely erase everything including the bootstrap stack in which case you will need to bootstrap again if you would like to redeploy.

```
cdk destroy --all --qualifier spendchase --profile cdk-user
```

It seems the `cdk-spendchase-assets-<account_id>-<region>` bucket (that is used by CDK itself) remains and needs to be removed manually.
