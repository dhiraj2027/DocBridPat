import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)



// Base HTML email template
const baseTemplate = (content) => `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset='utf-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            <title>DocBridPat</title>

            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #f9fafb;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 560px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .header {
                    background: #2563eb;
                    padding: 24px 32px;
                }

                .header h1 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                }

                .body {
                    padding: 32px;
                    color: #374151;
                    line-height: 1.6;
                }

                .body p {
                    margin: 0 0 16px;
                    font-size: 15px;
                }

                .info-box {
                    background: #f3f4f6;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 14px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .info-label {
                    color: #6b7280;
                    margin-right: 6px;
                }

                .info-value {
                    font-weight: 600;
                    color: #111827;
                }

                .btn {
                    display: inline-block;
                    background: #2563eb;
                    color: #ffffff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    margin: 8px 0;
                }

                .footer {
                    padding: 20px 32px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    font-size: 12px;
                    color: #9ca3af;
                }

                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .badge-success {
                    background: #dcfce7;
                    color: #16a34a;
                }

                .badge-warning {
                    background: #fef9c3;
                    color: #ca8a04;
                }

                .badge-danger {
                    background: #fee2e2;
                    color: #dc2626;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DocBridPat</h1>
                </div>
                <div class="body">
                    ${content}
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} DocBridPat. All rights reserved.<br />
                    This is an automated email. Please do not reply.
                </div>
            </div>
        </body>
    </html>
`


// Send email helper
export const sendEmail = async ({ to, subject, html }) => {
    try {
       
        const data = await resend.emails.send({
            from: "DocBridPat <onboarding@resend.dev>",
            to,
            subject,
            html
        })
        console.log(`Email sent to ${to}: ${subject}`);
        
    } catch (error) {
        // Log but don't crash the app if email fails
        console.error('Email send error:', error.message);   
    }
}


// Email templates
// Welcome email after registration
export const sendWelcomeEmail = async (user) => {
    const content = `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Welcome to DocBridPat! Your account has been created successfully.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${user.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${user.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Role:</span>
                <span class="info-value" style="text-transform: capitalize">${user.role}</span>
            </div>
        </div>
        ${ user.role === 'patient'
            ? '<p>You can now browse doctors and book appointments.</p>'
            : '<p>Please complete your doctor profile to start consulting patients.</p>'
        }
        <p>Thank you for joining DocBridPat!</p>
    `

    await sendEmail({
        to: user.email,
        subject: 'Welcome to DocBridPat!',
        html: baseTemplate(content)
    })
}


// Appointment booking confirmation (to patient)
export const sendAppointmentConfirmationEmail = async ( patient, doctor, appointment ) => {
    const content = `
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>Your appointment has been booked successfully.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Doctor:</span>
                <span class="info-value">Dr. ${doctor.user?.name || doctor.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Specialization:</span>
                <span class="info-value">${doctor.specialization}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-warning">Pending</span>    
                </span>
            </div>
        </div>
        <p>Please join the consultation on time. You can join from your appointments page.</p>
    `

    await sendEmail({
        to: patient.email,
        subject: 'Appointment Booked - DocBridPat',
        html: baseTemplate(content)
    })
}

// Appointment Confirmed (to patient)
export const sendAppointmentConfirmedEmail = async ( patient, doctor, appointment ) => {
    const content = `
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>Good news! Your appointment has been <strong>confirmed</strong> by the doctor.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Doctor:</span>
                <span class="info-value">Dr. ${doctor.user?.name || doctor.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-success">Confirmed</span>    
                </span>
            </div>
        </div>
        <p>Please join the consultation on time from your appointments page.</p>
    `

    await sendEmail({
        to: patient.email,
        subject: 'Appointment Confirmed - DocBridPat',
        html: baseTemplate(content)
    })
}

// New appointment notification (to doctor)
export const sendNewAppointmentNotificationEmail = async ( doctorUser, patient, appointment ) => {
    const content = `
        <p>Hi <strong>Dr. ${doctorUser.name}</strong>,</p>
        <p>You have a new appointment booked by a patient.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Patient:</span>
                <span class="info-value">${patient.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Patient Email:</span>
                <span class="info-value">${patient.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            ${appointment.reasonForVisit
                ? `<div class="info-row">
                        <span class="info-label">Reason:</span>
                        <span class="info-value">${appointment.reasonForVisit}</span>
                    </div>`
                : ''
            }
        </div>
        <p>Please be available at the scheduled time for the video consultation.</p>
    `

    await sendEmail({
        to: doctorUser.email,
        subject: 'New Appointment - DocBridPat',
        html: baseTemplate(content)
    })
}


// Appointment cancellation email (to patient)
export const sendCancellationEmail = async (patient, appointment, isRefundEligible) => {
    const content = `
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>Your appointment has been cancelled.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-danger">Cancelled</span>
                </span>
            </div>
        </div>
        ${isRefundEligible
            ? '<p>1 credit has been refunded to your account.</p>' 
            : '<p>No credit refund applied - cancellation was made less than 24 hours before the appointment.</p>'

        }
        <p>You can book another appointment from the doctors page.</p>
    `

    await sendEmail({
        to: patient.email,
        subject: 'Appointment Cancelled - DocBridPat',
        html: baseTemplate(content)
    })
}


