const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #1d1d1f;
    margin: 0;
    padding: 0;
`;

// "Glass" container style - fallback to solid white for clients that don't support rgba/blur
const glassCard = `
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    border-radius: 24px;
    padding: 40px;
    max-width: 600px;
    margin: 40px auto;
`;

const buttonStyle = `
    display: inline-block;
    background: #0071e3;
    color: #ffffff;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 980px;
    font-weight: 500;
    font-size: 16px;
    margin-top: 20px;
`;

const headerStyle = `
    text-align: center;
    margin-bottom: 30px;
`;

const footerStyle = `
    text-align: center;
    margin-top: 40px;
    font-size: 12px;
    color: #86868b;
`;

const getBaseLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="${baseStyles} background: #f5f5f7; padding: 20px;">
    <div style="${glassCard}">
        <div style="${headerStyle}">
            <h1 style="font-size: 24px; font-weight: 600; background: -webkit-linear-gradient(45deg, #000, #555); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Attendance Portal</h1>
        </div>
        ${content}
        <div style="${footerStyle}">
            <p>&copy; ${new Date().getFullYear()} Attendance Portal. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const getAttendanceEmailHtml = (studentName: string, subjectName: string, date: string, status: string) => {
    const isAbsent = status === 'Absent';
    const statusColor = isAbsent ? '#ff3b30' : '#34c759'; // Apple Red or Green
    const statusIcon = isAbsent ? '❌' : '✅';

    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
            <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 10px 0;">${status}</h2>
            <p style="font-size: 17px; color: #86868b; margin: 0;">Attendance Update</p>
        </div>

        <div style="background: rgba(255,255,255,0.5); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Hello <strong>${studentName}</strong>,</p>
            <p style="margin: 0; font-size: 16px;">Your attendance has been recorded for the following session:</p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px;">
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #86868b;">Subject</td>
                <td style="padding: 15px; border-bottom: 1px solid rgba(0,0,0,0.1); font-weight: 500; text-align: right;">${subjectName}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #86868b;">Date</td>
                <td style="padding: 15px; border-bottom: 1px solid rgba(0,0,0,0.1); font-weight: 500; text-align: right;">${date}</td>
            </tr>
            <tr>
                <td style="padding: 15px; color: #86868b;">Status</td>
                <td style="padding: 15px; font-weight: 600; text-align: right; color: ${statusColor};">${status}</td>
            </tr>
        </table>

        <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">Open Portal</a>
        </div>
    `;

    return getBaseLayout(content, 'Attendance Update');
};

export const getAnnouncementEmailHtml = (title: string, content: string, category: string) => {
    const bodyContent = `
        <div style="margin-bottom: 25px; text-align: left;">
            <span style="background: rgba(0, 113, 227, 0.1); color: #0071e3; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">${category}</span>
        </div>
        
        <h2 style="font-size: 34px; font-weight: 700; margin: 0 0 24px 0; letter-spacing: -0.8px; line-height: 1.1; color: #1d1d1f; text-align: left;">${title}</h2>
        
        <div style="font-size: 17px; line-height: 1.6; color: #424245; margin-bottom: 35px; text-align: left; font-weight: 400;">
            ${content.replace(/\n/g, '<br>')}
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL || '#'}" style="${buttonStyle}">View in Portal</a>
        </div>
    `;

    return getBaseLayout(bodyContent, `Announcement: ${title}`);
};
