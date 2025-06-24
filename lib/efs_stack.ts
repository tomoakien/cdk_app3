import {
    Stack,
    StackProps,
    CfnOutput,
    Fn,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as efs from "aws-cdk-lib/aws-efs";

// vpc_stack.tsで作成したVPCの情報をインポート
const vpcId = Fn.importValue("VpcId");
const privateSubnetIds = [
    Fn.importValue("PrivateSubnetId1"),
    Fn.importValue("PrivateSubnetId2"),
];
const efsSGId = Fn.importValue("EfsSGId");

export class EfsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // EFSファイルシステムを作成
        const fileSystem = new efs.CfnFileSystem(this, "EfsFileSystem", {
            encrypted: true,
            performanceMode: "generalPurpose",
            throughputMode: "bursting",
            fileSystemTags: [{
            key: 'Name',
            value: 'EFS',
            }],
        });

        //マウントターゲットを作成
        const mt1 = new efs.CfnMountTarget(this, "EfsMountTarget1", {
            fileSystemId: fileSystem.ref,
            subnetId: privateSubnetIds[0],
            ipAddress: "10.0.3.10",
            securityGroups: [efsSGId],
        });

        const mt2 = new efs.CfnMountTarget(this, "EfsMountTarget2", {
            fileSystemId: fileSystem.ref,
            subnetId: privateSubnetIds[1],
            ipAddress: "10.0.4.10",
            securityGroups: [efsSGId],
        });

        // 出力
        new CfnOutput(this, "EfsId", {
            value: fileSystem.ref,
            exportName: "EfsId",
        });

        new CfnOutput(this, "EfsMountTarget1Id", {
            value: mt1.ref,
            exportName: "EfsMountTarget1Id",
        });

        new CfnOutput(this, "EfsMountTarget2Id", {
            value: mt2.ref,
            exportName: "EfsMountTarget2Id",
        });
    }
}