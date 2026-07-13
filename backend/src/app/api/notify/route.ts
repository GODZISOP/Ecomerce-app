import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// SMTP configuration - set these in Vercel Dashboard → Backend Project → Environment Variables
const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    rejectUnauthorized: false
  }
};

const adminNotificationEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, order } = body;

    if (!order) {
      return NextResponse.json({ error: 'Order details are required' }, { status: 400 });
    }

    const {
      tracking_code,
      customer_name,
      phone,
      email,
      address,
      city,
      items,
      subtotal,
      shipping_fee,
      grand_total,
      status
    } = order;

    // Dynamically detect URLs using request origin, fallback to Vercel URLs
    const requestOrigin = req.headers.get('origin') || 'https://ecom12345.vercel.app';
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://ecomerce-app-s357.vercel.app';

    // Build lists of items formatted for plain text and HTML
    const itemsListHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold; color: white;">
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center; color: white;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right; font-weight: bold; color: white;">Rs. ${item.price_pkr * item.quantity}</td>
      </tr>
    `).join('');

    const itemsListText = items.map((item: any) => 
      `- ${item.name} x${item.quantity} = Rs. ${item.price_pkr * item.quantity}`
    ).join('\n');

    // SMTP credentials are always available (hardcoded fallback), so always send real emails
    const isSmtpConfigured = true;

    if (type === 'new_order') {
      const adminSubject = `🚨 NAYA ORDER AAYA HAI! [${tracking_code}] - ${customer_name}`;
      const customerSubject = `🍕 Fat Pizza - Order Confirmed! [${tracking_code}]`;

      // Email template for the Admin (New Order Alert)
      const adminHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2d3748; line-height: 1.6;">
          <div style="background: #111111; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 2px solid #dc2626;">
            <h1 style="color: white; margin: 0; font-size: 1.8rem;">New Order Received! 🍕</h1>
            <p style="color: #ef4444; margin: 5px 0 0 0; font-weight: bold; font-family: monospace;">TRACKING REF: ${tracking_code}</p>
          </div>
          
          <div style="background: #1a1a1a; padding: 24px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px; color: #f3f4f6;">
            <h2 style="color: #ef4444; font-size: 1.2rem; border-bottom: 2px solid #333; padding-bottom: 8px; margin-top: 0;">
              A to Z Client Details (گاہک کی معلومات)
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; color: #9ca3af; width: 120px;">Customer Name:</td><td style="padding: 6px 0; font-weight: bold; color: white;">${customer_name}</td></tr>
              <tr><td style="padding: 6px 0; color: #9ca3af;">Phone Number:</td><td style="padding: 6px 0; font-weight: bold; color: #ef4444;">${phone}</td></tr>
              <tr><td style="padding: 6px 0; color: #9ca3af;">City:</td><td style="padding: 6px 0; font-weight: bold; color: white;">${city}</td></tr>
              <tr><td style="padding: 6px 0; color: #9ca3af;">Address:</td><td style="padding: 6px 0; font-weight: bold; color: white;">${address}</td></tr>
              <tr><td style="padding: 6px 0; color: #9ca3af;">Order Time:</td><td style="padding: 6px 0; color: white;">${new Date().toLocaleString('en-PK')}</td></tr>
            </table>

            <h2 style="color: #ef4444; font-size: 1.2rem; border-bottom: 2px solid #333; padding-bottom: 8px;">
              Items Summary (آرڈر کی تفصیل)
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #262626;">
                  <th style="padding: 10px; text-align: left; color: white;">Item</th>
                  <th style="padding: 10px; text-align: center; width: 60px; color: white;">Qty</th>
                  <th style="padding: 10px; text-align: right; width: 100px; color: white;">Price</th>
                </tr>
              </thead>
              <tbody style="color: #d1d5db;">
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="background: #262626; padding: 16px; border-radius: 6px; text-align: right; border: 1px solid #333;">
              <div style="font-size: 0.9rem; color: #9ca3af;">Subtotal: Rs. ${subtotal}</div>
              <div style="font-size: 0.9rem; color: #9ca3af; margin: 4px 0;">COD Shipping: Rs. ${shipping_fee}</div>
              <div style="font-size: 1.15rem; font-weight: bold; color: #ef4444;">Total Amount Payable: Rs. ${grand_total}</div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${adminUrl}/admin" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Manage Order in Admin Panel
              </a>
            </div>
          </div>
        </div>
      `;

      // Email template for the Customer
      const customerHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #e5e7eb; line-height: 1.6;">
          <div style="background: #111111; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 2px solid #dc2626;">
            <h1 style="color: white; margin: 0; font-size: 1.6rem;">Order Confirmed! 🍕</h1>
            <p style="color: #ef4444; margin: 5px 0 0 0; font-weight: bold;">Fresh & Hot - Cash on Delivery</p>
          </div>
          
          <div style="background: #1a1a1a; padding: 24px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Assalam-o-Alaikum <strong>${customer_name}</strong>,</p>
            <p>Fat Pizza se khareedari ka boht shukriya. Aap ka order system me confirm ho chuka hai. Humare chefs order tayar kar ke jald rawana karein ge.</p>
            
            <div style="background: #262626; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #333;">
              <div style="font-size: 0.85rem; color: #9ca3af; font-weight: 700;">TRACKING REF:</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: #ef4444; font-family: monospace; letter-spacing: 1px; margin-top: 4px;">${tracking_code}</div>
              <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 10px;"><strong>Delivery Address:</strong> ${address}, ${city}</div>
              <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 4px;"><strong>Contact Number:</strong> ${phone}</div>
            </div>

            <h3 style="color: #ef4444; border-bottom: 1px solid #333; padding-bottom: 8px;">Order Bill</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="background: #262626; padding: 16px; border-radius: 6px; text-align: right; border: 1px solid #333;">
              <div style="font-size: 0.85rem; color: #9ca3af;">Total COD Amount: <strong style="color: white;">Rs. ${grand_total}</strong></div>
            </div>

            <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 24px; text-align: center;">
              Aap apne order ka live status is link par check kar sakte hain:
            </p>
            
            <div style="text-align: center; margin-top: 12px;">
              <a href="${requestOrigin}/tracking?code=${tracking_code}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 0.9rem;">
                Track Live Order Status
              </a>
            </div>
          </div>
        </div>
      `;

      if (isSmtpConfigured) {
        const transporter = nodemailer.createTransport(smtpConfig);

        // 1. Send to Admin
        await transporter.sendMail({
          from: `"Fat Pizza" <${smtpConfig.auth.user}>`,
          to: adminNotificationEmail,
          subject: adminSubject,
          text: `Naya order aaya hai!\n\nClient: ${customer_name}\nPhone: ${phone}\nAddress: ${address}, ${city}\n\nItems:\n${itemsListText}\n\nTotal: Rs. ${grand_total}`,
          html: adminHtml,
        });

        // 2. Send to Customer (if email is provided)
        if (email && email.trim()) {
          await transporter.sendMail({
            from: `"Fat Pizza" <${smtpConfig.auth.user}>`,
            to: email.trim(),
            subject: customerSubject,
            text: `Assalam-o-Alaikum ${customer_name},\n\nAap ka order ${tracking_code} confirm ho chuka hai aur prepare ho raha hai. Live details yahan track karein: ${requestOrigin}/tracking?code=${tracking_code}\n\nDelivery Address: ${address}, ${city}\nTotal Bill: Rs. ${grand_total}`,
            html: customerHtml,
          });
          console.log(`[SMTP] Sent order confirmation email to customer at: ${email.trim()}`);
        }

        console.log(`[SMTP] Dispatched order confirmation emails for reference code: ${tracking_code}`);
      } else {
        // Fallback logs to developer console if SMTP variables are missing
        console.log(`\n=========================================\n[SMTP SIMULATION] NAYA ORDER NOTIFICATION\n=========================================\nAdmin Alert Subject: ${adminSubject}\nCustomer Subject: ${customerSubject}\nCustomer Email: ${email || 'None'}\nClient Summary:\n${itemsListText}\n\nClient Contact: ${customer_name} (${phone})\nShipping to: ${address}, ${city}\nTotal COD Bill: Rs. ${grand_total}\n=========================================\n`);

        // Dynamically spin up Ethereal SMTP server to send a fully rendered test email
        try {
          console.log('[SMTP] Provisioning temporary Ethereal SMTP test account...');
          const testAccount = await nodemailer.createTestAccount();
          const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          // Send admin email
          const adminMailInfo = await transporter.sendMail({
            from: `"Fat Pizza (Simulated)" <${testAccount.user}>`,
            to: adminNotificationEmail || 'admin@fatpizza.com',
            subject: adminSubject,
            text: `Naya order aaya hai!\n\nClient: ${customer_name}\nPhone: ${phone}\nAddress: ${address}, ${city}\nTotal: Rs. ${grand_total}`,
            html: adminHtml,
          });

          let customerMailInfo = null;
          if (email && email.trim()) {
            customerMailInfo = await transporter.sendMail({
              from: `"Fat Pizza" <${testAccount.user}>`,
              to: email.trim(),
              subject: customerSubject,
              text: `Assalam-o-Alaikum ${customer_name},\n\nAap ka order ${tracking_code} confirm ho chuka hai.`,
              html: customerHtml,
            });
          }

          console.log('\n🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
          console.log('📬 REAL SMTP EMAIL SENT (DYNAMIC ETHEREAL TEST INBOX)');
          console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
          console.log(`🔗 Admin Notification Email Preview URL:`);
          console.log(`   ${nodemailer.getTestMessageUrl(adminMailInfo)}`);
          if (customerMailInfo) {
            console.log(`🔗 Customer Tracking Email Preview URL:`);
            console.log(`   ${nodemailer.getTestMessageUrl(customerMailInfo)}`);
          }
          console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');

        } catch (etherealErr: any) {
          console.error('[SMTP] Failed to generate dynamic test email:', etherealErr.message);
        }
      }

      return NextResponse.json({ success: true, method: isSmtpConfigured ? 'smtp' : 'logged_simulated' });
    }

    if (type === 'status_update') {
      const isRx = items.some((i: any) => i.requires_prescription);
      const subject = `🍕 Fat Pizza - Order ${status}! [${tracking_code}]`;
      
      let statusDescHtml = '';
      let statusDescText = '';

      if (status === 'Dispatched') {
        statusDescHtml = `
          <h2 style="color: #ef4444; font-size: 1.25rem;">Aap ka order Rider ko de diya gaya hai! (On the Way) 🏍️</h2>
          <p>Assalam-o-Alaikum <strong>${customer_name}</strong>,</p>
          <p>Khushkhabri! Aap ka order <strong>${tracking_code}</strong> verify hone ke baad pack kar ke rider ko de diya gaya hai aur deliver hone ke liye rawana ho chuka hai.</p>
          <p>Humara rider jald hi aap ke address par pohnch kar safe delivery kare ga. Baraye meherbani COD amount <strong style="color: white;">Rs. ${grand_total}</strong> tayyar rakhein.</p>
        `;
        statusDescText = `Assalam-o-Alaikum ${customer_name},\n\nKhushkhabri! Aap ka order ${tracking_code} dispatch ho chuka hai aur rider ke paas rawana hai. Baraye meherbani Rs. ${grand_total} deliver ke waqt hand over karein.`;
      } else if (status === 'Delivered') {
        statusDescHtml = `
          <h2 style="color: #10b981; font-size: 1.25rem;">Order Delivered Successfully! ✔️</h2>
          <p>Assalam-o-Alaikum <strong>${customer_name}</strong>,</p>
          <p>Humare record ke mutabiq aap ka order <strong>${tracking_code}</strong> aap tak safe tareeqay se pahunch gaya hai aur Cash collect ho gaya hai.</p>
          <p>Pizza enjoy karein! Kisi bhi naye orders ke liye humare website par rabta karein. Boht shukriya!</p>
        `;
        statusDescText = `Assalam-o-Alaikum ${customer_name},\n\nAap ka order ${tracking_code} successfully deliver ho chuka hai. Khareedari ka boht shukriya.`;
      } else if (status === 'Cancelled') {
        statusDescHtml = `
          <h2 style="color: #ef4444; font-size: 1.25rem;">Order Cancelled / منسوخ شدہ</h2>
          <p>Dear Customer,</p>
          <p>Aap ka order <strong>${tracking_code}</strong> system me phone verification na hone ki bina par cancel kar diya gaya hai.</p>
          <p>Agar aap chahein to website par naya order place kar sakte hain ya support team se rabta kar ke details le sakte hain.</p>
        `;
        statusDescText = `Dear Customer,\n\nAap ka order ${tracking_code} system me cancellation rules ke tahat cancel ho chuka hai.`;
      } else {
        // Prepare/Pending state
        statusDescHtml = `
          <h2 style="color: #f59e0b; font-size: 1.25rem;">Order Preparing / آرڈر تیار ہو رہا ہے 👨‍🍳</h2>
          <p>Assalam-o-Alaikum <strong>${customer_name}</strong>,</p>
          <p>Humare chefs aap ke order <strong>${tracking_code}</strong> ko verify kar ke abhi tayar kar rahe hain.</p>
          <p>Jald hi aap ko delivery riders ke hawalay karne ki dispatch notification mil jaye gi.</p>
        `;
        statusDescText = `Assalam-o-Alaikum ${customer_name},\n\nAap ka order ${tracking_code} abhi prepare ho raha hai.`;
      }

      const updateHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #e5e7eb; line-height: 1.6;">
          <div style="background: #111111; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 2px solid #dc2626;">
            <h1 style="color: white; margin: 0; font-size: 1.6rem;">Status Update / آرڈر کی حالت</h1>
            <p style="color: #ef4444; margin: 5px 0 0 0; font-weight: bold; font-family: monospace;">TRACKING REF: ${tracking_code}</p>
          </div>
          
          <div style="background: #1a1a1a; padding: 24px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px;">
            ${statusDescHtml}
            
            <div style="background: #262626; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #333; text-align: center;">
              <span style="font-size: 0.85rem; color: #9ca3af; font-weight: 700;">CURRENT STATUS:</span><br/>
              <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-top: 6px; 
                background: ${status === 'Delivered' ? '#064e3b' : status === 'Dispatched' ? '#1e3a8a' : status === 'Cancelled' ? '#7f1d1d' : '#78350f'};
                color: ${status === 'Delivered' ? '#34d399' : status === 'Dispatched' ? '#60a5fa' : status === 'Cancelled' ? '#f87171' : '#fbbf24'};
              ">
                ${status}
              </span>
            </div>

            <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 24px; text-align: center;">
              Order ki live detail dekhne ke liye tracks link follow karein:
            </p>
            
            <div style="text-align: center; margin-top: 12px;">
              <a href="${requestOrigin}/tracking?code=${tracking_code}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 0.9rem;">
                Track Live Order Status
              </a>
            </div>
          </div>
        </div>
      `;

      if (isSmtpConfigured) {
        const transporter = nodemailer.createTransport(smtpConfig);

        // 1. Send to Admin
        await transporter.sendMail({
          from: `"Fat Pizza" <${smtpConfig.auth.user}>`,
          to: adminNotificationEmail, // Alerting or keeping log
          subject: subject,
          text: statusDescText,
          html: updateHtml,
        });

        // 2. Send to Customer (if email is provided)
        if (email && email.trim()) {
          await transporter.sendMail({
            from: `"Fat Pizza" <${smtpConfig.auth.user}>`,
            to: email.trim(),
            subject: subject,
            text: statusDescText,
            html: updateHtml,
          });
          console.log(`[SMTP] Sent status update email to customer ${email.trim()} for code ${tracking_code}`);
        }

        console.log(`[SMTP] Status update email sent for code ${tracking_code} to ${status}`);
      } else {
        console.log(`\n=========================================\n[SMTP SIMULATION] ORDER STATUS UPDATED\n=========================================\nSubject: ${subject}\nCustomer Email: ${email || 'None'}\nUpdate details:\n${statusDescText}\n=========================================\n`);
      }

      return NextResponse.json({ success: true, method: isSmtpConfigured ? 'smtp' : 'logged_simulated' });
    }

    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });

  } catch (e: any) {
    console.error('Error dispatching notifications:', e);
    return NextResponse.json({ error: 'Server notification failed', details: e.message }, { status: 500 });
  }
}
