import dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture } from 'aws-cdk-lib/aws-lambda';

dotenv.config({
  path: '../.env'
});

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

    const uploaderFn = new NodejsFunction(this, 'SpendChaseUploadHandler', {
      functionName: uploaderFunctionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: Architecture.X86_64,
      handler: 'index.handler',
      bundling: {
        minify: true,
        sourceMap: true,
        commandHooks: {
          afterBundling(inputDir, outputDir) {
            return [
              `cp ${inputDir}/src/functions/upload-handler/system-instructions.txt ${outputDir}`
            ]
          },
          beforeBundling() { return []; },
          beforeInstall() { return []; }
        }
      },
      entry: '../src/functions/upload-handler/index.ts',
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY!,
        AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION!,
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT!,
        AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT!,
        AZURE_OPENAI_MODEL_NAME: process.env.AZURE_OPENAI_MODEL_NAME!,
      }
    });

    bucket.grantReadWrite(uploaderFn);

    const podcastFunctionName = 'SpendChasePodcastHandler';

    const podcastFn = new NodejsFunction(this, 'SpendChasePodcastHandler', {
      functionName: podcastFunctionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: Architecture.X86_64,
      handler: 'index.handler',
      bundling: {
        minify: true,
        sourceMap: true,
        commandHooks: {
          afterBundling(inputDir, outputDir) {
            return [
              `cp ${inputDir}/src/functions/podcast-handler/system-instructions.txt ${outputDir}`
            ]
          },
          beforeBundling() { return []; },
          beforeInstall() { return []; }
        }
      },
      entry: '../src/functions/podcast-handler/index.ts',
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY!,
        AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION!,
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT!,
        AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT!,
        AZURE_OPENAI_MODEL_NAME: process.env.AZURE_OPENAI_MODEL_NAME!,
        AZURE_OPENAI_WHISPER_DEPLOYMENT: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT!,
      }
    });

    const httpApi = new apigatewayv2.HttpApi(this, 'SpendChaseApi', {
      apiName: 'SpendChaseApi',
    });

    httpApi.addRoutes({
      path: '/upload',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LambdaIntegration', uploaderFn),
    });

    httpApi.addRoutes({
      path: '/podcast',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('PodcastLambdaIntegration', podcastFn),
    });

    // Output can be used to further restrict cdk-policy api gateway access that is currently using wildcard
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.url!,
    });
  }
}
