import { Stack,StackProps,Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as transfer from 'aws-cdk-lib/aws-transfer';

export class TransferStack extends Stack {
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
                subnetIds: privateSubnetIds , // サブネットIDを指定
                securityGroupIds: [transferSecurityGroupId], // セキュリティグループIDを指定
            }
        });

    }
}