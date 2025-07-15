import { Stack,StackProps,Fn,CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnKey,CfnAlias } from 'aws-cdk-lib/aws-kms';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';

export class KmsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // KMSキーを作成
        //kmsではcloudformationのタグはつかない仕様
        const kmsKey = new CfnKey(this, 'KmsKey', {
            description: 'Customer managed key for FTP secret encrypting data',
            enabled: true,
            enableKeyRotation: true,
            keyUsage: 'ENCRYPT_DECRYPT',
            tags:[
                {
                    key: 'Name',
                    value: 'kms-ftp-secret-key'
                },
                {
                    key: 'Env',
                    value: 'dev'
                }
            ],
            keyPolicy: {
                Version: '2012-10-17',
                Statement: [
                    // {
                    //     Effect: 'Allow',
                    //     Principal: {
                    //         AWS: //iamRoleArn lamda Transferfamily用IAMロールを指定
                    //     },
                    //     Action: [ 
                    //         'kms:Decrypt',//複合
                    //         'kms:GenerateDataKey',//暗号化
                    //     ],
                    //     Resource: `*`//自分自身に対する制御なのでワイルドカードを使用
                    // },
                    //ルートアカウントに対する完全なアクセス権を付与（必須）
                    {
                        Effect: 'Allow',
                        Principal: {
                            AWS: `arn:aws:iam::${this.account}:root`
                        },
                        Action: 'kms:*',
                        Resource: '*'
                    }
                ]
            }
        });

        new CfnAlias(this, 'KmsKeyAlias', {
            aliasName: 'alias/ftp-secret-encrypt',
            targetKeyId: kmsKey.ref
        });

        const secret_name = 'TransferAuthSecret'; // シークレット名を指定

        //secretsmanagerにFTPの認証情報を保存
        const secret = new CfnSecret(this, secret_name, {
            name: secret_name,
            description: "This secret is used for transferring authentication",
            kmsKeyId: kmsKey.ref, // KMSキーを指定
            //手動で作成の為、secretの中身は作成しない。
            tags: [
                {
                    key: "Name",
                    value: "TransferAuthSecret"
                }
            ]
        });

        //依存関係を設定
        secret.addDependency(kmsKey);

        new CfnOutput(this, 'TransferAuthSecretArnOutput', {
            value: secret_name,  // シークレットの名前を出力
            description: 'Secrets Manager ARN for Transfer authentication',
            exportName: secret_name // 他のスタックでインポート可能な名前を指定
        });
    }
}