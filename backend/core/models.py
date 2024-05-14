import datetime
from typing import Any
from django.db import models

class Building(models.Model):
    id =           models.AutoField(primary_key=True)
    name =         models.CharField(max_length=100,blank=False, null=False)
    address =      models.CharField(max_length=255, blank=False, null=False)
    security_email1 = models.EmailField(blank=False, null=False)
    security_email2 = models.EmailField(blank=True, null=True)
    documents = models.FileField(upload_to='building_documents/%Y/%m/%d',blank=True, null=True)

    def __str__(self):
        return self.name
    


    class Building(models.Model):
    id =           models.AutoField(primary_key=True)
    name =         models.CharField(max_length=100,blank=False, null=False)
    address =      models.CharField(max_length=255, blank=False, null=False)
    security_email1 = models.EmailField(blank=False, null=False)
    security_email2 = models.EmailField(blank=True, null=True)
    documents = models.FileField(upload_to='building_documents/%Y/%m/%d',blank=True, null=True)

    def __str__(self):
        return self.name




class Snippet(models.Model):
    name = models.TextField(blank=False,max_length=20)
    Address  = models.TextField(blank=False,max_length=20)


    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
    

def upload_to(instance, filename):
    return 'passports/{filename}'.format(filename=filename)


class Customer(models.Model):
    name = models.TextField()
    email = models.EmailField(max_length=254)
    contact = models.TextField()
    passport_file = models.FileField(upload_to=upload_to)

    @property
    def total_bookings(self):
        print(self.bookings.all())
        return self.bookings.count()

    @property
    def customer_status(self):
        
        active_bookings = self.bookings.filter(status="ACTIVE").first()
        if active_bookings:
            return { "status": "ACTIVE", "active_booking": active_bookings.id}
        else:
            return { "status": "OLDER", "active_booking": None}

from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from core.utils import _validate_gmaps_link

class Property(models.Model):
    class Meta:
        verbose_name_plural = "Properties"

    def __str__(self): 
         return f"{self.name} ({self.neighbourhood})"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owner")
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="partner", null=True)
    name = models.TextField()
    gmaps_link = models.TextField(validators=[_validate_gmaps_link])
    neighbourhood = models.TextField()
    description = models.TextField(null = False)
    building_name = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="Building", null=False)
    apt_number = models.TextField()
    num_bedrooms = models.IntegerField()
    num_cleaners = models.IntegerField()
    num_cleaning_hours = models.DecimalField(decimal_places=1, max_digits=2)
    default_checkin_time = models.TimeField()
    default_checkout_time = models.TimeField()
    default_deposit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    agent_name = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    @property
    def occupation_status(self):
        now = datetime.datetime.now().date()
        upcoming_date = now + datetime.timedelta(days=7)

        active_booking_exists = self.bookings.filter(status="ACTIVE").exists()
        upcoming_booking_exists = self.bookings.filter(status="UPCOMING", start_date__range=[now, upcoming_date]).exists()

        if active_booking_exists:
            return "OCCUPIED"
        elif upcoming_booking_exists:
            return "UPCOMING"
        else:
            return "VACANT"
    
    @property
    def cleaning_status(self):

        if self.bookings.filter(status="ACTIVE").exists():
            return self.bookings.filter(status="ACTIVE").first().jobs.first().status

        if self.bookings.filter(status="AWAITING_CLEANING").exists():
            return self.bookings.filter(status="AWAITING_CLEANING").first().jobs.first().status

        now = datetime.datetime.now()

        if self.bookings.filter(status="UPCOMING", start_date__gte=now.date()).exists():
            return self.bookings.filter(status="UPCOMING", start_date__gte=now.date()).first().jobs.first().status
        
        return False
    
    @property
    def active_booking_id(self):
        if self.bookings.filter(status="ACTIVE").exists():
            return self.bookings.filter(status="ACTIVE").first().id
        
        return False
    
    @property
    def booking_uuid(self):
        if self.bookings.filter(status="ACTIVE").exists():
            return self.bookings.filter(status="ACTIVE").first().uuid
        
        if self.bookings.filter(status="AWAITING_CLEANING").exists():
            return False
        
        now = datetime.datetime.now()
        
        if self.bookings.filter(status="UPCOMING", start_date__gte=now.date()).exists():
            return self.bookings.filter(status="UPCOMING", start_date__gte=now.date()).earliest('start_date').uuid
        
        return False



