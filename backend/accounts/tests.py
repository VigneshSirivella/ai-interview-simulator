from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthenticationPersistenceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.google_client_id = "test-google-client-id.apps.googleusercontent.com"

    @patch.dict("os.environ", {}, clear=True)
    def test_google_login_missing_client_id(self):
        """When GOOGLE_CLIENT_ID is not configured, return clear 500 error."""
        response = self.client.post(
            "/api/accounts/google-login/",
            {"credential": "mock_token"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("Google Client ID is not configured", response.data["error"])

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    def test_google_login_missing_credential(self):
        """When credential is missing, return 400 Bad Request."""
        response = self.client.post(
            "/api/accounts/google-login/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Google credential is required", response.data["error"])

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_login_invalid_credential(self, mock_verify):
        """When Google token verification fails, return 401 Unauthorized."""
        mock_verify.side_effect = ValueError("Token expired")

        response = self.client.post(
            "/api/accounts/google-login/",
            {"credential": "invalid_or_expired_token"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Invalid or expired", response.data["error"])

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_login_new_user_persisted(self, mock_verify):
        """
        New Google account is properly persisted in accounts_user with normalized email,
        username, first_name, last_name, full_name, is_active=True, and updated last_login.
        """
        mock_verify.return_value = {
            "email": "NewCandidate@Gmail.com",
            "email_verified": True,
            "name": "Sarah Connor",
            "given_name": "Sarah",
            "family_name": "Connor",
            "sub": "google-uid-12345",
        }

        response = self.client.post(
            "/api/accounts/google-login/",
            {"credential": "valid_google_token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "newcandidate@gmail.com")

        # Query database directly
        users = User.objects.filter(email__iexact="newcandidate@gmail.com")
        self.assertEqual(users.count(), 1)

        user = users.first()
        self.assertEqual(user.email, "newcandidate@gmail.com")
        self.assertEqual(user.first_name, "Sarah")
        self.assertEqual(user.last_name, "Connor")
        self.assertEqual(user.full_name, "Sarah Connor")
        self.assertTrue(user.is_active)
        self.assertTrue(user.otp_verified)
        self.assertIsNotNone(user.date_joined)
        self.assertIsNotNone(user.last_login)
        self.assertFalse(user.has_usable_password())

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_login_repeated_does_not_duplicate(self, mock_verify):
        """
        Logging in repeatedly with the SAME Google account must NOT duplicate the user.
        """
        mock_verify.return_value = {
            "email": "repeatuser@gmail.com",
            "email_verified": True,
            "name": "Repeat User",
            "given_name": "Repeat",
            "family_name": "User",
        }

        # First login: count increases to 1
        res1 = self.client.post("/api/accounts/google-login/", {"credential": "token_1"}, format="json")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email__iexact="repeatuser@gmail.com").count(), 1)
        user_id = User.objects.get(email="repeatuser@gmail.com").id

        # Second login: count does NOT increase
        res2 = self.client.post("/api/accounts/google-login/", {"credential": "token_2"}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email__iexact="repeatuser@gmail.com").count(), 1)
        self.assertEqual(User.objects.get(email="repeatuser@gmail.com").id, user_id)

        # Third login: count does NOT increase
        res3 = self.client.post("/api/accounts/google-login/", {"credential": "token_3"}, format="json")
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email__iexact="repeatuser@gmail.com").count(), 1)
        self.assertEqual(User.objects.get(email="repeatuser@gmail.com").id, user_id)

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_login_reuses_existing_password_account(self, mock_verify):
        """
        If user already registered via normal email/password, signing in via Google with matching
        email reuses the existing accounts_user record and preserves data/foreign keys.
        """
        existing_user = User.objects.create(
            username="existing_candidate",
            email="candidate@example.com",
            full_name="Existing Candidate",
            first_name="",
            last_name="",
            is_active=True,
            otp_verified=True,
        )
        existing_user.set_password("SecurePass123!")
        existing_user.save()

        mock_verify.return_value = {
            "email": "Candidate@Example.Com",  # Mixed case to verify case-insensitivity
            "email_verified": True,
            "name": "Existing Candidate",
            "given_name": "Existing",
            "family_name": "Candidate",
        }

        response = self.client.post(
            "/api/accounts/google-login/",
            {"credential": "valid_google_token"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Confirm exactly 1 user exists
        self.assertEqual(User.objects.filter(email__iexact="candidate@example.com").count(), 1)

        refreshed_user = User.objects.get(email="candidate@example.com")
        self.assertEqual(refreshed_user.id, existing_user.id)
        self.assertEqual(refreshed_user.first_name, "Existing")
        self.assertEqual(refreshed_user.last_name, "Candidate")
        self.assertIsNotNone(refreshed_user.last_login)
        self.assertTrue(refreshed_user.has_usable_password())  # Preserves password

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_authenticated_profile_endpoint_works_with_google_jwt(self, mock_verify):
        """
        Tokens generated by Google login must authenticate standard protected routes like /api/accounts/profile/.
        """
        mock_verify.return_value = {
            "email": "authtest@gmail.com",
            "email_verified": True,
            "name": "Auth Tester",
            "given_name": "Auth",
            "family_name": "Tester",
        }

        login_res = self.client.post(
            "/api/accounts/google-login/",
            {"credential": "token"},
            format="json",
        )
        access_token = login_res.data["access"]

        # Call protected profile view
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        profile_res = self.client.get("/api/accounts/profile/")
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data["email"], "authtest@gmail.com")

    def test_normal_email_password_login_works_and_updates_last_login(self):
        """
        Normal email/password login continues to work and updates last_login.
        """
        user = User.objects.create(
            username="normal_user@example.com",
            email="normal_user@example.com",
            full_name="Normal User",
            is_active=True,
            otp_verified=True,
        )
        user.set_password("MyPassword123!")
        user.save()
        self.assertIsNone(user.last_login)

        response = self.client.post(
            "/api/accounts/login/",
            {
                "email": "normal_user@example.com",
                "password": "MyPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        user.refresh_from_db()
        self.assertIsNotNone(user.last_login)
