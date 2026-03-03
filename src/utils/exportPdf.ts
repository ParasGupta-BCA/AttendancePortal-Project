import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error loading image", error);
        return "";
    }
};

export const exportSubjectReportToPDF = async (data: any[], meta: any) => {
    const doc = new jsPDF();
    const logoBase64 = await getBase64ImageFromUrl("/logo.png");

    let finalY = 15;

    // Header Backround
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 45, 'F');

    // Add Logo if available
    if (logoBase64) {
        // Adjust width and height based on your logo aspect ratio and size
        doc.addImage(logoBase64, 'PNG', 14, 14, 24, 24);
    }

    // Header Text
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text("Attendance Report", logoBase64 ? 42 : 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125); // muted text
    doc.text(`Class: ${meta.class_name} (${meta.section})`, logoBase64 ? 42 : 14, 28);
    doc.text(`Subject: ${meta.subject_name} (${meta.subject_code})`, logoBase64 ? 42 : 14, 33);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, logoBase64 ? 42 : 14, 38);

    doc.setDrawColor(222, 226, 230);
    doc.line(14, 45, 196, 45);

    finalY = 55;

    // Table Data
    const tableBody = data.map(st => [
        st.enrollment_no,
        st.name,
        st.total_sessions.toString(),
        st.total_present.toString(),
        st.total_absent.toString(),
        st.percentage + '%'
    ]);

    autoTable(doc, {
        startY: finalY,
        head: [['Enrollment', 'Name', 'Total Classes', 'Present', 'Absent', '%']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: 'center' }, // dark slate modern header
        bodyStyles: { textColor: [51, 65, 85], halign: 'center' },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'left' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }, // very light blue/grey
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 }
    });

    doc.save(`${meta.subject_name}_Attendance_Report.pdf`);
};

export const exportDailyReportToPDF = async (reportData: any) => {
    const doc = new jsPDF();
    const logoBase64 = await getBase64ImageFromUrl("/logo.png");
    const dateRangeStr = `${reportData.startDate} to ${reportData.endDate}`;

    let finalY = 15;

    // Header Backround
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 45, 'F');

    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 16, 16, 16);
    }

    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text("Daily Attendance Report", logoBase64 ? 34 : 14, 24);

    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Period: ${dateRangeStr}`, logoBase64 ? 34 : 14, 31);

    doc.setDrawColor(222, 226, 230);
    doc.line(14, 45, 196, 45);

    finalY = 55;

    if (reportData.sessions.length === 0) {
        doc.text("No classes conducted in this period.", 14, finalY);
    }

    reportData.sessions.forEach((sessionData: any, index: number) => {
        const { session_info, attendance } = sessionData;

        // If not first table and low space, add page
        if (index > 0) {
            doc.addPage();
            finalY = 20;
        }

        // Section Title
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate 900
        doc.text(`${session_info.subject_name}`, 14, finalY);

        // Section Subtitle
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate 500
        doc.text(`${session_info.class_name} (${session_info.section}) | ${new Date(session_info.start_time).toLocaleDateString('en-GB')} ${new Date(session_info.start_time).toLocaleTimeString()}`, 14, finalY + 6);

        const sessionDate = new Date(session_info.start_time).toLocaleDateString('en-GB');

        const tableBody = attendance.map((st: any) => [
            sessionDate,
            st.enrollment_no,
            st.name,
            st.status,
            st.time
        ]);

        autoTable(doc, {
            startY: finalY + 10,
            head: [['Date', 'Enrollment', 'Student Name', 'Status', 'Time']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: 255 }, // slate 900
            bodyStyles: { textColor: [51, 65, 85] }, // slate 700
            alternateRowStyles: { fillColor: [248, 250, 252] }, // slate 50
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 }
        });

        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 20;
    });

    doc.save(`Attendance_Report_${reportData.startDate}_to_${reportData.endDate}.pdf`);
};
