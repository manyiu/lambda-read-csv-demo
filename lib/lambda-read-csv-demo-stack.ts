import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";

export class LambdaReadCsvDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "lambda-read-csv-demo",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    });

    const readFileLambda = new lambda.Function(this, "ReadFileLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      code: lambda.Code.fromAsset(
        path.join(__dirname, "..", "lambdas", "read")
      ),
    });

    const bucketEventSource = new lambdaEventSources.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
    });

    readFileLambda.addEventSource(bucketEventSource);

    bucket.grantRead(readFileLambda);
  }
}