import uuid
_property = property
class Booking(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="bookings"
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, related_name="bookings")

    uuid = models.UUIDField(default = uuid.uuid4, editable=False, unique=True)
    door_key = models.CharField(max_length=20, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    checkin_time = models.TimeField()
    checkout_time = models.TimeField()
    deposit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.TextField(
        choices=(
            ("UPCOMING", "UPCOMING"),
            ("ACTIVE", "ACTIVE"),
            ("AWAITING_CLEANING", "AWAITING_CLEANING"),
            ("COMPLETED", "COMPLETED"),
            ("CANCELLED", "CANCELLED"),
        ),
        default="UPCOMING",
    )
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    @_property
    def property_details(self):
        try:
            booking_property = self.property
            return {
                "property_gmaps_link": booking_property.gmaps_link,
                "property_name": booking_property.name,
                "apt_number": booking_property.apt_number,
                "neighbourhood": booking_property.neighbourhood,
                "building_name": booking_property.building_name.name
            }
        except:
            return None

    @_property
    def entry_key(self):
        if self.status == "ACTIVE":
            return self.door_key
        else:
            return None
        
    @_property
    def feedback_submitted(self):
        feed = Feedback.objects.filter(booking= self.id)
        if feed:
            return True
        else:
            return False

    @_property
    def customer_details(self):
        try:
            customer =  self.customer
            return {
                "customer_name": customer.name,
                "customer_phone": customer.contact,
            }
        except:
            return None
        

    @_property
    def late_request_exist(self):
        late_request = LateCheckOutRequest.objects.filter(booking_id = self.id)
        if late_request:
            return True
        return False
    

    @_property
    def payment_details(self):
        try:
            payment = self.payment
            return {
                "intent_id": payment.intent_id,
                "paid": float(payment.paid),
                "refunded": float(payment.refunded),
                "status": payment.status,
                "created_on": payment.created_on,
                "last_modified": payment.last_modified,
            }
        except:
            return None
        
    @_property
    def job_details(self):
        try:
            job = self.jobs.first()
            return {
                "id": job.id,
                "status": job.status,
            }
        except:
            return None
    
    def __str__(self):
        return self.property.building_name.name



#from .models import Booking
from .serializers import PropertySerializerForJob
from .serializers import BookingSerializerForJob, LateCheckOutRequesWithBookingtSerializer

class LateCheckOutRequest(models.Model):

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="check_out_request")
    original_end_date = models.DateField()
    requested_end_date = models.DateField()
    original_checkout_time = models.TimeField()
    requested_checkout_time = models.TimeField()
    status = models.TextField(
        choices=(
            ("REQUESTED", "REQUESTED"),
            ("AWAITING_PARTNER_CLEARANCE", "AWAITING_PARTNER_CLEARANCE"),
            ("DECLINED", "DECLINED"),
            ("APPROVED", "APPROVED"),
        ),
        default="REQUESTED",
    )
    job_status = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)




class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    intent_id = models.TextField(null=True)
    paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    refunded = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.TextField(
        choices=( 
            ("PENDING", "PENDING"),
            ("NOT_APPLICABLE", "NOT_APPLICABLE"),
            ("PAID", "PAID"),
            ("REFUNDED", "REFUNDED"),
        ),
        default="PENDING"
    )
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

class User(AbstractUser):
    role = models.TextField(
        choices=( 
            ("OWNER", "OWNER"),
            ("PARTNER", "PARTNER"),
        ),
        default="OWNER"
    )
    contact = models.TextField(null=True)



# Create your models here.
class Job(models.Model):
    class Meta:
        verbose_name_plural = "Jobs"

    def __str__(self): 
         return f"Job # {self.id} (Property # {self.booking.id})"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="jobs")
    status = models.TextField(
        choices=( 
            ("PENDING", "PENDING"),
            ("ACCEPTED", "ACCEPTED"),
            ("DECLINED", "DECLINED"),
            ("ENROUTE", "ENROUTE"),
            ("ARRIVED", "ARRIVED"),
            ("CLEANING", "CLEANING"),
            ("COMPLETED", "COMPLETED"),
            ("CANCELLED", "CANCELLED"),
            ("CHANGED", "CHANGED"),
        ),
        default="PENDING"
    )
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    @property
    def property_details(self):
        serializer = PropertySerializerForJob(self.booking.property)
        return serializer.data
    
    @property
    def booking_details(self):
        serializer = BookingSerializerForJob(self.booking)
        return serializer.data
    
    @property
    def late_checkout_request_details(self):
        late_request = LateCheckOutRequest.objects.filter(booking_id=self.booking_id).first()
        serializer = LateCheckOutRequesWithBookingtSerializer(late_request)
        return serializer.data


class Feedback(models.Model):
    RATINGS = (
        ("Very Satisfied", "Very Satisfied"),
        ("Satisfied", "Satisfied"),
        ("Neutral", "Neutral"),
        ("Dissatisfied", "Dissatisfied"),
        ("Very Dissatisfied", "Very Dissatisfied"),
        ("Excellent", "Excellent"),
        ("Good", "Good"),
        ("Average", "Average"),
        ("Poor", "Poor"),
        ("Very Poor", "Very Poor"),
    )

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="feedbacks"
    )
    overall_satisfaction = models.CharField(max_length=20, choices=RATINGS[0:5])
    cleanliness = models.CharField(max_length=20, choices=RATINGS[5:])
    communication = models.CharField(max_length=20, choices=RATINGS[5:])
    service_quality = models.CharField(max_length=20, choices=RATINGS[5:])
    value_for_money = models.CharField(max_length=20, choices=RATINGS[5:])
    comments = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    @_property
    def property_name(self):
        return self.booking.property.name

