export const getBaseLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${title}</title>
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            background-color: #f2f2f7;
            color: #1d1d1f;
        }

        /* Light Mode (Default) Variables */
        .wrapper { background-color: #f2f2f7; }
        .card { 
            background-color: #ffffff; 
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            color: #1d1d1f;
        }
        .header-text { color: #1d1d1f; }
        .secondary-text { color: #86868b; }
        .divider { border-color: rgba(0,0,0,0.05); }
        .header-border { border-right: 1px solid rgba(0,0,0,0.1); }
        .status-box { background-color: rgba(0,0,0,0.03); }

        /* Dark Mode Overrides */
        @media (prefers-color-scheme: dark) {
            body, .wrapper { background-color: #000000 !important; }
            .card { 
                background-color: #1c1c1e !important; 
                border: 1px solid rgba(255,255,255,0.1) !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
                color: #f5f5f7 !important;
            }
            .header-text { color: #f5f5f7 !important; }
            .secondary-text { color: #a1a1a6 !important; }
            .divider { border-color: rgba(255,255,255,0.1) !important; }
            .header-border { border-right: 1px solid rgba(255,255,255,0.15) !important; }
            .status-box { 
                background-color: #2c2c2e !important; 
                border: 1px solid rgba(255,255,255,0.1) !important; 
            }
            h1, h2, h3, p, td { color: #f5f5f7 !important; }
            .badge-text { color: #ffffff !important; }
        }

        /* Gmail-specific Dark Mode Overrides */
        [data-ogsc] body, [data-ogsc] .wrapper { background-color: #000000 !important; }
        [data-ogsc] .card { 
            background-color: #1c1c1e !important; 
            border: 1px solid rgba(255,255,255,0.1) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
            color: #f5f5f7 !important;
        }
        [data-ogsc] .header-text { color: #f5f5f7 !important; }
        [data-ogsc] .secondary-text { color: #a1a1a6 !important; }
        [data-ogsc] .divider { border-color: rgba(255,255,255,0.1) !important; }
        [data-ogsc] .header-border { border-right: 1px solid rgba(255,255,255,0.15) !important; }
        [data-ogsc] .status-box { 
            background-color: #2c2c2e !important; 
            border: 1px solid rgba(255,255,255,0.1) !important; 
        }
        [data-ogsc] h1, [data-ogsc] h2, [data-ogsc] h3, [data-ogsc] p, [data-ogsc] td { color: #f5f5f7 !important; }
        [data-ogsc] .badge-text { color: #ffffff !important; }

        /* Mobile Optimization */
        @media only screen and (max-width: 600px) {
            .card { 
                padding: 24px 20px !important; 
                margin: 12px auto !important; 
                width: 94% !important; 
                border-radius: 16px !important;
            }
            .header-text { 
                font-size: 20px !important; 
                padding-left: 12px !important;
            }
            .header-logo { 
                width: 44px !important; 
                height: 44px !important; 
            }
            .content-text { 
                font-size: 15px !important; 
            }
            .status-box {
                padding: 16px !important;
            }
            h1 { font-size: 24px !important; }
            h2 { font-size: 22px !important; }
            
            /* Table responsiveness - Keep side-by-side for consistent design */
            /* td rules removed to preserve row layout */
            
            .divider { border-color: rgba(0,0,0,0.05) !important; }
        }
    </style>
</head>
<body class="wrapper" style="margin: 0; padding: 20px; background-color: #f2f2f7;">
    <table class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f2f2f7; width: 100%;">
        <tr>
            <td align="center">
                
                <!-- Main Card -->
                <table class="card" width="580" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; margin: 40px auto; max-width: 580px; padding: 48px 40px; text-align: left; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
                    <tr>
                        <td>
                            <!-- Header with Logo and Text -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 36px;">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td class="header-border" style="padding-right: 20px;">
                                                    <img src="${process.env.NEXTAUTH_URL}/logo.png" alt="Logo" width="56" height="56" style="display: block; border-radius: 12px;" />
                                                </td>
                                                <td class="header-text" style="padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: #1d1d1f; letter-spacing: -1px; vertical-align: middle; line-height: 1.1;">
                                                    Attendance Portal
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <div class="content-text" style="font-size: 16px; line-height: 1.5; color: #1d1d1f;">
                                ${content}
                            </div>

                            <!-- Footer -->
                            <div class="secondary-text divider" style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.05); font-size: 11px; color: #86868b; text-align: center; letter-spacing: 0.2px;">
                                <p style="margin: 0;">&copy; ${new Date().getFullYear()} Attendance Portal. All rights reserved.</p>
                                <p style="margin: 5px 0 0 0;">Automated Notification System</p>
                            </div>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
`;

const buttonStyle = `
    display: inline-block;
    background-color: #0071e3;
    color: #ffffff;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 980px;
    font-weight: 500;
    font-size: 15px;
`;

export const getAttendanceEmailHtml = (studentName: string, subjectName: string, date: string, status: string) => {
    const isAbsent = status === 'Absent';
    const statusColor = isAbsent ? '#ff3b30' : '#34c759';
    const title = isAbsent ? 'Action Required' : 'Attendance Recorded';

    const content = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 54px; height: 54px; line-height: 54px; background: ${isAbsent ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)'}; border-radius: 50%; display: inline-block; text-align: center; margin-bottom: 16px; font-size: 24px;">
                ${isAbsent ? '⚠️' : '✅'}
            </div>
            <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">${status}</h1>
            <p class="secondary-text" style="font-size: 16px; color: #86868b; margin: 0;">${title}</p>
        </div>

        <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0;">Hello <strong>${studentName}</strong>,</p>
            <p style="margin: 0;">Your attendance status has been updated. Please review the details below:</p>
        </div>

        <div class="status-box" style="background-color: rgba(0,0,0,0.03); border-radius: 16px; padding: 20px; margin-bottom: 32px;">
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td class="secondary-text" style="padding: 8px 0; color: #86868b; font-size: 14px;">Subject</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${subjectName}</td>
                </tr>
                <tr>
                    <td class="secondary-text divider" style="padding: 8px 0; color: #86868b; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">Date</td>
                    <td class="divider" style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">${date}</td>
                </tr>
                <tr>
                    <td class="secondary-text divider" style="padding: 8px 0; color: #86868b; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">Status</td>
                    <td class="divider" style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px; color: ${statusColor}; border-top: 1px solid rgba(0,0,0,0.05);">${status}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 980px; font-weight: 500; font-size: 15px;">Open Student Portal</a>
        </div>
    `;

    return getBaseLayout(content, 'Attendance Update');
};

export const getAnnouncementEmailHtml = (title: string, content: string, category: string) => {
    const isGeneric = category === 'Admin Notification';
    const displayCategory = isGeneric ? 'Update' : category;

    const safeBodyContent = `
        <div style="margin-bottom: 24px;">
            <span class="badge-text" style="background-color: rgba(0, 113, 227, 0.1); color: #0071e3; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block;">
                ${displayCategory}
            </span>
            <h2 style="font-size: 30px; font-weight: 700; margin: 16px 0 24px 0; letter-spacing: -0.6px; line-height: 1.1;">
                ${title}
            </h2>
        </div>
        
        <div class="secondary-text" style="font-size: 16px; line-height: 1.6; color: #424245; margin-bottom: 40px;">
            ${content.replace(/\n/g, '<br>')}
        </div>

        <div class="divider" style="text-align: center; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 32px;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 980px; font-weight: 500; font-size: 15px;">View Dashboard</a>
        </div>
    `;

    return getBaseLayout(safeBodyContent, title);
};

export const getAttendanceReportEmailHtml = (studentName: string, totalClasses: number, presentClasses: number, percentage: number) => {
    let message = "Keep up the consistent work!";
    let color = "#34c759"; // Green

    if (percentage < 75) {
        message = "Your attendance is below the 75% requirement. Please prioritize attending upcoming classes.";
        color = "#ff3b30"; // Red
    } else if (percentage < 85) {
        message = "Good attendance. Try to maintain this to stay safe.";
        color = "#ff9500"; // Orange
    }

    const content = `
        <div style="text-align: center; margin-bottom: 32px;">
            <p class="secondary-text" style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; color: #86868b;">Attendance Overview</p>
            
            <div style="position: relative; display: inline-block;">
                <span style="font-size: 80px; font-weight: 800; letter-spacing: -2px; color: ${color}; line-height: 1;">${percentage}%</span>
            </div>

            <p style="font-size: 18px; font-weight: 500; margin-top: 16px; color: #1d1d1f;">${message}</p>
        </div>

        <div style="margin-bottom: 24px;">
            <p style="margin: 0; font-size: 16px;">Hello <strong>${studentName}</strong>,</p>
            <p style="margin: 8px 0 0 0; color: #424245;">Here is your complete attendance summary as of today:</p>
        </div>

        <div class="status-box" style="background-color: rgba(0,0,0,0.03); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <table width="100%" style="border-collapse: separate; border-spacing: 0;">
                <tr>
                    <td align="center" style="width: 33%; border-right: 1px solid rgba(0,0,0,0.1);">
                        <div class="secondary-text" style="font-size: 12px; margin-bottom: 4px; color: #86868b;">Total Classes</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1d1d1f;">${totalClasses}</div>
                    </td>
                    <td align="center" style="width: 33%; border-right: 1px solid rgba(0,0,0,0.1);">
                        <div class="secondary-text" style="font-size: 12px; margin-bottom: 4px; color: #86868b;">Present</div>
                        <div style="font-size: 24px; font-weight: 700; color: #34c759;">${presentClasses}</div>
                    </td>
                    <td align="center" style="width: 33%;">
                        <div class="secondary-text" style="font-size: 12px; margin-bottom: 4px; color: #86868b;">Absent</div>
                        <div style="font-size: 24px; font-weight: 700; color: #ff3b30;">${totalClasses - presentClasses}</div>
                    </td>
                </tr>
            </table>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">View Full Report</a>
        </div>
    `;

    return getBaseLayout(content, 'Attendance Report');
};

export const getResetPasswordEmailHtml = (resetLink: string) => {
    const content = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 54px; height: 54px; line-height: 54px; background: rgba(0, 113, 227, 0.1); border-radius: 50%; display: inline-block; text-align: center; margin-bottom: 16px; font-size: 24px;">
                🔐
            </div>
            <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">Reset Your Password</h1>
            <p class="secondary-text" style="font-size: 16px; color: #86868b; margin: 0;">Attendance Portal</p>
        </div>

        <div style="margin-bottom: 32px; text-align: center;">
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #1d1d1f;">
                We received a request to reset your password. <br>
                Click the button below to proceed.
            </p>
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
            <a href="${resetLink}" style="${buttonStyle}">Reset Password</a>
        </div>
        
        <div style="margin-bottom: 24px; text-align: center;">
            <p class="secondary-text" style="margin: 0; font-size: 14px; color: #86868b;">
                If you didn't request this, you can safely ignore this email. <br>
                This link will expire in 1 hour.
            </p>
        </div>
    `;

    return getBaseLayout(content, 'Reset Password');
};
