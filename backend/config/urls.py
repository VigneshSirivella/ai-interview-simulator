from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from interviews.dashboard_views import dashboard_stats
from interviews.leaderboard_views import leaderboard


def backend_health(request):
    return JsonResponse({"status": "success", "message": "Django backend is working"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/resume/", include("resume.urls")),
    path("api/interviews/", include("interviews.urls")),
    path("api/practice/", include("practice.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/dashboard/stats/", dashboard_stats),
    path("api/health/", backend_health),
    path("api/leaderboard/", leaderboard),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
