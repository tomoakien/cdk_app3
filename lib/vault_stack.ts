import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnBackupVault } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';


export class VaultStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const backupRoleArn = cdk.Fn.importValue("BackupJobRoleArn"); // IAMロールのARNをインポート
        const vaultName = 'MyBackupVault'; // バックアップボールトの名前を指定
        const vaultArn = `arn:aws:backup:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:backup-vault:${vaultName}`; // バックアップボールトのARNを指定

        // バックアップボールトを作成
        const backupVault = new CfnBackupVault(this, 'BackupVault', {
            backupVaultName: vaultName, // バックアップボールトの名前を指定
            accessPolicy: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'AllowBackupRoleActions',
                        Effect: 'Allow',
                        Principal: {
                            AWS: backupRoleArn // IAMロールのARNを指定
                        },
                        Action: [
                            'backup:StartRestoreJob',
                            'backup:GetRecoveryPointRestoreMetadata',
                            'backup:DeleteRecoveryPoint',
                            'backup:DescribeBackupVault',
                        ],
                        Resource: vaultArn // バックアップボールトのARNを指定
                    }
                ]
            },
            backupVaultTags: {
                key: 'Name',
                value: vaultName,
            }
        });
    }
}