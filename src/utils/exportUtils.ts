export const exportToCSV = (data: any[], filename: string, columns: {key: string, label: string}[]) => {
  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      let value = row[col.key];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      if (value === null || value === undefined) {
        value = '';
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (title: string, data: any[], columns: {key: string, label: string}[]) => {
  const headers = columns.map(col => col.label).join('</th><th>');
  const rows = data.map(row =>
    '<tr>' + columns.map(col => {
      let value = row[col.key];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      if (value === null || value === undefined) {
        value = '';
      }
      return `<td>${value}</td>`;
    }).join('') + '</tr>'
  ).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: 600; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString('en-IN')}</p>
      <table>
        <thead>
          <tr><th>${headers}</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="footer">
        <p>© ${new Date().getFullYear()} HRMS - All Rights Reserved</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
