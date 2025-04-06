def get_username_recovery_template(username, app_name="TFC - Training Frequency Calculator"):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #4a90e2;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 0 0 5px 5px;
            }}
            .username {{
                font-size: 24px;
                color: #4a90e2;
                text-align: center;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{app_name}</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You recently requested to recover your username. Here it is:</p>
            <p class="username">{username}</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>The {app_name} Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """

def get_password_reset_template(reset_link, app_name="TFC - Training Frequency Calculator"):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #4a90e2;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 0 0 5px 5px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #4a90e2;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .warning {{
                color: #e74c3c;
                font-size: 14px;
                margin-top: 20px;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{app_name}</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You recently requested to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p class="warning">This password reset link will expire in 24 hours.</p>
            <p>Best regards,<br>The {app_name} Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">{reset_link}</p>
        </div>
    </body>
    </html>
    """
