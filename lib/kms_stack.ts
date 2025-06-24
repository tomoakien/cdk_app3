import {Stack, StackProps,CfnOutput,Fn, ResolutionTypeHint} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { CfnKey,CfnAlias } from 'aws-cdk-lib/aws-kms';

export class KmsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // KMSキーを作成
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
            ]
            //kmsではcloudformationのタグはつかない仕様

            // keyPolicy: {
            //     Version: '2012-10-17',
            //     Statement: [
            //         {
            //             Effect: 'Allow',
            //             Principal: {
            //                 AWS: //iamRoleArn lamda Transferfamily用IAMロールを指定
            //             },
            //             Action: [ 
            //                 'kms:Decrypt',//複合
            //                 'kms:GenerateDataKey',//暗号化
            //             ],
            //             Resource: `*`//自分自身に対する制御なのでワイルドカードを使用
            //         },
            //         //ルートアカウントに対する完全なアクセス権を付与（必須）
            //         {
            //             Effect: 'Allow',
            //             Principal: {
            //                 AWS: `arn:aws:iam::${this.account}:root`
            //             },
            //             Action: 'kms:*',
            //             Resource: '*'
            //         }
            //     ]
            // }
        });
        // 出力

        new CfnAlias(this, 'KmsKeyAlias', {
            aliasName: 'alias/ftp-secret-encrypt',
            targetKeyId: kmsKey.ref
        });
        // KMSキーのIDとARNを出力
        new CfnOutput(this, 'KmsKeyId', {
            value: kmsKey.ref,
            exportName: 'KmsKeyId',
        });
        new CfnOutput(this, 'KmsKeyArn', {
            value: kmsKey.attrArn,
            exportName: 'KmsKeyArn',
        });
    }
}
