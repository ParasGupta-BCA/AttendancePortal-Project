import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportSubjectReportToPDF = (data: any[], meta: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Attendance Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Class: ${meta.class_name} (${meta.section})`, 14, 30);
    doc.text(`Subject: ${meta.subject_name} (${meta.subject_code})`, 14, 35);
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 40);

    // Table Data
    const tableBody = data.map(st => [
        st.enrollment_no,
        st.name,
        st.total_sessions,
        st.total_present,
        st.total_absent,
        st.percentage + '%'
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Enrollment', 'Name', 'Total Classes', 'Present', 'Absent', '%']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    doc.save(`${meta.subject_name}_Attendance_Report.pdf`);
};

export const exportDailyReportToPDF = (reportData: any) => {
    const doc = new jsPDF();
    const dateRangeStr = `${reportData.startDate} to ${reportData.endDate}`;
    let finalY = 15;

    doc.setFontSize(22);
    doc.text("Attendance Report", 105, finalY, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Period: ${dateRangeStr}`, 105, finalY + 8, { align: "center" });
    finalY += 20;

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

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black
        doc.text(`${session_info.subject_name}`, 14, finalY);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Grey
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
            startY: finalY + 12,
            head: [['Date', 'Enrollment', 'Student Name', 'Status', 'Time']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] }, // Dark header
        });

        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 20;
    });

    doc.save(`Attendance_Report_${reportData.startDate}_to_${reportData.endDate}.pdf`);
};
