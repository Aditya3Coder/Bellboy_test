from django.core.mail import BadHeaderError, send_mail
from django.conf import settings


def send_email_to_clent():
    sunject  = ""
    msg = ""
    from_email  = settings.EMAIL_HOST_USER
    recipient_list = ["aditya01256@gmail.com"]

    send_mail(subject=sunject,message=msg,from_email=from_email,recipient_list=recipient_list)


import re

def _validate_gmaps_link(value: str) -> None:
    must_match = r"(https:\/\/maps.app.goo.gl\/\w*)"
    matches = re.findall(must_match, value)
    if len(matches) != 1:
        raise ValueError(f"{value=} does not match {must_match=}")
    if matches[0] != value:
        raise ValueError(f"{value=} does not match {must_match=}")



from django.core.mail import send_mail, EmailMessage
from django.http import HttpResponse
from core.models import Building,Customer, Snippet
def send_email_with_attachment(building_id , customer_id):
    building = Building.objects.filter(id = building_id).first()
    customer = Customer.objects.filter(id = customer_id).first()

    subject  = f"New Booking for Building {building.name}"
    message1 = f"Dear Sir, Hope this email finds you well.Here is the new customer {customer.name} have booked room in your building. please find the attached documents and information about the Customer"
    message2 = f"\n{customer.name}\n{customer.email}\n{customer.contact}"
    from_email  = settings.EMAIL_HOST_USER
    message = message1+message2
    recipient_list = [f"{building.security_email1}" , f"{building.security_email2}"]

    
    
    
    email_ = EmailMessage(subject=subject,body=message,from_email=from_email,to=recipient_list)
    

    if customer.passport_file:
        email_.attach(customer.passport_file.name, customer.passport_file.read())  # Attach file contents
    else:
        print("Customer does not have a passport file attached.")

    email_.send()
    print("mail send with attachment Successfully")





def send_email_file(request):
    subject  = "hello"
    message = "hey there im using whatsapp"
    from_email  = settings.EMAIL_HOST_USER
    recipient_list = ["aditya01256@gmail.com"]
    x = Snippet.objects.filter(title = "name")
    x[0].file
    #send_mail(subject,message,from_email,recipient_list,fail_silently=False)
    return HttpResponse("mail send")




