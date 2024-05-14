from rest_framework import serializers
# from .models import LANGUAGE_CHOICES, STYLE_CHOICES , Building
#from .models import Booking,Building, Snippet, Customer, Payment, User, Property, LateCheckOutRequest, Feedback

from .models import Snippet
class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Snippet
        fields = ['id','name','Address']

from .models import Building
class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ['id', 'name', 'address', 'security_email1', 'security_email2', 'documents']

    def create(self, validated_data):
        return Building.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.address = validated_data.get('address', instance.address)
        instance.security_email1 = validated_data.get('security_email1', instance.security_email1)
        instance.security_email2 = validated_data.get('security_email2', instance.security_email2)
        instance.documents = validated_data.get('documents', instance.documents)
        instance.save()
        return instance
    

class LateCheckOutRequesWithBookingtSerializer(serializers.ModelSerializer):
    class Meta:
        model = "core.LateCheckOutRequest"
        fields = '__all__'


from .models import Booking
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
        model = "core.Feedback"
        fields = '__all__'


class LateCheckOutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = "core.LateCheckOutRequest"
        fields = ['requested_end_date', 'requested_checkout_time']

from .models import Customer,Property


class CustomerSerializer(serializers.ModelSerializer):
    total_bookings = serializers.ReadOnlyField()
    customer_status = serializers.ReadOnlyField()
    #passport_file = serializers.FileField()
    class Meta:
        model = Customer
        fields = '__all__'


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
    Building = BuildingSerializer()
    class Meta:
        model = Property
        fields = ['name', 'apt_number', 'building_name', 'neighbourhood',   'num_bedrooms', 'num_cleaners', 'num_cleaning_hours']
        read_only_fields = ['name', 'apt_number', 'building_name', 'neighbourhood',   'num_bedrooms', 'num_cleaners', 'num_cleaning_hours']

