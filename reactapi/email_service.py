# email_service.py

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings

def send_email(to_email, subject, html_content, sender_email=None, sender_name=None):
    # Configure API key authorization
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY

    # Create an instance of the API class
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # Define the sender
    sender = {"email": sender_email or settings.DEFAULT_FROM_EMAIL, "name": sender_name or "Your App Name"}

    # Create the email object
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        html_content=html_content,
        sender=sender,
        subject=subject
    )

    try:
        # Send the email
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Email sent successfully. API response: {api_response}")
        return True, "Email sent successfully"
    except ApiException as e:
        print(f"Exception when calling SMTPApi->send_transac_email: {e}")
        return False, str(e)
