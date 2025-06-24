import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import { CfnBackupVault } from 'aws-cdk-lib/aws-backup';
import {Construct} from 'constructs';

export class VaultStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // バックアップボールトを作成
        const backupVault = new CfnBackupVault(this, 'BackupVault', {
            backupVaultName: 'MyBackupVault',
            backupVaultTags: 
                {
                    key: 'Name',
                    value: 'MyBackupVault',
                }
        });

        // 出力
        new CfnOutput(this, 'BackupVaultName', {
            value: backupVault.backupVaultName,
            exportName: 'BackupVaultName',
        });
    }
}