import { Stack,StackProps,CfnOutput} from "aws-cdk-lib";
import { Construct } from "constructs";
import{
    CfnNetworkAcl,
    CfnNetworkAclEntry,
    CfnSubnetNetworkAclAssociation,
} from "aws-cdk-lib/aws-ec2";
import{Fn} from "aws-cdk-lib";

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

export class NaclStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // パブリックネットワークACLを作成
        const publicNacl = new CfnNetworkAcl(this, "PublicNacl", {
            vpcId: vpcId,
            tags: [
                {
                    key: "Name",
                    value: "PublicNacl",
                },
            ],
        });

        //プライベートネットワークACLを作成
        const privateNacl = new CfnNetworkAcl(this, "PrivateNacl", {
            vpcId: vpcId,
            tags: [
                {
                    key: "Name",
                    value: "PrivateNacl",
                },
            ],
        });

        // ネットワークACLエントリを作成する関数
        const createNaclEntry = (
            name: string,
            nacl: CfnNetworkAcl,
            ruleNumber: number,
            protocol: number,
            ruleAction: string,
            egress: boolean,
            cidrBlock: string,
            portRange?: { from?: number; to?: number }
        ): CfnNetworkAclEntry => {
            return new CfnNetworkAclEntry(this, name, {
                networkAclId: nacl.ref,
                ruleNumber: ruleNumber,
                protocol: protocol,
                ruleAction: ruleAction,
                egress: egress,
                cidrBlock: cidrBlock,
                portRange: portRange,
            });
        };

        // publicNaclネットワークACLエントリの作成
        createNaclEntry("AllowInboundHTTP", publicNacl, 100, 6, "allow", false, "0.0.0.0/0", { from: 80, to: 80 });
        createNaclEntry("AllowInboundHTTPS", publicNacl, 110, 6, "allow", false, "0.0.0.0/0", { from: 443, to: 443 });
        createNaclEntry("AllowOutboundAll", publicNacl, 100, -1, "allow", true, "0.0.0.0/0");

        //Nacl関連付け用の関数
        const createAssociateNacl = (
            idPrefix: string,
            nacl: CfnNetworkAcl,
            subnetIds: string[]
        ): CfnSubnetNetworkAclAssociation[] => {
            return subnetIds.map((subnetId, idx) => {
                return new CfnSubnetNetworkAclAssociation(this, `${idPrefix}${idx}`, {
                    subnetId: subnetId,
                    networkAclId: nacl.ref,
                });
            });
        };

        // パブリックサブネットにパブリックNACLを関連付け
        createAssociateNacl("PublicSubnetNaclAssociation", publicNacl, publicSubnetIds);

    }
}
