
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import RegisterSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (
            request.data.get('username')
            or request.data.get('email')
            or ''
        ).strip()

        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {"error": "Email/username and password are required"},
                status=400
            )

        # First try username login
        user = authenticate(
            request,
            username=identifier,
            password=password
        )

        # If username login fails, try email login
        if user is None:
            matching_user = User.objects.filter(
                email__iexact=identifier
            ).first()

            if matching_user:
                user = authenticate(
                    request,
                    username=matching_user.username,
                    password=password
                )

        if user is None:
            return Response(
                {"error": "Invalid email/username or password"},
                status=401
            )

        if not user.is_active:
            return Response(
                {"error": "This account is inactive"},
                status=403
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
            }
        })
