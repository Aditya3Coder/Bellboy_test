from rest_framework import serializers
from .models import Snippet, LANGUAGE_CHOICES, STYLE_CHOICES


class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Snippet
        fields = ['id','name','Address']


from rest_framework import serializers

from .models import Booking, LateCheckOutRequest, Feedback


class LateCheckOutRequesWithBookingtSerializer(serializers.ModelSerializer):
    class Meta:
        model = LateCheckOutRequest
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):

    property_details = serializers.ReadOnlyField()
    customer_details = serializers.ReadOnlyField()
    payment_details = serializers.ReadOnlyField()
    job_details = serializers.ReadOnlyField()
    late_request = LateCheckOutRequesWithBookingtSerializer(source='check_out_request', read_only=True)
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['customer', 'status']

        
class BookingCustomerSerializer(serializers.ModelSerializer):

    property_details = serializers.ReadOnlyField()
    customer_details = serializers.ReadOnlyField()
    payment_details = serializers.ReadOnlyField()
    entry_key = serializers.ReadOnlyField()
    feedback_submitted = serializers.ReadOnlyField()
    late_request_exist = serializers.ReadOnlyField()
    late_request = LateCheckOutRequesWithBookingtSerializer(source='check_out_request', read_only=True)
    class Meta:
        model = Booking
        fields = [ 'customer', 'start_date', 'end_date', 'checkin_time', 'checkout_time', 'deposit_amount', 'status', 'entry_key', 'payment_details', 'customer_details', 'property_details', 'feedback_submitted','late_request_exist', 'late_request']
        read_only_fields = ['customer', 'status', 'feedback_submitted','late_request_exist', 'late_request']

class BookingSerializerForJob(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['end_date', 'checkout_time', 'status']
        read_only_fields = ['end_date', 'checkout_time', 'status']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'


class LateCheckOutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LateCheckOutRequest
        fields = ['requested_end_date', 'requested_checkout_time']


from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    total_bookings = serializers.ReadOnlyField()
    customer_status = serializers.ReadOnlyField()
    passport_file = serializers.FileField()
    class Meta:
        model = Customer
        fields = '__all__'


from .models import Property

class PropertySerializer(serializers.ModelSerializer):

    occupation_status = serializers.ReadOnlyField()
    cleaning_status = serializers.ReadOnlyField()
    active_booking_id = serializers.ReadOnlyField()
    booking_uuid = serializers.ReadOnlyField()
    class Meta:
        model = Property
        fields = '__all__' 
        read_only_fields = ['user','owner']


class PropertySerializerForJob(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['name', 'apt_number', 'building_name', 'neighbourhood',   'num_bedrooms', 'num_cleaners', 'num_cleaning_hours']
        read_only_fields = ['name', 'apt_number', 'building_name', 'neighbourhood',   'num_bedrooms', 'num_cleaners', 'num_cleaning_hours']

