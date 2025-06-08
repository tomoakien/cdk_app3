import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as logs from "aws-cdk-lib/aws-logs";

export class CloudWatchStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ec2appLogGroup = new logs.CfnLogGroup(this, "EC2appLogGroup", {
            logGroupName: "/ec2/app",
            retentionInDays: 30, // ログの保持期間を30日に設定
            tags: [
                {
                    key: "Name",
                    value: "EC2appLogGroup"
                }
            ]
        });

        const lambdaLogGroup = new logs.CfnLogGroup(this, "LambdaAuthLogGroup", {
            logGroupName: "/lambda/auth",
            retentionInDays: 14, // ログの保持期間を14日に設定
            tags: [
                {
                    key: "Name",
                    value: "LambdaAuthLogGroup"
                }
            ]
        });

        // 出力
        new CfnOutput(this, "EC2appLogGroupName", {
            value: ec2appLogGroup.logGroupName!,
            exportName: "MyEC2appLogGroupName",
        });

        new CfnOutput(this, "LambdaAuthLogGroupName", {
            value: lambdaLogGroup.logGroupName!,
            exportName: "MyLambdaAuthLogGroupName",
        });

    }
}