import json
import os
import boto3
from botocore.exceptions import ClientError

# Secrets Manager クライアントを初期化
secrets_client = boto3.client('secretsmanager')


def get_secrets(secret_name):
    """
    Secrets Manager からシークレットを取得
    """
    try:
        response = secrets_client.get_secret_value(SecretId=secret_name)
        secrets = json.loads(response['SecretString'])
        return secrets
    except ClientError as e:
        print(f"Failed to retrieve secrets: {e}")
        raise e


def lambda_handler(event, context):
    # イベントからユーザー名とパスワードを取得
    username = event['username']
    password = event['password']

    # ユーザー名とパスワードが提供されているか確認
    if not username or not password:
        print("Username and password must be provided")
        raise Exception("Username and password must be provided")

    secret_name = os.environ['SECRET_NAME']
    secrets = get_secrets(secret_name)

    # 初期化
    response = None

    # ユーザー認証と振り分け
    if username in secrets and secrets[username]['password'] == password:
        user_config = secrets[username]
        home_directory_details = [
            {
                'Entry': '/',
                'Target': user_config['efs_path']
            }
        ]
        response = {
            'Role': os.environ['ROLE'],
            'PosixProfile': {
                "Uid": user_config['uid'],
                "Gid": user_config['gid']
            },
            'HomeDirectoryDetails': json.dumps(home_directory_details),
            'HomeDirectoryType': "LOGICAL"
        }

    if response:
        return response
    else:
        print("Authentication failed")
        raise Exception("Invalid credentials")
