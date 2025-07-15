import {Stack, 
    StackProps, 
    aws_lambda as lambda,
    Fn,
} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucketName = Fn.importValue('LambdaBucketName'); // S3バケット名をインポート
        const lambdaFtpRole = Fn.importValue('LambdaFtpRoleArn'); // IAMロールARNをインポート
        const ftpUserRole = Fn.importValue('FtpUserRoleArn'); // FTPユーザーロールARNをインポート
        const secretName = Fn.importValue('TransferAuthSecret'); // Secrets Managerのシークレット名をインポート


        // Lambda関数を作成
        //　関数名から自動的にロググループ名を決定する。
        const authlambda = new lambda.CfnFunction(this, 'FtpAuthFunction', {
            functionName: 'FtpAuthFunction', 
            runtime: 'python3.13', // ランタイムの指定
            handler: 'index.lambda_handler', // ハンドラーの指定
            role: lambdaFtpRole, // IAMロールのARNを指定
            memorySize: 128, // メモリサイズの指定
            timeout: 60, // タイムアウトの指定
            packageType: 'Zip', // パッケージタイプの指定
            tracingConfig: {
                mode: 'Active', // X-Rayトレースを有効化
            },
            runtimeManagementConfig: {
                updateRuntimeOn: 'Manual', // ランタイムの自動更新を有効化
                runtimeVersionArn: 'arn:aws:lambda:ap-northeast-1::runtime:f10b100a00b6c2fc7052100b08a13d8c6dc4176c7c01a522d2fb9c948bab31f0', // ランタイムのバージョンを指定
            },
            environment: {
                variables: {
                    "TZ": "Asia/Tokyo", // タイムゾーンの設定
                    "ROLE": ftpUserRole, // FTPユーザーロールのARNを指定
                    "SECRET_NAME": secretName, // Secrets Managerのシークレット名を指定
                }
            },
            code: {
                  //S3にアップしたコードを指定
                    s3Bucket: bucketName,
                    s3Key: 'auth/lambda.zip',
            },
            tags: [{
                key: 'Name',
                value: 'FtpAuthFunction'
            }],
            description: 'Lambda function for FTP authentication',
        });

        //SSMへ出力
        new ssm.StringParameter(this, 'AuthLambdaArn', {
            parameterName: '/cdk/lambda/autharn',
            stringValue: authlambda.attrArn,
        });

    }
}