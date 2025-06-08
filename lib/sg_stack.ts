import *as ec2 from 'aws-cdk-lib/aws-ec2';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Fn,CfnOutput } from 'aws-cdk-lib';

// vpc_stack.tsで作成したVPCの情報をインポート
const vpcId = Fn.importValue('VpcId');

export class SgStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // ALB用のセキュリティグループを作成
        const albsg = new ec2.CfnSecurityGroup(this, 'AlbSG', {
            vpcId: vpcId,
            groupDescription: 'Security group for ALB',
            tags: [{key: 'Name', value: 'AlbSG'}],
            securityGroupEgress: [],
        });

        //EFS用のセキュリティグループを作成
        const efssg = new ec2.CfnSecurityGroup(this, 'EfsSG', {
            vpcId: vpcId,
            groupDescription: 'Security group for EFS',
            tags: [{key: 'Name', value: 'EfsSG'}],
            securityGroupEgress: [],
        });

        //EC2(app)用のセキュリティグループを作成
        const ec2appsg = new ec2.CfnSecurityGroup(this, 'Ec2AppSG', {
            vpcId: vpcId,
            groupDescription: 'Security group for EC2(app)',
            tags: [{key: 'Name', value: 'Ec2AppSG'}],
            securityGroupEgress: [],
        });

        //EC2(db)用のセキュリティグループを作成
        const ec2dbsg = new ec2.CfnSecurityGroup(this, 'Ec2DbSG', {
            vpcId: vpcId,
            groupDescription: 'Security group for EC2(db)',
            tags: [{key: 'Name', value: 'Ec2DbSG'}],
            securityGroupEgress: [],
        });

        // 出力
        new CfnOutput(this, 'AlbSGId', {
            value: albsg.ref,
            exportName: 'AlbSGId',
        });

        new CfnOutput(this, 'EfsSGId', {
            value: efssg.ref,
            exportName: 'EfsSGId',
        });

        new CfnOutput(this, 'Ec2AppSGId', {
            value: ec2appsg.ref,
            exportName: 'Ec2AppSGId',
        });

        new CfnOutput(this, 'Ec2DbSGId', {
            value: ec2dbsg.ref,
            exportName: 'Ec2DbSGId',
        });
    }
}

//ルールを直書きするか関数化するか検討が必要