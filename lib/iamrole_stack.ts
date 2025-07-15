import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class IamRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backupJobRole = new iam.CfnRole(this, 'MyBackupJobRole', {
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'backup.amazonaws.com'  // Backupサービスがassumeできるように
            },
            Action: 'sts:AssumeRole'
          }
        ]
      },
      roleName: 'MyBackupJobRole',
      policies: [
        {
          policyName: 'AllowBackupActions',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                    'backup:StartRestoreJob',
                    'backup:GetRecoveryPointRestoreMetadata',
                    'backup:DeleteRecoveryPoint',
                    'backup:DescribeBackupVault',
                    'backup:ListRecoveryPointsByBackupVault',
                    'backup:ListBackupVaults',
                    'backup:ListTags',
                    'backup:ListProtectedResources'
                ],
                Resource: '*'
              }
            ]
          }
        }
      ]
    });

    const ftpUserRole = new iam.CfnRole(this, 'FtpUserRole', {
      roleName: 'FtpUserRole',
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'transfer.amazonaws.com'
            },
            Action: 'sts:AssumeRole'
          }
        ]
      },
      policies: [
        {
          policyName: 'FtpUserPolicy',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'elasticfilesystem:ClientMount',
                  'elasticfilesystem:ClientWrite',
                  'elasticfilesystem:ClientRootAccess',
                ],
                Resource: '*'
              }
            ]
          }
        }
      ]
    });

    const lambdaFtpRole =  new iam.CfnRole(this, 'LambdaFtpRole', {
      roleName: 'LambdaFtpRole',
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'LambdaTrustPolicy', // ← SID 追加（任意）
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com'
            },
            Action: 'sts:AssumeRole'
          }
        ]
      },
      policies: [
        {
          policyName: 'LambdaFtpInlinePolicy',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'SecretsManagerAccess',
                Effect: 'Allow',
                Action: [
                  'secretsmanager:GetSecretValue'
                ],
                Resource: '*'
              },
              {
                Sid: 'KMSAccess',
                Effect: 'Allow',
                Action: [
                  'kms:Decrypt'
                ],
                Resource: '*'
              },
              {
                Sid: 'CloudWatchLogsAccess',
                Effect: 'Allow',
                Action: [
                  'logs:CreateLogGroup',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents'
                ],
                Resource: '*'
              }
            ]
          }
        }
      ]
    });

    // 出力
    new cdk.CfnOutput(this, 'BackupJobRoleArn', {
        value: backupJobRole.attrArn,
        exportName: 'BackupJobRoleArn',
        });

    new cdk.CfnOutput(this, 'LambdaFtpRoleArn', {
        value: lambdaFtpRole.attrArn,
        exportName: 'LambdaFtpRoleArn',
    });

    new cdk.CfnOutput(this, 'FtpUserRoleArn', {
        value: ftpUserRole.attrArn,
        exportName: 'FtpUserRoleArn',
    });
  }
}