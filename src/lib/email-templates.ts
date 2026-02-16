const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    color: #1d1d1f;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
`;

// "Glass" container style - refined for better client support
// We use a fallback background for clients that don't support rgba properly
const glassCard = `
    background-color: #ffffff;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    border-radius: 24px;
    padding: 48px 40px;
    max-width: 580px;
    margin: 40px auto;
    text-align: left;
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
    margin-top: 24px;
`;

const headerStyle = `
    text-align: center;
    margin-bottom: 36px;
`;

const footerStyle = `
    text-align: center;
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid rgba(0,0,0,0.05);
    font-size: 11px;
    color: #86868b;
    letter-spacing: 0.2px;
`;

const getBaseLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="${baseStyles} background-color: #f2f2f7; padding: 20px;">
    <!-- Outer wrapper to limit width and center -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f2f2f7;">
        <tr>
            <td align="center">
                
                <!-- Main Card -->
                <div style="${glassCard}">
                    
                    <!-- Header with Logo -->
                    <div style="${headerStyle}">
                        <img src="${process.env.NEXTAUTH_URL}/logo.svg" alt="Attendance Portal" width="60" height="60" style="display: block; margin: 0 auto; border-radius: 14px;" />
                    </div>

                    <!-- Content -->
                    <div style="font-size: 16px; color: #1d1d1f;">
                        ${content}
                    </div>

                    <!-- Footer -->
                    <div style="${footerStyle}">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Attendance Portal. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">Automated Notification System</p>
                    </div>

                </div>

            </td>
        </tr>
    </table>
</body>
</html>
`;

export const getAttendanceEmailHtml = (studentName: string, subjectName: string, date: string, status: string) => {
    const isAbsent = status === 'Absent';
    const statusColor = isAbsent ? '#ff3b30' : '#34c759';
    // Using images or simple reliable emojis/characters
    const title = isAbsent ? 'Action Required' : 'Attendance Recorded';

    const content = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 50px; height: 50px; background: ${isAbsent ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)'}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; line-height: 50px; font-size: 24px;">
                ${isAbsent ? '⚠️' : '✅'}
            </div>
            <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px; color: #1d1d1f;">${status}</h1>
            <p style="font-size: 16px; color: #86868b; margin: 0;">${title}</p>
        </div>

        <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0;">Hello <strong>${studentName}</strong>,</p>
            <p style="margin: 0;">Your attendance status has been updated. Please review the details below:</p>
        </div>

        <div style="background: rgba(0,0,0,0.03); border-radius: 16px; padding: 20px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #86868b; font-size: 14px;">Subject</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${subjectName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #86868b; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">Date</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">${date}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #86868b; font-size: 14px; border-top: 1px solid rgba(0,0,0,0.05);">Status</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px; color: ${statusColor}; border-top: 1px solid rgba(0,0,0,0.05);">${status}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">Open Student Portal</a>
        </div>
    `;

    return getBaseLayout(content, 'Attendance Update');
};

export const getAnnouncementEmailHtml = (title: string, content: string, category: string) => {
    // If Admin Notification, we treat differently
    const isGeneric = category === 'Admin Notification';
    const displayCategory = isGeneric ? 'Update' : category;

    const bodyContent = `
        <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                ${displayCategory}
            </span>
            <h2 style="font-size: 30px; font-weight: 700; margin: 12px 0 24px 0; letter-spacing: -0.6px; line-height: 1.1; color: #1d1d1f;">
                ${title}
            </h2>
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; color: #424245; margin-bottom: 40px; white-space: pre-wrap;">
${content.replace(/<br>/g, '\n')}
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 32px;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">View Dashboard</a>
        </div>
    `;

    // Note: We use pre-wrap style above or replace newlines with BRs. 
    // In strict HTML, white-space: pre-wrap works well for preserving formatting.
    // But for email safety, let's revert to the replace method in the usage site or logic.
    // Actually, in the template function called from API, we already replaced \n with <br>.
    // Let's ensure consistency. 
    // If content comes in with <br>, we just render it. 
    // The previous API call replaced \n with <br> inside the function call, but here we moved logic inside?
    // Let's check api route. It calls `getAnnouncementEmailHtml(subject, content, ...)`
    // The previous implementation of `getAnnouncementEmailHtml` did the replacement.
    // So we should do it here too.

    const finalContent = bodyContent.replace(
        /\${content.replace\(\/\\n\/g, '<br>'\)}/,
        content.replace(/\n/g, '<br>')
    );

    // Correction: The string literal above with white-space: pre-wrap is good for modern clients, 
    // but <br> is safer. Let's use the replacement in the template string directly.

    const safeBodyContent = `
        <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                ${displayCategory}
            </span>
            <h2 style="font-size: 30px; font-weight: 700; margin: 12px 0 24px 0; letter-spacing: -0.6px; line-height: 1.1; color: #1d1d1f;">
                ${title}
            </h2>
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; color: #424245; margin-bottom: 40px;">
            ${content.replace(/\n/g, '<br>')}
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 32px;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">View Dashboard</a>
        </div>
    `;

    return getBaseLayout(safeBodyContent, title);
};
