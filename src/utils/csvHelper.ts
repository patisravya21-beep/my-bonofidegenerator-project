import Papa from 'papaparse';

export const exportDataToCsv = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    alert('An error occurred while exporting the data.');
  }
};
