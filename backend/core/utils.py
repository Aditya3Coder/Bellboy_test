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


