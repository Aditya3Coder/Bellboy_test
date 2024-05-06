"""rest_frame URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from core import views
from rest_framework.routers import DefaultRouter ,SimpleRouter

router = DefaultRouter()
router.register('property', views.PropertyViewSet, basename='property')
router.register('bookings', views.BookingViewSet, basename='booking')
#router.register('customer/<uuid:uuid>', views.bookings_by_property, basename='create_customer')

urlpatterns = [
    path('admin/', admin.site.urls),
    #path("send_email/",views.send_email_file,name = "send_email"),
    path("customer/<uuid:uuid>", views.CreateCustomerView.as_view(),name='create-customer'),
    #path("send_email_with_attachment/",views.send_email_with_attachment,name = "send_email_with_attachment"),
    path("api_test/", views.studentlist.as_view()),
    path("<int:id>/bookings", views.bookings_by_property),
    path("partners-list/", views.get_available_partners_list),
]
urlpatterns += router.urls