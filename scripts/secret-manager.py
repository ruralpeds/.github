#!/usr/bin/env python3
"""
Secrets Manager Wrapper

Secure storage and retrieval of secrets from AWS Secrets Manager.
Supports:
- Get secret by name
- Rotate secret to new value
- Get specific version of secret
- List all versions with metadata

All secret access is audited by AWS.
"""

import json
import sys
import argparse
from typing import Dict, List, Optional
import base64


class SecretManager:
    """Wrapper for AWS Secrets Manager operations."""

    def __init__(self, region: str = "us-east-1"):
        """
        Initialize secrets manager.

        Args:
            region: AWS region for Secrets Manager
        """
        self.region = region
        try:
            import boto3
            self.client = boto3.client("secretsmanager", region_name=region)
        except ImportError:
            print("❌ Error: boto3 not installed. Install with: pip install boto3")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Error initializing AWS client: {e}")
            sys.exit(1)

    def get_secret(self, secret_name: str, version_id: Optional[str] = None) -> str:
        """
        Retrieve secret from Secrets Manager.

        Args:
            secret_name: Name of secret to retrieve
            version_id: Optional specific version to retrieve

        Returns:
            Secret value as string

        Raises:
            ValueError: If secret not found or retrieval fails
        """
        try:
            params = {"SecretId": secret_name}
            if version_id:
                params["VersionId"] = version_id

            response = self.client.get_secret_value(**params)

            if "SecretString" in response:
                return response["SecretString"]
            elif "SecretBinary" in response:
                return base64.b64decode(response["SecretBinary"]).decode('utf-8')
            else:
                raise ValueError("No secret value found in response")

        except self.client.exceptions.ResourceNotFoundException:
            raise ValueError(f"Secret '{secret_name}' not found in {self.region}")
        except self.client.exceptions.InvalidRequestException as e:
            raise ValueError(f"Invalid request for secret '{secret_name}': {e}")
        except Exception as e:
            raise ValueError(f"Failed to retrieve secret '{secret_name}': {e}")

    def put_secret(self, secret_name: str, secret_value: str, description: Optional[str] = None) -> Dict:
        """
        Create or update a secret in Secrets Manager.

        Args:
            secret_name: Name of secret
            secret_value: Secret value to store
            description: Optional description of secret

        Returns:
            Response dict with ARN and VersionId
        """
        try:
            params = {
                "Name": secret_name,
                "SecretString": secret_value
            }
            if description:
                params["Description"] = description

            # Check if secret exists
            try:
                self.client.describe_secret(SecretId=secret_name)
                # Secret exists, update it
                response = self.client.update_secret(**params)
                print(f"✅ Updated secret '{secret_name}'")
            except self.client.exceptions.ResourceNotFoundException:
                # Secret doesn't exist, create it
                response = self.client.create_secret(**params)
                print(f"✅ Created secret '{secret_name}'")

            return {
                "arn": response.get("ARN"),
                "version_id": response.get("VersionId"),
                "name": secret_name
            }

        except Exception as e:
            raise ValueError(f"Failed to put secret '{secret_name}': {e}")

    def rotate_secret(self, secret_name: str, new_value: str) -> Dict:
        """
        Rotate a secret to new value.

        Creates new version in Secrets Manager. Old versions remain accessible
        for rollback purposes.

        Args:
            secret_name: Name of secret to rotate
            new_value: New secret value

        Returns:
            Response dict with version info
        """
        try:
            response = self.client.update_secret(
                SecretId=secret_name,
                SecretString=new_value
            )

            print(f"✅ Rotated secret '{secret_name}' to new version")
            return {
                "arn": response.get("ARN"),
                "version_id": response.get("VersionId"),
                "name": secret_name
            }

        except Exception as e:
            raise ValueError(f"Failed to rotate secret '{secret_name}': {e}")

    def list_versions(self, secret_name: str) -> List[Dict]:
        """
        List all versions of a secret with metadata.

        Args:
            secret_name: Name of secret

        Returns:
            List of version dicts with VersionId, CreatedDate, etc.
        """
        try:
            response = self.client.list_secret_version_ids(SecretId=secret_name)
            versions = []

            for version in response.get("Versions", []):
                versions.append({
                    "version_id": version.get("VersionId"),
                    "created_date": str(version.get("CreatedDate", "")),
                    "stages": version.get("VersionStages", [])
                })

            return versions

        except Exception as e:
            raise ValueError(f"Failed to list versions for '{secret_name}': {e}")

    def delete_secret(self, secret_name: str, days: int = 7) -> Dict:
        """
        Schedule secret for deletion (with recovery window).

        Args:
            secret_name: Name of secret to delete
            days: Recovery window in days (7-30, default 7)

        Returns:
            Response dict with deletion date
        """
        try:
            response = self.client.delete_secret(
                SecretId=secret_name,
                RecoveryWindowInDays=days
            )

            print(f"✅ Scheduled deletion of '{secret_name}' in {days} days")
            return {
                "arn": response.get("ARN"),
                "deletion_date": str(response.get("DeletionDate", ""))
            }

        except Exception as e:
            raise ValueError(f"Failed to delete secret '{secret_name}': {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Manage secrets in AWS Secrets Manager"
    )
    parser.add_argument("--action", choices=["get", "put", "rotate", "list", "delete"],
                        required=True, help="Action to perform")
    parser.add_argument("--secret-name", required=True, help="Secret name")
    parser.add_argument("--secret-value", help="Secret value (for put/rotate)")
    parser.add_argument("--description", help="Secret description (for put)")
    parser.add_argument("--version-id", help="Specific version ID (for get)")
    parser.add_argument("--region", default="us-east-1", help="AWS region")
    parser.add_argument("--recovery-days", type=int, default=7, help="Recovery window for delete")

    args = parser.parse_args()

    try:
        manager = SecretManager(region=args.region)

        if args.action == "get":
            value = manager.get_secret(args.secret_name, args.version_id)
            print(value)

        elif args.action == "put":
            if not args.secret_value:
                print("❌ Error: --secret-value required for put action")
                sys.exit(1)
            result = manager.put_secret(args.secret_name, args.secret_value, args.description)
            print(json.dumps(result, indent=2))

        elif args.action == "rotate":
            if not args.secret_value:
                print("❌ Error: --secret-value required for rotate action")
                sys.exit(1)
            result = manager.rotate_secret(args.secret_name, args.secret_value)
            print(json.dumps(result, indent=2))

        elif args.action == "list":
            versions = manager.list_versions(args.secret_name)
            print(json.dumps(versions, indent=2))

        elif args.action == "delete":
            result = manager.delete_secret(args.secret_name, args.recovery_days)
            print(json.dumps(result, indent=2))

    except ValueError as e:
        print(f"❌ {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
