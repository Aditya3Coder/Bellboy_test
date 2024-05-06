from django.core.mail import send_mail, EmailMessage
from django.http import HttpResponse
from core.models import Snippet
from rest import settings
from rest_framework.generics import ListAPIView
from core import models
from core.serializers import SnippetSerializer


class studentlist(ListAPIView):
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer


from rest_framework.views import APIView
from rest_framework import viewsets, mixins
from rest_framework.response import Response
#from core import permissions
from rest_framework import status
from rest_framework.decorators import api_view  #, permission_classes
from rest_framework.permissions import IsAdminUser
from .serializers import PropertySerializer
from .models import Property
from .models import Booking
from .serializers import BookingSerializer
from django.db.models.query import QuerySet
from core.models import User

class PropertyViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    #permission_classes = [IsAdminUser|permissions.IsPropertyOwner,]
    serializer_class = PropertySerializer
    # queryset = Property.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if (user.is_staff):
            queryset = Property.objects.all()
        elif (user.role == "OWNER"):
            queryset = Property.objects.filter(owner=user)
            
        if isinstance(queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            queryset = queryset.all()
        return queryset


@api_view(['GET'])
#@permission_classes([IsAdminUser|permissions.IsPropertyOwner,])
def bookings_by_property(request, id):
    queryset = Booking.objects.filter(property=id)
    serializer = BookingSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
#@permission_classes([IsAdminUser|permissions.IsPropertyOwner,])
def get_available_partners_list(request):
    partners_list = User.objects.filter(role="PARTNER").values('username','id')
    
    return Response(partners_list)



import coreapi

from rest_framework.schemas import AutoSchema, ManualSchema
from rest_framework.decorators import api_view, permission_classes, schema

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.schemas import AutoSchema
from rest_framework import serializers
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import Booking, Customer
from .serializers import BookingSerializer, CustomerSerializer
from django.core import exceptions
from core.utils import send_email_with_attachment
class CreateCustomerView(CreateAPIView):
    serializer_class = CustomerSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            uuid = self.kwargs.get('uuid')
            booking = Booking.objects.filter(uuid=uuid).first()
            if not booking:
                return Response({"detail": "Please use a correct UUID."}, status=status.HTTP_404_NOT_FOUND)

            if booking.customer:
                return Response({"detail": "Booking already has a customer attached."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Create the customer and associate it with the booking
            customer = serializer.save()
            booking.customer = customer
            booking.save()

            #automated email after customer upload its data

            send_email_with_attachment(booking.property.building_name.id , customer.id)

            print(customer.name , customer.email , customer.contact ,customer.passport_file )
            print("uuid of the booking", booking.uuid)
            building = booking.property.building_name
            print("building name and credentials" , building.name , building.address  ,building.security_email1 , building.security_email2  , building.documents)



            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
'''
create_customer_schema = AutoSchema(manual_fields=[
    coreapi.Field("name", required=True, location="form", type="string", description="Full Name"),
    coreapi.Field("email", required=True, location="form", type="string", description="Email Address"),
    coreapi.Field("contact", required=True, location="form", type="string", description="Contact Number")
])

@api_view(['POST'])
@schema(create_customer_schema)
def CreateCustomerView(request, uuid):
    serializer = CustomerSerializer(data=request.data)
    booking = Booking.objects.filter(uuid=uuid).first()

    if not booking:
        return Response({"detail":"Please use a correct UUID."}, status=status.HTTP_404_NOT_FOUND)

    if booking.customer is not None:
        return Response({"detail":"Booking already has a customer attached."}, status=status.HTTP_400_BAD_REQUEST)
    
    if booking and serializer.is_valid():

        customer_exists = Customer.objects.filter(email=serializer.validated_data["email"]).first()
        bookingserializer = BookingSerializer(booking, data={}, partial=True)

        if bookingserializer.is_valid():

            if customer_exists:
                bookingserializer.save(customer=customer_exists)

            else:
                customer = serializer.save()
                bookingserializer.save(customer=customer)
                

            return Response(serializer.data)
        else:
            return Response(bookingserializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




'''





import json
import requests
from rest_framework.views import APIView
from rest_framework import viewsets, mixins, generics
from rest_framework.response import Response

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from decimal import Decimal
from rest_framework.generics import get_object_or_404
from .models import Booking, LateCheckOutRequest, Feedback
from .serializers import BookingSerializer, LateCheckOutRequesWithBookingtSerializer, LateCheckOutRequestSerializer, BookingCustomerSerializer, FeedbackSerializer
from .models import Property
#from partner.models import Job
#from payments.models import Payment
import datetime
from rest_framework.permissions import IsAdminUser
from django.db.models.query import QuerySet

class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):

    serializer_class = BookingSerializer
    # queryset = Booking.objects.all()

    def get_queryset(self):
        user = self.request.user
        if (user.is_staff):
            queryset = Booking.objects.all()
        elif (user.role == "OWNER"):
            queryset = Booking.objects.filter(property__owner=user)
            
        if isinstance(queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            queryset = queryset.all()
        return queryset



    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        property_instance = serializer.validated_data['property']
        deposit_amount = serializer.validated_data['deposit_amount']
        if deposit_amount < Decimal('0.00'):
            return Response({"detail": "Deposit amount cannot be negative!"}, status=status.HTTP_400_BAD_REQUEST)
        cleaning_time = datetime.timedelta(hours=float(property_instance.num_cleaning_hours))
        newBooking_start_datetime = datetime.datetime.combine(serializer.validated_data['start_date'],serializer.validated_data['checkin_time'])
        newBooking_end_datetime = datetime.datetime.combine(serializer.validated_data['end_date'],serializer.validated_data['checkout_time'])
        
        if newBooking_start_datetime > newBooking_end_datetime:
            return Response({"detail": "Booking start datetime cannot be greater than end datetime!"}, status=status.HTTP_400_BAD_REQUEST)
        property_bookings = Booking.objects.filter(property=property_instance, status__in=["UPCOMING", "ACTIVE"])
        for prop_booking in property_bookings:
            start_datetime = datetime.datetime.combine(prop_booking.start_date, prop_booking.checkin_time)
            end_datetime = datetime.datetime.combine(prop_booking.end_date, prop_booking.checkout_time)
        
            if ((newBooking_start_datetime <= start_datetime and newBooking_end_datetime + cleaning_time > start_datetime)
            or (newBooking_start_datetime >= start_datetime and newBooking_start_datetime < end_datetime + cleaning_time) ):
                print("Overlap Occured : ")
                print("BookId",prop_booking.id)
                print("Start:",start_datetime)
                print("End:",end_datetime)
                return Response({"detail": "Booking date time overlaps with another booking. Try a different date time."}, status=status.HTTP_400_BAD_REQUEST)

        # self.perform_create(serializer)
        booking = serializer.save()

        
        headers = self.get_success_headers(serializer.data)

        # job = Job(booking=booking)
        # job.save()
        # if booking.deposit_amount == Decimal('0.00'):
        #     payment = Payment(booking=booking, status="NOT_APPLICABLE")
        #     payment.save()
        # else:
        #     payment = Payment(booking=booking)
        #     payment.save()
        

        


        gallabox_endpoint = 'https://server.gallabox.com/accounts/65783429276b79f5c4791d30/integrations/genericWebhook/659e6c7ec73f1fb57fa8e011/webhook'
        #building_ = booking.property.building
        payload = {
            "contact":str(booking.property.partner.contact),
            "type":"new_job",
            "details":{
            "property":str(booking.property.name),
            "booking_uuid":str(booking.uuid),
            #+ str(booking.property.building_name.name) + ", " 
            "partner": str(booking.property.partner.first_name) + " " + str(booking.property.partner.last_name),
            "address":str(booking.property.apt_number) + ", " + str(booking.property.neighbourhood),
            "time":str(booking.checkout_time) + " - " + str(booking.end_date),
            }
        }
        print(json.dumps(payload))
        response = requests.post(gallabox_endpoint, json=json.dumps(payload), headers={"content-type": "application/json"})

        #TODO: Whatsapp Message sent to Partner

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
