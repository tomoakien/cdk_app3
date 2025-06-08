#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc_stack';
import { NaclStack } from '../lib/nacl_stack';
import { SgStack } from '../lib/sg_stack';
import { EfsStack } from '../lib/efs_stack';

const app = new cdk.App();
new VpcStack(app, 'VpcStack');
new NaclStack(app, 'NaclStack');
new SgStack(app, 'SgStack');
new EfsStack(app, 'EfsStack');