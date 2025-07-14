import { Stack,StackProps,Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as transfer from 'aws-cdk-lib/aws-transfer';
import { CfnKey,CfnAlias } from 'aws-cdk-lib/aws-kms';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';

export class FtpStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

         // SSMパラメーターストアからLambda関数のARNを取得
        const authlambdaarn = ssm.StringParameter.valueForStringParameter(this, '/cdk/lambda/autharn');
        // VPCとサブネットの情報をインポート
        const vpcId = Fn.importValue("VpcId");
        const privateSubnetIds = [
        Fn.importValue("PrivateSubnetId1"),
        Fn.importValue("PrivateSubnetId2"),
        ];
        const transferSecurityGroupId = Fn.importValue("TransferSGId");
        // const vpcEndpointId = Fn.importValue("TransferEndpointId");

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

        //secretsmanagerにFTPの認証情報を保存
        const secret = new CfnSecret(this, "TransferAuthSecret", {
            name: "TransferAuthSecret",
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

        // Transfer FamilyのFTPサーバーを作成
        const transferServer = new transfer.CfnServer(this, 'TransferServer', {
            identityProviderType: 'AWS_LAMBDA', // 認証方式を指定
            identityProviderDetails: {
                function: authlambdaarn, // Lambda関数のARNを指定                
            },
            domain: 'EFS',
            protocols: ['FTP'], // FTPプロトコルを指定
            endpointType: 'VPC', // エンドポイントのタイプを指定 VPC_ENDTYPEではない
            endpointDetails: {
                vpcId: vpcId, // VPC IDを指定
                subnetIds: privateSubnetIds , // VPCエンドポイントを指定
                securityGroupIds: [transferSecurityGroupId], // サブネットIDを指定
            }
        });

        //依存関係を設定
        transferServer.addDependency(secret);

    }
}