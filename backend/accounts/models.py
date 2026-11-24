
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = [
        ('PASSENGER', 'Passenger'),
        ('ADMIN', 'Admin'),
        ('OPERATOR', 'Operator'),
        ('CONDUCTOR', 'Conductor'),
    ]

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PASSENGER'
    )

    def __str__(self):
        return f"{self.full_name} ({self.role})"
