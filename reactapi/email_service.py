from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, Content
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_verification_email(to_email, verification_code):
    """
    Sends a password reset verification code to the user's email.

    Parameters:
        to_email (str): The recipient's email address.
        verification_code (str): The unique verification code.

    Returns:
        bool: True if the email was sent successfully, False otherwise.
    """
    from_email = settings.DEFAULT_FROM_EMAIL  # Fetch from settings
    subject = 'Password Reset Verification Code'

    # Create the HTML content for the email (customizable)
    html_content = f'''
    <html>
        <body>
            <p>Hello,</p>
            <p>You requested to reset your password. Use the verification code below to reset your password:</p>
            <h3>{verification_code}</h3>
            <p>If you did not request a password reset, please ignore this email.</p>
            <br/>
            <p>Thank you,<br/>Your Company Team</p>
        </body>
    </html>
    '''

    # Create the SendGrid Mail object
    message = Mail(
        from_email=Email(from_email, "DinoDocs"),  # "Your Company" is an optional name for the sender
        to_emails=to_email,
        subject=subject,
        html_content=Content("text/html", html_content)  # Specify content type as HTML
    )

    try:
        # Initialize SendGrid API client
        sg = SendGridAPIClient(settings.EMAIL_HOST_PASSWORD)

        # Send the email and log the response
        response = sg.send(message)

        # Check for successful response status (202 = accepted for delivery)
        if response.status_code == 202:
            logger.info(f"Verification email sent to {to_email}.")
            return True
        else:
            logger.error(f"Failed to send email to {to_email}. Status: {response.status_code}. Body: {response.body}")
            return False
    except Exception as e:
        logger.error(f"Error occurred while sending email to {to_email}: {e}")
        return False
