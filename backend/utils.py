import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_otp_email(to_email, otp_code):
    sender_email = os.environ.get('MAIL_USERNAME')
    sender_password = os.environ.get('MAIL_PASSWORD')
    
    if not sender_email or not sender_password:
        print("MAIL_USERNAME or MAIL_PASSWORD not configured. OTP not sent.")
        return False
        
    subject = "Travel Connect - Your OTP Verification Code"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333;">Verification Code</h2>
            <p style="color: #555; font-size: 16px;">Here is your verification code to proceed with Travel Connect:</p>
            <div style="background-color: #e5e7eb; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <h1 style="color: #1f2937; margin: 0; font-size: 32px; letter-spacing: 5px;">{otp_code}</h1>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
        </div>
      </body>
    </html>
    """
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html, 'html'))
    
    try:
        # Assuming Gmail SMTP here based on "app password" terminology
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
