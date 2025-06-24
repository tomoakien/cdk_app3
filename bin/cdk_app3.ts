#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc_stack';
import { NaclStack } from '../lib/nacl_stack';
import { SgStack } from '../lib/sg_stack';
import { EfsStack } from '../lib/efs_stack';
import { SecretsStack } from '../lib/secrets_stack';
import { S3Stack } from '../lib/s3_stack';
import { CloudWatchStack } from '../lib/cloudwatch_stack';
import { AlbStack } from '../lib/alb_stack';
import { KmsStack } from '../lib/kms_stack';
import { VaultStack } from '../lib/vault_stack';
import { LambdaStack } from '../lib/lambda_stack';

const app = new cdk.App();
new VpcStack(app, 'VpcStack');
new NaclStack(app, 'NaclStack');
new SgStack(app, 'SgStack');
new EfsStack(app, 'EfsStack');
new SecretsStack(app, 'SecretsStack');
new S3Stack(app, 'S3Stack');
new CloudWatchStack(app, 'CloudWatchStack');
new AlbStack(app, 'AlbStack');
new KmsStack(app, 'KmsStack');
new VaultStack(app, 'VaultStack');
new LambdaStack(app, 'LambdaStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
