import * as XLSX from 'xlsx';

export const exportSubjectReportToExcel = (data: any[], meta: any) => {
    // 1. Prepare Data for Sheet
    const sheetData = data.map((student) => ({
        "Enrollment No": student.enrollment_no,
        "Student Name": student.name,
        "Total Sessions": student.total_sessions,
        "Present": student.total_present,
        "Absent": student.total_absent,
        "Attendance %": student.percentage + '%'
    }));

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();

    // 3. Create Worksheet
    const ws = XLSX.utils.json_to_sheet(sheetData);

    // 4. Add Header Info (Manual manipulation for title)
    // We want a title at the top like "Attendance Report - [Subject]"
    // But `json_to_sheet` is simple. For professional look, we might append afterwards, 
    // but typically a simple table is fine.
    // Let's rely on filename for context or add a custom header row if needed.
    // Ideally:
    // Row 1: Course: BCA VI, Subject: Java
    // Row 2: <Empty>
    // Row 3: Headers...

    // Using `aoa_to_sheet` + `sheet_add_json` gives more control
    const headerInfo = [
        ["Attendance Report"],
        [`Class: ${meta.class_name} (${meta.section})`],
        [`Subject: ${meta.subject_name} (${meta.subject_code})`],
        [`Generated On: ${new Date().toLocaleDateString()}`],
        [] // Gap
    ];

    const wsWithHeader = XLSX.utils.aoa_to_sheet(headerInfo);
    XLSX.utils.sheet_add_json(wsWithHeader, sheetData, { origin: "A6" });

    // Auto-width columns (basic approximate)
    const wscols = [
        { wch: 20 }, // Enrollment
        { wch: 25 }, // Name
        { wch: 15 }, // Total
        { wch: 10 }, // Present
        { wch: 10 }, // Absent
        { wch: 15 }, // %
    ];
    wsWithHeader['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, wsWithHeader, "Attendance Summary");

    // 5. Save File
    const fileName = `${meta.subject_name}_Attendance_Report.xlsx`;
    XLSX.writeFile(wb, fileName);
};

export const exportDailyReportToExcel = (reportData: any) => {
    const wb = XLSX.utils.book_new();
    const dateStr = reportData.date;

    reportData.sessions.forEach((sessionData: any, index: number) => {
        const { session_info, attendance } = sessionData;
        const subjectName = session_info.subject_name;

        // Prepare rows
        const rows = attendance.map((st: any) => ({
            "Date": new Date(session_info.start_time).toLocaleDateString('en-GB'),
            "Enrollment": st.enrollment_no,
            "Name": st.name,
            "Status": st.status,
            "Time": st.time
        }));

        const ws = XLSX.utils.aoa_to_sheet([
            [`Daily Attendance Report - ${dateStr}`],
            [`Subject: ${subjectName}`],
            [`Class: ${session_info.class_name} (${session_info.section})`],
            [`Time: ${new Date(session_info.start_time).toLocaleTimeString()} - ${new Date(session_info.end_time).toLocaleTimeString()}`],
            []
        ]);

        XLSX.utils.sheet_add_json(ws, rows, { origin: "A6" });

        // Sheet names must be max 31 chars and unique
        let sheetName = `${subjectName.substring(0, 15)}_${index + 1}`;

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    if (reportData.sessions.length === 0) {
        // Empty sheet if no classes
        const ws = XLSX.utils.aoa_to_sheet([["No classes conducted in this range."]]);
        XLSX.utils.book_append_sheet(wb, ws, "Info");
    }

    XLSX.writeFile(wb, `Attendance_Report_${reportData.startDate}_to_${reportData.endDate}.xlsx`);
};
