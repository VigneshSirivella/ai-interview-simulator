from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == "PATCH":
        user.full_name = request.data.get(
            "full_name",
            user.full_name,
        )

        user.phone = request.data.get(
            "phone",
            user.phone,
        )

        user.preferred_language = request.data.get(
            "preferred_language",
            user.preferred_language,
        )

        if "profile_picture" in request.FILES:
            user.profile_picture = request.FILES["profile_picture"]

        # IMPORTANT:
        # Email is intentionally NOT updated.
        # Login email stays permanently fixed.

        user.save()

    profile_picture = ""

    if user.profile_picture:
        profile_picture = request.build_absolute_uri(user.profile_picture.url)

    return Response(
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "preferred_language": user.preferred_language,
            "profile_picture": profile_picture,
        }
    )
