import {Stack, 
    StackProps, 
    aws_lambda as lambda,
    aws_iam as iam,
    CfnOutput,
    Fn,
} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucketName = Fn.importValue('LambdaBucketName'); // S3バケット名をインポート

        // IAM Role（最小限）
        const lambdaRole = new iam.CfnRole(this, 'LambdaExecutionRole', {
            assumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Effect: 'Allow',
                    Principal: { Service: 'lambda.amazonaws.com' },
                    Action: 'sts:AssumeRole',
                }],
            },
            policies: [{
                policyName: 'MinimalSecretAccess',
                policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                    Effect: 'Allow',
                    Action: [
                        'secretsmanager:GetSecretValue',
                        'kms:Decrypt',
                    ],
                    Resource: '*',
                    },
                    {
                    Effect: 'Allow',
                    Action: ['logs:*'],
                    Resource: '*',
                    }
                ],
                }
            }]
        });

        // Lambda関数を作成
        const authlambda = new lambda.CfnFunction(this, 'FtpAuthFunction', {
            functionName: 'FtpAuthFunction', 
            runtime: 'python3.11', // ランタイムの指定
            handler: 'auth_ftp.handler', // ハンドラーの指定
            role: lambdaRole.attrArn, // IAMロールのARNを指定
            code: {
                  //S3にアップしたコードを指定
                    s3Bucket: bucketName,
                    s3Key: 'auth/lambda.zip',
            },
        });

        //SSMへ出力
        new ssm.StringParameter(this, 'AuthLambdaArn', {
            parameterName: '/cdk/lambda/autharn',
            stringValue: authlambda.attrArn,
        });

    }
}