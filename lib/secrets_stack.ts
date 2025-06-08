import { freemem } from "os";
import{
    Stack,
    StackProps,
    CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class SecretsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const secret = new secretsmanager.CfnSecret(this, "TransferAuthSecret", {
            name: "TransferAuthSecret",
            description: "This secret is used for transferring authentication",
            //手動で作成の為、secretの中身は作成しない。
            tags: [
                {
                    key: "Name",
                    value: "TransferAuthSecret"
                }
            ]
        });

        //出力
        new CfnOutput(this, "TransferSecretArn", {
            value: secret.ref,
            description: "The ARN of the TransferAuthSecret",
        });

        new CfnOutput(this, "TransferSecretName", {
            value: secret.name!,
            description: "The name of the TransferAuthSecret",
        });
    }
}