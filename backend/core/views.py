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


def send_email_file(request):
    
    subject  = "hello"
    message = "hey there im using whatsapp"
    from_email  = settings.EMAIL_HOST_USER
    recipient_list = ["aditya01256@gmail.com"]
    x = Snippet.objects.filter(title = "name")
    x[0].file
    #send_mail(subject,message,from_email,recipient_list,fail_silently=False)
    return HttpResponse("mail send")


def send_email_with_attachment(request):


    subject  = "hello"
    message = "hey there im using whatsapp"
    from_email  = settings.EMAIL_HOST_USER

    recipient_list = ["aditya01256@gmail.com"]

    attachments = [f"{settings.BASE_DIR}/db.sqlite3",f"{settings.BASE_DIR}/manage.py"]
    email_ = EmailMessage(subject=subject,body=message,from_email=from_email,to=recipient_list)
    for attachment in attachments:
        email_.attach_file(attachment)
    email_.send()
    return HttpResponse("mail send with attachment")


# from rest_framework.views import APIView
# from rest_framework import viewsets, mixins
# from rest_framework.response import Response
# from core import permissions
# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAdminUser
# from .serializers import PropertySerializer
# from .models import Property
# from .models import Booking
# from .serializers import BookingSerializer
# from django.db.models.query import QuerySet
# from core.models import User

# class PropertyViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
#     permission_classes = [IsAdminUser|permissions.IsPropertyOwner,]
#     serializer_class = PropertySerializer
#     # queryset = Property.objects.all()

#     def perform_create(self, serializer):
#         serializer.save(owner=self.request.user)

#     def get_queryset(self):
#         user = self.request.user
#         if (user.is_staff):
#             queryset = Property.objects.all()
#         elif (user.role == "OWNER"):
#             queryset = Property.objects.filter(owner=user)
            
#         if isinstance(queryset, QuerySet):
#             # Ensure queryset is re-evaluated on each request.
#             queryset = queryset.all()
#         return queryset


# @api_view(['GET'])
# @permission_classes([IsAdminUser|permissions.IsPropertyOwner,])
# def bookings_by_property(request, id):
#     queryset = Booking.objects.filter(property=id)
#     serializer = BookingSerializer(queryset, many=True)
#     return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAdminUser|permissions.IsPropertyOwner,])
# def get_available_partners_list(request):
#     partners_list = User.objects.filter(role="PARTNER").values('username','id')
    
#     return Response(partners_list)