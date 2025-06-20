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

const app = new cdk.App();
new VpcStack(app, 'VpcStack');
new NaclStack(app, 'NaclStack');
new SgStack(app, 'SgStack');
new EfsStack(app, 'EfsStack');
new SecretsStack(app, 'SecretsStack');
new S3Stack(app, 'S3Stack');
new CloudWatchStack(app, 'CloudWatchStack');
new AlbStack(app, 'AlbStack');
