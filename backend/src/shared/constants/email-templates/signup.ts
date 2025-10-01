export const signupEmailTemplate = {
  subject: 'Welcome to Our Chat App! 🎉',

  html: (name: string, verificationLink: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Chat App</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          font-size: 18px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .features {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .features h3 {
          color: #495057;
          margin-top: 0;
          font-size: 16px;
        }
        .features ul {
          margin: 0;
          padding-left: 20px;
        }
        .features li {
          margin-bottom: 8px;
          color: #6c757d;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }
        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #e9ecef;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          color: #667eea;
          text-decoration: none;
          margin: 0 10px;
        }
        .emoji {
          font-size: 24px;
          margin: 0 10px;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Chat App! 🎉</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <strong>Congratulations, ${name}!</strong>
          </div>
          
          <p>We're absolutely thrilled to have you join our community! You've just taken the first step into a world of seamless communication and meaningful connections.</p>
          
          <div class="features">
            <h3>🚀 What's waiting for you:</h3>
            <ul>
              <li>💬 Real-time messaging with friends and colleagues</li>
              <li>🔒 Secure and private conversations</li>
              <li>👥 Create and join group chats</li>
              <li>📱 Cross-platform synchronization</li>
              <li>🎨 Customizable chat themes and settings</li>
            </ul>
          </div>
          
          <p>To get started, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">
              ✅ Verify My Email Address
            </a>
          </div>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <p>Once verified, you'll have full access to all our features and can start connecting with people right away!</p>
          
          <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email, and we'll get back to you as soon as possible.</p>
          
          <p>Welcome aboard! <span class="emoji">🚀</span></p>
          
          <p>Best regards,<br>
          <strong>The Chat App Team</strong></p>
        </div>
        
        <div class="footer">
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
          
          <div class="social-links">
            <a href="#">Privacy Policy</a> |
            <a href="#">Terms of Service</a> |
            <a href="#">Contact Support</a>
          </div>
          
          <p>© 2025 Chat App. All rights reserved.</p>
          <p>You're receiving this email because you signed up for Chat App.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  text: (name: string, verificationLink: string) => `
    🎉 Welcome to Chat App, ${name}! 🎉
    
    Congratulations! We're thrilled to have you join our community.
    
    What's waiting for you:
    • Real-time messaging with friends and colleagues
    • Secure and private conversations  
    • Create and join group chats
    • Cross-platform synchronization
    • Customizable chat themes and settings
    
    To get started, please verify your email address by visiting:
    ${verificationLink}
    
    Important: This verification link will expire in 24 hours for security reasons.
    
    Once verified, you'll have full access to all our features and can start connecting with people right away!
    
    If you have any questions or need assistance, our support team is here to help. Just reply to this email.
    
    Welcome aboard! 🚀
    
    Best regards,
    The Chat App Team
    
    ---
    © 2025 Chat App. All rights reserved.
    You're receiving this email because you signed up for Chat App.
  `,
};

export default signupEmailTemplate;
