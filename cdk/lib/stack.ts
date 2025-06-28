import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = 'spendchase-files';

    const bucket = new s3.Bucket(this, bucketName, {
      bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const uploaderFunctionName = 'SpendChaseUploadHandler';

    const uploaderFn = new lambda.Function(this, 'SpendChaseUploadHandler', {
      functionName: uploaderFunctionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/upload-handler'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    bucket.grantReadWrite(uploaderFn);

    const httpApi = new apigatewayv2.HttpApi(this, 'SpendChaseApi', {
      apiName: 'SpendChaseApi',
    });

    httpApi.addRoutes({
      path: '/upload',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LambdaIntegration', uploaderFn),
    });

    // Output can be used to further restrict cdk-policy api gateway access that is currently using wildcard
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.url!,
    });
  }
}
