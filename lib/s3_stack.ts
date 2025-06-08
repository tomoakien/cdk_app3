import {
    Stack,
    StackProps,
    CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class S3Stack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucketName = "my-explicit-s3-bucket";

        const bucket = new s3.CfnBucket(this, "MyBucket", {
            bucketName: bucketName,
            versioningConfiguration: {
                status: "Enabled",
            },

            publicAccessBlockConfiguration: {
                blockPublicAcls: true,
                ignorePublicAcls: true,
                blockPublicPolicy: true,
                restrictPublicBuckets: true,
            },

            lifecycleConfiguration: {
                rules: [
                    {
                        id: "AutoDeletedOldLogs",
                        status: "Enabled",
                        expirationInDays: 30,
                        prefix: "",
                    },
                ],
            },

            bucketEncryption: {
                serverSideEncryptionConfiguration: [
                    {
                        serverSideEncryptionByDefault: {
                            sseAlgorithm: "AES256",
                        },
                    },
                ],
            },

            tags: [
                {
                    key: "Name",
                    value: "MySampleBucket"
                }
            ]
        });


        // 出力
        new CfnOutput(this, "BucketName", {
            value: bucket.ref,
            exportName: "MyBucketName",
        });

        new CfnOutput(this, "S3BucketArn", {
            value: `arn:aws:s3:::${bucketName}`,
            exportName: "S3BucketArn"
        });
    }
}