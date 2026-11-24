
import base64
from io import BytesIO

import qrcode

from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import Booking, Ticket


def create_ticket(booking):
    ticket, _ = Ticket.objects.get_or_create(booking=booking)

    qr = qrcode.make(str(ticket.token))
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return ticket, f"data:image/png;base64,{qr_base64}"


class BookingCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data

        required = [
            'passenger_name', 'passenger_phone', 'bus_name',
            'bus_number', 'from_location', 'to_location',
            'journey_date', 'seat_numbers', 'total_amount'
        ]

        missing = [field for field in required if not data.get(field)]
        if missing:
            return Response(
                {'error': 'Missing fields', 'fields': missing},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(data['total_amount'])
            if amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({'error': 'Invalid total amount'}, status=400)

        if not isinstance(data['seat_numbers'], list) or not data['seat_numbers']:
            return Response({'error': 'Select at least one seat'}, status=400)

        try:
            journey_date = timezone.datetime.strptime(
                data['journey_date'], '%Y-%m-%d'
            ).date()
        except (ValueError, TypeError):
            return Response({'error': 'Date must be YYYY-MM-DD'}, status=400)

        if journey_date < timezone.localdate():
            return Response({'error': 'Journey date cannot be in the past'}, status=400)

        booking = Booking.objects.create(
            user=request.user,
            passenger_name=data['passenger_name'],
            passenger_phone=data['passenger_phone'],
            bus_name=data['bus_name'],
            bus_number=data['bus_number'],
            from_location=data['from_location'],
            to_location=data['to_location'],
            journey_date=journey_date,
            seat_numbers=data['seat_numbers'],
            total_amount=amount
        )

        return Response({
            'message': 'Booking created. Complete demo payment to generate your QR ticket.',
            'booking_id': booking.id,
            'booking_reference': booking.booking_reference,
            'payment_status': booking.payment_status,
            'total_amount': str(booking.total_amount)
        }, status=status.HTTP_201_CREATED)


class DemoPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                user=request.user
            )
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)

        if booking.status == 'CANCELLED':
            return Response({'error': 'This booking is cancelled'}, status=400)

        if booking.payment_status == 'PAID':
            ticket, qr_image = create_ticket(booking)
            return Response({
                'message': 'Payment was already verified',
                'payment_status': 'PAID',
                'ticket_token': str(ticket.token),
                'qr_image': qr_image
            })

        # DEMO ONLY: This simulates a successful payment.
        # Replace with verified Razorpay payment + webhook before production.
        booking.payment_status = 'PAID'
        booking.save(update_fields=['payment_status'])

        ticket, qr_image = create_ticket(booking)

        return Response({
            'message': 'Demo payment successful. QR ticket generated.',
            'payment_status': 'PAID',
            'booking_reference': booking.booking_reference,
            'ticket_token': str(ticket.token),
            'qr_image': qr_image
        })


class TicketDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                user=request.user
            )
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)

        if booking.payment_status != 'PAID':
            return Response({
                'error': 'Payment is not verified. QR ticket is unavailable.'
            }, status=400)

        if booking.status == 'CANCELLED':
            return Response({'error': 'Booking is cancelled'}, status=400)

        ticket, qr_image = create_ticket(booking)

        return Response({
            'booking_reference': booking.booking_reference,
            'passenger_name': booking.passenger_name,
            'bus_name': booking.bus_name,
            'bus_number': booking.bus_number,
            'from': booking.from_location,
            'to': booking.to_location,
            'journey_date': str(booking.journey_date),
            'seats': booking.seat_numbers,
            'amount': str(booking.total_amount),
            'payment_status': booking.payment_status,
            'ticket_status': 'USED' if ticket.is_used else 'VALID',
            'qr_image': qr_image
        })


class TicketScanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['ADMIN', 'CONDUCTOR']:
            return Response({'error': 'Only an admin or conductor can scan tickets'}, status=403)

        token = request.data.get('token')
        if not token:
            return Response({'error': 'QR token is required'}, status=400)

        with transaction.atomic():
            try:
                ticket = Ticket.objects.select_for_update().select_related('booking').get(token=token)
            except (Ticket.DoesNotExist, ValueError):
                return Response({'valid': False, 'message': 'Invalid QR ticket'}, status=404)

            booking = ticket.booking

            if booking.payment_status != 'PAID':
                return Response({'valid': False, 'message': 'Payment not verified'}, status=400)

            if booking.status == 'CANCELLED':
                return Response({'valid': False, 'message': 'Booking cancelled'}, status=400)

            if booking.journey_date != timezone.localdate():
                return Response({
                    'valid': False,
                    'message': 'Ticket is not valid for today',
                    'journey_date': str(booking.journey_date)
                }, status=400)

            if ticket.is_used:
                return Response({
                    'valid': False,
                    'message': 'Ticket already used',
                    'booking_reference': booking.booking_reference,
                    'scanned_at': ticket.scanned_at
                }, status=409)

            ticket.is_used = True
            ticket.scanned_at = timezone.now()
            ticket.save(update_fields=['is_used', 'scanned_at'])

            return Response({
                'valid': True,
                'message': 'Ticket verified successfully. Passenger may board.',
                'booking_reference': booking.booking_reference,
                'passenger_name': booking.passenger_name,
                'bus_number': booking.bus_number,
                'route': f'{booking.from_location} to {booking.to_location}',
                'seats': booking.seat_numbers,
                'journey_date': str(booking.journey_date)
            })
