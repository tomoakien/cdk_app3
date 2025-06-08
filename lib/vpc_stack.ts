import{Stack,StackProps, CfnOutput, Fn} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import *as ec2 from 'aws-cdk-lib/aws-ec2';
import {CfnTag} from 'aws-cdk-lib';

export class VpcStack extends Stack{

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // VPCを作成
        const vpc = new ec2.CfnVPC(this, 'Vpc', {
            cidrBlock: '10.0.0.0/16',
            enableDnsSupport: true,
            enableDnsHostnames: true,
            instanceTenancy: 'default',
            tags: [
                {
                    key: 'Name',
                    value: 'Vpc',
                },
            ],
        });


        const vpcId: string = vpc.ref;

        //サブネット関数を作成
        const createSubnet = (
            name: string,
            cidr: string,
            az: string,
            isPublic: boolean,
            tagName: string
        ): ec2.CfnSubnet => {
            return new ec2.CfnSubnet(this, name, {
                vpcId: vpcId,
                cidrBlock: cidr,
                availabilityZone: az,
                mapPublicIpOnLaunch: isPublic,
                tags: [
                    {
                        key: 'Name',
                        value: tagName,
                    },
                ],
            });
        };

        // サブネット作成

        const publicSubnet1 = createSubnet('PublicSubnet1', '10.0.1.0/24', 'ap-northeast-1a', true, 'PublicSubnet1');
        const publicSubnet2 = createSubnet('PublicSubnet2', '10.0.2.0/24', 'ap-northeast-1c', true, 'PublicSubnet2');
        const privateSubnet1 = createSubnet('PrivateSubnet1', '10.0.3.0/24', 'ap-northeast-1a', false, 'PrivateSubnet1');
        const privateSubnet2 = createSubnet('PrivateSubnet2', '10.0.4.0/24', 'ap-northeast-1c', false, 'PrivateSubnet2');


        // ルートテーブル作成
        const rtPublic = new ec2.CfnRouteTable(this, 'PublicRouteTable', {
            vpcId: vpcId,
            tags: [{ key: 'Name', value: 'PublicRouteTable' }],
        });

        const rtPrivate = new ec2.CfnRouteTable(this, 'PrivateRouteTable', {
            vpcId: vpcId,
            tags: [{ key: 'Name', value: 'PrivateRouteTable' }],
        });


         // RouteTableとSubnet関連付け
        const associateRt = (name: string, subnet: ec2.CfnSubnet, rt: ec2.CfnRouteTable) => {
            new ec2.CfnSubnetRouteTableAssociation(this, `${name}Assoc`, {
                subnetId: subnet.ref,
                routeTableId: rt.ref,
            });
        };

        associateRt('PublicSubnet1', publicSubnet1, rtPublic);
        associateRt('PublicSubnet2', publicSubnet2, rtPublic);
        associateRt('PrivateSubnet1', privateSubnet1, rtPrivate);
        associateRt('PrivateSubnet2', privateSubnet2, rtPrivate);

        // IGW作成
        const igw = new ec2.CfnInternetGateway(this, 'IGW', {
            tags: [{ key: 'Name', value: 'IGW' }],
        });

        // IGWとVPCの関連付け
        const igw_attachment = new ec2.CfnVPCGatewayAttachment(this, 'VPCGatewayAttachment', {
            vpcId: vpcId,
            internetGatewayId: igw.ref,
        });

        // パブリックサブネットのデフォルトルートをIGWに設定
        const default_route_public = new ec2.CfnRoute(this, 'PublicDefaultRoute', {
            routeTableId: rtPublic.ref,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: igw.ref,
        });

        // 依存関係を明示的に
        default_route_public.addDependency(igw_attachment);

        // NAT Gateway用のEIPを作成
        const eip = new ec2.CfnEIP(this, 'NATGatewayEIP', {
        });

        // NAT Gatewayを作成
        const natGateway = new ec2.CfnNatGateway(this, 'NATGateway', {
            allocationId: eip.attrAllocationId,
            subnetId: publicSubnet1.ref,
            tags: [{ key: 'Name', value: 'NATGateway' }],
        });

        // プライベートサブネットのデフォルトルートをNAT Gatewayに設定
        new ec2.CfnRoute(this, 'PrivateDefaultRoute1', {
            routeTableId: rtPrivate.ref,
            destinationCidrBlock: '0.0.0.0/0',
            natGatewayId: natGateway.ref,
        });

        // VPC出力
        new CfnOutput(this, 'VpcIdOutput', {
            value: vpcId,
            description: 'VPC ID',
            exportName: 'VpcId'
        });

        // サブネット出力
        new CfnOutput(this, 'PublicSubnet1Id', {
        value: publicSubnet1.ref,
        description: 'Public Subnet 1 ID',
        exportName: 'PublicSubnetId1'
        });

        new CfnOutput(this, 'PublicSubnet2Id', {
        value: publicSubnet2.ref,
        description: 'Public Subnet 2 ID',
        exportName: 'PublicSubnetId2'
        });

        new CfnOutput(this, 'PrivateSubnet1Id', {
        value: privateSubnet1.ref,
        description: 'Private Subnet 1 ID',
        exportName: 'PrivateSubnetId1'
        });

        new CfnOutput(this, 'PrivateSubnet2Id', {
        value: privateSubnet2.ref,
        description: 'Private Subnet 2 ID',
        exportName: 'PrivateSubnetId2'
        });
    }
}