// Doctor approved email
export const sendDoctorApprovedEmail = async (doctorUser) => {
    const content = `
        <p>Hi <strong>Dr. ${doctorUser.name}</strong>,</p>
        <p>Congratulations! Your doctor profile has been reviewed and <strong>approved</strong> by our admin team.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-success">Approved</span>
                </span>
            </div>
        </div>
        <p>You can now:</p>
        <ul style="font-size:15px; color:#374151; line-height:2">
            <li>Set your availability slots</li>
            <li>Accept patient appointments</li>
            <li>Conduct video consultations</li>
            <li>Request earnings withdrawals</li>
        </ul>
        <p>Log in to your dashboard to get started.</p>
    `

    await sendEmail({
        to: doctorUser.email,
        subject: 'Profile Approved - DocBridPat',
        html: baseTemplate(content)
    })
}


// Withdrawal request status email (to doctor)
export const sendWithdrawalStatusEmail = async (doctorUser, withdrawal) => {
    const statusBadge = 
        withdrawal.status === 'paid' 
            ? '<span class="badge badge-success">Paid</span>'
            : withdrawal.status === 'approved' 
                ? '<span class="badge badge-warning">Approved</span>'
                : '<span class="badge badge-danger">Rejected</span>'
    
    const content = `
        <p>Hi <strong>Dr. ${doctorUser.name}</strong>,</p>
        <p>Your withdrawal request has been updated.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Amount:</span>
                <span class="info-value">${withdrawal.amount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${statusBadge}</span>
            </div>
            ${withdrawal.notes 
                ? `<div class="info-row">
                        <span class="info-label">Admin Notes:</span>
                        <span class="info-value">${withdrawal.notes}</span>
                    </div>`
                : ''
            }
        </div>
        ${withdrawal.status === 'paid'
            ? '<p>The amount has been processed. Please allow 2-3 business days for bank transfer.</p>'
            : withdrawal.status === 'rejected'
                ? '<p>If you have questions, please contact our support team.</p>'
                : '<p>Your withdrawal request is approved and will be processed soon.</p>'
        }        
    `

    await sendEmail({
        to: doctorUser.email,
        subject: `Withdrawal ${withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)} - DocBridPat`,
        html: baseTemplate(content)
    })
}


// Doctor missed the appointment email (to patient)
export const sendDoctorMissedEmail = async (patient, appointment) => {
    const content = `
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>We're sorry to inform you that the doctor was unable to attend your scheduled consultation.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-danger">Missed</span>
                </span>
            </div>
        </div>
        <p>1 credit has been refunded to your account. We apologize for the inconvenience.</p>
        <p>You can book another appointment from the doctors page.</p>
    `

    await sendEmail({
        to: patient.email,
        subject: 'Appointment Missed by Doctor - DocBridPat',
        html: baseTemplate(content)
    })
}


// Appointment Completed email (to patient)
export const sendAppointmentCompletedEmail = async (patient, doctor, appointment) => {
    const content = `
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>Your consultation has been completed.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Doctor:</span>
                <span class="info-value">Dr. ${doctor.user?.name || doctor.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointment.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="badge badge-success">Completed</span>
                </span>
            </div>

            ${appointment.notes
                ? `<div class="info-row">
                        <span class="info-label">Doctor's Notes:</span>
                        <span class="info-value">${appointment.notes}</span>
                    </div>`
                : ''
            }
        </div>
        <p>Thank you for using DocBridPat. We hope your consultation was helpful.</p>
    `

    await sendEmail({
        to: patient.email,
        subject: 'Consultation Completed - DocBridPat',
        html: baseTemplate(content)
    })
}



// OTP verification email
export const sendOTPEmail = async (user, otp) => {
    const content = `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Please verify your email address to complete your DocBridPat registration.</p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="
                display: inline-block;
                background: #eff6ff;
                border: 2px dashed #2563eb;
                border-radius: 16px;
                padding: 24px 40px;
            ">
                <p style="
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: 12px;
                    color: #1d4ed8;
                    margin: 0;
                    font-family: monospace;
                ">${otp}</p>  
            </div>
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Valid for</span>
                <span class="info-value">10 minutes</span>
            </div>
            <div class="info-row">
                <span class="info-label">One-time use.</span>
                <span class="info-value">Do not share this code.</span>
            </div>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
            If you did not create a DocBridPat account, please ignore this email.
        </p>
    `

    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - DocBridPat',
        html: baseTemplate(content)
    })
}


// Resend OTP email
export const sendResendOTPEmail = async (user, otp) => {
    const content = `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested a new verification code. Here is your new OTP:</p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="
                display: inline-block;
                background: #eff6ff;
                border: 2px dashed #2563eb;
                border-radius: 16px;
                padding: 24px 40px;
            ">
                <p style="
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: 12px;
                    color: #1d4ed8;
                    margin: 0;
                    font-family: monospace;
                ">${otp}</p>  
            </div>
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Valid for</span>
                <span class="info-value">10 minutes</span>
            </div>
            <div class="info-row">
                <span class="info-label">Previous OTP</span>
                <span class="info-value">Expired immediately</span>
            </div>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
            If you did not request this, please secure your account.
        </p>
    `

    await sendEmail({
        to: user.email,
        subject: 'New Verification Code - DocBridPat',
        html: baseTemplate(content)
    })
}