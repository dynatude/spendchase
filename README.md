# SpendChase
Scan, analyze receipts and manage spending

## Deploying Infrastructure

create IAM policy named SpendChaseCDKPolicy and paste the contents of [this file](https://github.com/dynatude/spendchase/spendchase-cdk-policy.json) in the JSON view of the policy. It contains properly constrained permissions needed to deploy and modify only the resource needed for this project. 

Set up AWS CLI profile with name `cdk-admin` and attach the above policy. Then run the following to bootstrap the CDK environment.

```
cd cdk

cdk bootstrap --qualifier spendchase --toolkit-stack-name SpendChaseStack --profile cdk-admin
```

You should get output like

     ✅  Environment aws://ACCOUNT_ID/us-east-1 bootstrapped.


Confirm no syntax and type errors exist in the cdk templates.

```
npm run build
```

Finally, deploy the environment.

```
cdk deploy --qualifier spendchase --profile cdk-admin
```

## Tearing Down
    CDK commands should be run from the `cdk` directory

After experimenting, you can remove the deployment

```
cdk destroy --all --qualifier spendchase --profile cdk-admin
```

or to to completely erase everything including the bootstrap stack in which case you will need to bootstrap again if you would like to redeploy.

```
cdk destroy --all --qualifier spendchase --profile cdk-user
```

This will fail as the cdk role `cdk-spendchase-cfn-exec-role-...` tries to delete itself. Follow [this procedure]() and delete the stack from AWS console.

It seems the `cdk-spendchase-assets-<account_id>-<region>` bucket (that is used by CDK itself) remains and needs to be removed manually. Redeploying will fail unless the bucket and the manually created cdk role have been removed.

