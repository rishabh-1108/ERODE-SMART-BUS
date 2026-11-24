
from django.urls import path
from .views import (
    BookingCreateView,
    DemoPaymentView,
    TicketDetailView,
    TicketScanView,
)

urlpatterns = [
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('<int:booking_id>/demo-payment/', DemoPaymentView.as_view(), name='demo-payment'),
    path('<int:booking_id>/ticket/', TicketDetailView.as_view(), name='ticket-detail'),
    path('scan/', TicketScanView.as_view(), name='ticket-scan'),
]
