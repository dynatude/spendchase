# SpendChase
Scan, analyze receipts and manage spending

## Deploying Infrastructure

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

Finally, deploy the environment.

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

