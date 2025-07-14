import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { CfnVPC, CfnVPCEndpoint } from 'aws-cdk-lib/aws-ec2';
import { Fn } from 'aws-cdk-lib';


export class EndpointStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpcId = Fn.importValue("VpcId");
        const privateSubnetIds = [
            Fn.importValue("PrivateSubnetId1"),
            Fn.importValue("PrivateSubnetId2"),
        ];

        const transferSecurityGroupId = Fn.importValue("TransferSGId");

        // VPCエンドポイントの作成
        const transfer_endopoint = new CfnVPCEndpoint(this, 'TransferEndpoint', {
            vpcId: vpcId, // ここに実際のVPC IDを指定
            serviceName: `com.amazonaws.${this.region}.transfer`,
            vpcEndpointType: 'Interface',
            subnetIds: privateSubnetIds,
            securityGroupIds: [transferSecurityGroupId],
            privateDnsEnabled: true, // FTPサーバーのFQDN解決を有効に
        });

        // 出力
        new cdk.CfnOutput(this, 'TransferEndpointId', {
            value: transfer_endopoint.ref,
            exportName: 'TransferEndpointId',
        });
    }
}
