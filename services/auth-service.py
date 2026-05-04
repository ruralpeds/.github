#!/usr/bin/env python3
"""
Authentication Service

OAuth2 with GitHub authentication + JWT token generation.
Provides single sign-on and role-based access control.

Flow:
1. User clicks "Login with GitHub"
2. Redirects to GitHub OAuth authorize endpoint
3. User approves, GitHub redirects back with code
4. Exchange code for access token
5. Get user info + org memberships
6. Generate JWT token with claims
7. Return JWT for API authentication
"""

import json
import sys
import argparse
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from urllib.parse import urlencode
import hmac
import hashlib
import base64
import os


class AuthService:
    """OAuth2 GitHub authentication with JWT token generation."""

    def __init__(self, github_app_id: str, client_secret: str, redirect_uri: str = None):
        """
        Initialize auth service.

        Args:
            github_app_id: GitHub OAuth App ID
            client_secret: GitHub OAuth App Secret
            redirect_uri: Callback URL after GitHub auth
        """
        self.github_app_id = github_app_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri or "http://localhost:8000/auth/callback"

    def get_auth_url(self, state: str) -> str:
        """
        Generate GitHub OAuth authorization URL.

        Args:
            state: CSRF token for security

        Returns:
            GitHub OAuth authorize URL
        """
        params = {
            "client_id": self.github_app_id,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "scope": "read:org read:user"  # Request org membership visibility
        }
        return f"https://github.com/login/oauth/authorize?{urlencode(params)}"

    def exchange_code_for_token(self, code: str) -> Dict:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from GitHub

        Returns:
            Token response dict with access_token, token_type, scope
        """
        try:
            import requests
        except ImportError:
            print("❌ Error: requests library not installed. Install with: pip install requests")
            sys.exit(1)

        try:
            response = requests.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": self.github_app_id,
                    "client_secret": self.client_secret,
                    "code": code
                },
                headers={"Accept": "application/json"},
                timeout=10
            )
            response.raise_for_status()

            token_data = response.json()
            if "error" in token_data:
                raise ValueError(f"OAuth error: {token_data.get('error_description', token_data['error'])}")

            return token_data

        except requests.RequestException as e:
            raise ValueError(f"Failed to exchange code: {e}")
        except Exception as e:
            raise ValueError(f"Token exchange error: {e}")

    def get_user_info(self, access_token: str) -> Dict:
        """
        Get authenticated user info from GitHub.

        Args:
            access_token: GitHub access token

        Returns:
            User dict with login, id, email, etc.
        """
        try:
            import requests
        except ImportError:
            raise ImportError("requests library required")

        try:
            response = requests.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                },
                timeout=10
            )
            response.raise_for_status()
            return response.json()

        except requests.RequestException as e:
            raise ValueError(f"Failed to get user info: {e}")

    def get_user_orgs(self, access_token: str) -> List[str]:
        """
        Get list of GitHub organizations user belongs to.

        Args:
            access_token: GitHub access token

        Returns:
            List of organization login names
        """
        try:
            import requests
        except ImportError:
            raise ImportError("requests library required")

        try:
            response = requests.get(
                "https://api.github.com/user/orgs",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                },
                timeout=10
            )
            response.raise_for_status()
            orgs = response.json()
            return [org.get("login") for org in orgs]

        except requests.RequestException as e:
            raise ValueError(f"Failed to get user orgs: {e}")

    def create_jwt_token(self, user_info: Dict, orgs: List[str], jwt_secret: str) -> str:
        """
        Create JWT token with user claims.

        Args:
            user_info: User dict from GitHub
            orgs: List of organizations user belongs to
            jwt_secret: Secret key for signing JWT

        Returns:
            Signed JWT token (HS256)
        """
        # Create claims
        now = datetime.utcnow()
        claims = {
            "sub": user_info.get("login"),
            "aud": "dashboard-api",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=24)).timestamp()),
            "orgs": orgs,
            "email": user_info.get("email"),
            "user_id": user_info.get("id")
        }

        # Encode header.payload.signature
        header = {
            "alg": "HS256",
            "typ": "JWT"
        }

        # Encode to base64url (no padding)
        def b64_encode(data):
            return base64.urlsafe_b64encode(
                json.dumps(data).encode()
            ).decode().rstrip("=")

        header_enc = b64_encode(header)
        claims_enc = b64_encode(claims)
        message = f"{header_enc}.{claims_enc}"

        # Sign with HMAC-SHA256
        signature = hmac.new(
            jwt_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).digest()
        signature_enc = base64.urlsafe_b64encode(signature).decode().rstrip("=")

        return f"{message}.{signature_enc}"

    def verify_jwt_token(self, token: str, jwt_secret: str) -> Dict:
        """
        Verify and decode JWT token.

        Args:
            token: JWT token to verify
            jwt_secret: Secret key used to sign token

        Returns:
            Decoded claims dict if valid

        Raises:
            ValueError: If token is invalid
        """
        try:
            header_enc, claims_enc, signature_enc = token.split(".")
        except ValueError:
            raise ValueError("Invalid token format")

        # Verify signature
        message = f"{header_enc}.{claims_enc}"
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(
                jwt_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).digest()
        ).decode().rstrip("=")

        if not hmac.compare_digest(signature_enc, expected_sig):
            raise ValueError("Invalid token signature")

        # Decode claims
        try:
            # Add padding if needed
            padding = 4 - len(claims_enc) % 4
            if padding != 4:
                claims_enc += "=" * padding

            claims = json.loads(base64.urlsafe_b64decode(claims_enc))

            # Check expiration
            if claims.get("exp", 0) < datetime.utcnow().timestamp():
                raise ValueError("Token expired")

            return claims

        except json.JSONDecodeError:
            raise ValueError("Invalid token claims")


def main():
    parser = argparse.ArgumentParser(
        description="OAuth2 authentication service for GitHub"
    )
    parser.add_argument("--action", choices=["auth-url", "exchange", "verify"],
                        required=True, help="Action to perform")
    parser.add_argument("--app-id", help="GitHub OAuth App ID")
    parser.add_argument("--secret", help="GitHub OAuth App Secret")
    parser.add_argument("--redirect-uri", help="OAuth callback URI")
    parser.add_argument("--state", help="CSRF state token")
    parser.add_argument("--code", help="Authorization code")
    parser.add_argument("--access-token", help="GitHub access token")
    parser.add_argument("--jwt-secret", help="Secret for JWT signing")
    parser.add_argument("--jwt-token", help="JWT token to verify")

    args = parser.parse_args()

    try:
        if args.action == "auth-url":
            if not args.app_id or not args.state:
                print("❌ Error: --app-id and --state required")
                sys.exit(1)

            auth = AuthService(args.app_id, "", args.redirect_uri)
            url = auth.get_auth_url(args.state)
            print(url)

        elif args.action == "exchange":
            if not all([args.app_id, args.secret, args.code]):
                print("❌ Error: --app-id, --secret, --code required")
                sys.exit(1)

            auth = AuthService(args.app_id, args.secret, args.redirect_uri)
            token_data = auth.exchange_code_for_token(args.code)

            # Get user info
            access_token = token_data.get("access_token")
            user_info = auth.get_user_info(access_token)
            orgs = auth.get_user_orgs(access_token)

            # Generate JWT
            jwt_secret = os.environ.get("JWT_SIGNING_KEY") or args.jwt_secret
            if not jwt_secret:
                print("❌ Error: JWT_SIGNING_KEY env var or --jwt-secret required")
                sys.exit(1)

            jwt_token = auth.create_jwt_token(user_info, orgs, jwt_secret)

            result = {
                "user": {
                    "login": user_info.get("login"),
                    "id": user_info.get("id"),
                    "email": user_info.get("email")
                },
                "orgs": orgs,
                "jwt_token": jwt_token
            }
            print(json.dumps(result, indent=2))

        elif args.action == "verify":
            if not all([args.jwt_token, args.jwt_secret]):
                print("❌ Error: --jwt-token and --jwt-secret required")
                sys.exit(1)

            auth = AuthService("", "")
            claims = auth.verify_jwt_token(args.jwt_token, args.jwt_secret)
            print(json.dumps(claims, indent=2))

    except ValueError as e:
        print(f"❌ {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
