
from django.http import JsonResponse
from django.utils import timezone


def health_check(request):
    return JsonResponse({
        "status": "success",
        "message": "Erode Smart Bus Backend is running!",
        "project": "Erode Smart Bus",
        "server_time": timezone.now().isoformat(),
    })
