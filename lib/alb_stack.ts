import {Stack, StackProps,CfnTag,CfnOutput,Fn} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


//vpc_stack.tsで作成したVPCとサブネットの情報をインポート
const vpcId = Fn.importValue("VpcId");
const publicSubnetIds = [
    Fn.importValue("PublicSubnetId1"),
    Fn.importValue("PublicSubnetId2"),
];
const privateSubnetIds = [
    Fn.importValue("PrivateSubnetId1"),
    Fn.importValue("PrivateSubnetId2"),
];
const albSgId = Fn.importValue("AlbSGId");

export class AlbStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //ALBを作成
        //ALBはパブリックサブネットに配置し、インターネットからアクセス可能にする
        const alb = new elbv2.CfnLoadBalancer(this, 'MyALB', {
            name: 'MyALB',
            subnets: publicSubnetIds,
            securityGroups: [albSgId],
            type: 'application',
            scheme: 'internet-facing',
            tags: [
                {
                    key: 'Name',
                    value: 'MyALB'
                },
            ],
        });

        //ALBのターゲットグループを作成
        const targetGroup = new elbv2.CfnTargetGroup(this, 'AlbTargetGroup', {
            name: 'MyAlbTargetGroup',
            vpcId: vpcId,
            protocol: 'HTTP',
            port: 80,
            targetType: 'instance',
            healthCheckEnabled: true,
            healthCheckPath: '/',
            // healthCheckIntervalSeconds: 30,
            // healthCheckTimeoutSeconds: 5,
            // healthyThresholdCount: 5,
            // unhealthyThresholdCount: 2,
            matcher: {
                httpCode: '200-399', // 健康チェックのHTTPコード範囲
            },
            tags: [
                {
                    key: 'Name',
                    value: 'MyAlbTargetGroup'
                },
            ],
        });

        //ALBのリスナーを作成
        const listener = new elbv2.CfnListener(this, 'ALBListener', {
            loadBalancerArn: alb.ref,
            port: 80,
            protocol: 'HTTP',
            defaultActions: [{
                type: 'forward',
                targetGroupArn: targetGroup.attrTargetGroupArn, // ターゲットグループのARNをインポート
            }],
        });

        //依存の関係を設定
        listener.addDependency(alb);
        listener.addDependency(targetGroup);

        //オプション出力
        new CfnOutput(this, 'AlbDnsName', {
            value: alb.attrDnsName,
            description: 'The name of the Application Load Balancer',
            exportName: 'AlbDnsName',
        });
        
    }
}