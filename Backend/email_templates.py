def get_password_reset_template(reset_link):
    return '''
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #6b46c1;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #6b46c1;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 4px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">TFC</div>
                </div>
                <h2>Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="''' + reset_link + '''" class="button">Reset Password</a>
                </p>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>This link will expire in 24 hours for security reasons.</p>
                <div class="footer">
                    <p>Training Frequency Calculator Team</p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;">''' + reset_link + '''</p>
                </div>
            </div>
        </body>
    </html>
    '''

def get_username_recovery_template(username):
    return '''
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #6b46c1;
                }
                .username {
                    font-size: 18px;
                    font-weight: bold;
                    color: #6b46c1;
                    text-align: center;
                    padding: 20px;
                    background-color: #f8f4ff;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">TFC</div>
                </div>
                <h2>Your Username Recovery</h2>
                <p>Hello,</p>
                <p>As requested, here is your username for the Training Frequency Calculator:</p>
                <div class="username">
                    ''' + username + '''
                </div>
                <p>You can use this username to log in to your account.</p>
                <div class="footer">
                    <p>Training Frequency Calculator Team</p>
                </div>
            </div>
        </body>
    </html>
    '''
