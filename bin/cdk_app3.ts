#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc_stack';
import { NaclStack } from '../lib/nacl_stack';
import { SgStack } from '../lib/sg_stack';
import { EfsStack } from '../lib/efs_stack';
import { S3Stack } from '../lib/s3_stack';
import { CloudWatchStack } from '../lib/cloudwatch_stack';
import { AlbStack } from '../lib/alb_stack';
import { VaultStack } from '../lib/vault_stack';
import { LambdaStack } from '../lib/lambda_stack';
import { EndpointStack } from '../lib/endpoint_stack';
import { KmsStack } from '../lib/kms_stack';
import { TransferStack } from '../lib/transfer_stack';
import { IamRoleStack } from '../lib/iamrole_stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new VpcStack(app, 'VpcStack', { env });
new IamRoleStack(app, 'IamRoleStack', { env });
new EndpointStack(app, 'EndpointStack', { env });
new NaclStack(app, 'NaclStack', { env });
new SgStack(app, 'SgStack', { env });
new EfsStack(app, 'EfsStack', { env });
new S3Stack(app, 'S3Stack', { env });
new CloudWatchStack(app, 'CloudWatchStack', { env });
new AlbStack(app, 'AlbStack', { env });
new VaultStack(app, 'VaultStack', { env });
new KmsStack(app, 'KmsStack', { env });
new LambdaStack(app, 'LambdaStack', { env });
new TransferStack(app, 'TransferStack', { env });


