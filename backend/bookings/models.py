
import uuid
from django.conf import settings
from django.db import models


class Booking(models.Model):
    PAYMENT_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bus_bookings'
    )
    booking_reference = models.CharField(max_length=20, unique=True, editable=False)
    passenger_name = models.CharField(max_length=150)
    passenger_phone = models.CharField(max_length=15)
    bus_name = models.CharField(max_length=150)
    bus_number = models.CharField(max_length=30)
    from_location = models.CharField(max_length=100)
    to_location = models.CharField(max_length=100)
    journey_date = models.DateField()
    seat_numbers = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='PENDING')
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='CONFIRMED')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.booking_reference


class Ticket(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='ticket'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_used = models.BooleanField(default=False)
    scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket - {self.booking.booking_reference}"
