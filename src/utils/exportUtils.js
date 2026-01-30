/**
 * Data Export Utilities
 * Supports CSV, XLSX, and GeoJSON formats
 */

/**
 * Escape CSV field - handles commas, quotes, newlines, tabs
 * RFC 4180 compliant
 */
const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // Check if field needs escaping (contains comma, quote, newline, or tab)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes('\t')) {
    // Escape double quotes by doubling them, then wrap in quotes
    return '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of {prop, label} defining columns
 * @param {string} filename - Filename without extension
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create header row
  const headers = columns.map(col => escapeCSVField(col.label));

  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => escapeCSVField(row[col.prop]));
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel to recognize UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export data to XLSX format using SheetJS
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of {prop, label} defining columns
 * @param {string} filename - Filename without extension
 */
export const exportToXLSX = async (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamically import xlsx library
    const XLSX = await import('xlsx');

    // Prepare data for worksheet
    const wsData = [];

    // Header row
    wsData.push(columns.map(col => col.label));

    // Data rows
    data.forEach(row => {
      wsData.push(columns.map(col => {
        const value = row[col.prop];
        // Return value as-is, XLSX handles types properly
        return value !== null && value !== undefined ? value : '';
      }));
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths based on content
    const colWidths = columns.map((col, index) => {
      const maxLength = Math.max(
        col.label.length,
        ...data.map(row => String(row[col.prop] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate file and download
    XLSX.writeFile(wb, `${filename}.xlsx`);

  } catch (error) {
    console.error('Failed to export XLSX:', error);
    alert('Failed to export XLSX. Please try CSV format instead.');
  }
};

/**
 * Export map points to GeoJSON format
 * @param {Array} points - Array of {lat, lng, ...properties}
 * @param {string} filename - Filename without extension
 */
export const exportToGeoJSON = (points, filename = 'map-data') => {
  if (!points || points.length === 0) {
    alert('No geographic data to export');
    return;
  }

  const geojson = {
    type: 'FeatureCollection',
    features: points.map((point, index) => ({
      type: 'Feature',
      id: index + 1,
      geometry: {
        type: 'Point',
        coordinates: [point.lng || point.Longitude, point.lat || point.Latitude]
      },
      properties: {
        // Include all properties except lat/lng
        ...Object.fromEntries(
          Object.entries(point).filter(([key]) =>
            !['lat', 'lng', 'Latitude', 'Longitude'].includes(key)
          )
        )
      }
    })).filter(feature =>
      // Filter out invalid coordinates
      feature.geometry.coordinates[0] != null &&
      feature.geometry.coordinates[1] != null
    )
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/geo+json;charset=utf-8;'
  });

  downloadBlob(blob, `${filename}.geojson`);
};

/**
 * Export current search results to GeoJSON (only records with coordinates)
 * @param {Array} data - Array of record objects
 * @param {string} filename - Filename without extension
 */
export const exportRecordsToGeoJSON = (data, filename = 'records') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Filter records that have valid coordinates
  const geoRecords = data.filter(record =>
    record.Latitude != null &&
    record.Longitude != null &&
    !isNaN(record.Latitude) &&
    !isNaN(record.Longitude)
  );

  if (geoRecords.length === 0) {
    alert('No records with valid coordinates to export');
    return;
  }

  const geojson = {
    type: 'FeatureCollection',
    features: geoRecords.map((record, index) => ({
      type: 'Feature',
      id: record.ID || index + 1,
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(record.Longitude), parseFloat(record.Latitude)]
      },
      properties: {
        // Include key fields as properties
        ScientificName: record.ScientificName,
        Family: record.Family,
        Genus: record.Genus,
        InstitutionCode: record.InstitutionCode,
        CatalogNumber: record.CatalogNumber,
        Country: record.Country,
        StateProvince: record.StateProvince,
        County: record.County,
        Locality: record.Locality,
        YearCollected: record.YearCollected,
        RecordedBy: record.RecordedBy
      }
    }))
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/geo+json;charset=utf-8;'
  });

  downloadBlob(blob, `${filename}.geojson`);

  return geoRecords.length;
};

/**
 * Helper function to trigger file download
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (prefix = 'fishnet2') => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${prefix}_${timestamp}`;
};

/**
 * Export chart/map to PNG format using html2canvas
 * @param {HTMLElement} container - The container element to capture
 * @param {string} filename - Filename without extension
 * @param {string} title - Title for the export
 */
export const exportChartToPNG = async (container, filename = 'chart', title = 'Chart') => {
  if (!container) {
    alert('Container not found');
    return;
  }

  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;

    // Capture the container
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images (for map tiles)
      allowTaint: true,
      logging: false
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${filename}.png`);
      }
    }, 'image/png', 1.0);

  } catch (error) {
    console.error('PNG export failed:', error);
    alert('PNG export failed. Please install html2canvas: npm install html2canvas');
  }
};

/**
 * Export chart to SVG format
 * Works with ECharts and raw SVG elements
 * @param {HTMLElement} chartContainer - The chart container element
 * @param {string} filename - Filename without extension
 * @param {string} title - Chart title for metadata
 */
export const exportChartToSVG = async (chartContainer, filename = 'chart', title = 'Chart') => {
  if (!chartContainer) {
    alert('Chart container not found');
    return;
  }

  let svgContent = null;

  // Try to find ECharts instance
  const echartsCanvas = chartContainer.querySelector('canvas');
  if (echartsCanvas && window.echarts) {
    // Get ECharts instance from canvas
    const chartInstance = window.echarts.getInstanceByDom(echartsCanvas.parentElement);
    if (chartInstance) {
      // Get SVG data URL from ECharts
      const dataUrl = chartInstance.getDataURL({
        type: 'svg',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });

      if (dataUrl.startsWith('data:image/svg+xml')) {
        // Decode base64 SVG
        const base64 = dataUrl.split(',')[1];
        svgContent = decodeURIComponent(escape(atob(base64)));
      }
    }
  }

  // Try to find existing SVG element
  if (!svgContent) {
    const svgElement = chartContainer.querySelector('svg');
    if (svgElement) {
      // Clone and process SVG
      const clonedSvg = svgElement.cloneNode(true);

      // Add title
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = title;
      clonedSvg.insertBefore(titleEl, clonedSvg.firstChild);

      // Add white background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      // Serialize
      const serializer = new XMLSerializer();
      svgContent = serializer.serializeToString(clonedSvg);
    }
  }

  // If still no SVG, try to convert canvas to SVG-like format
  if (!svgContent && echartsCanvas) {
    // Fall back to PNG embedded in SVG
    const dataUrl = echartsCanvas.toDataURL('image/png', 1.0);
    const width = echartsCanvas.width;
    const height = echartsCanvas.height;

    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>${title}</title>
  <rect width="100%" height="100%" fill="white"/>
  <image xlink:href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;
  }

  // Fallback: use html2canvas for complex elements (maps, etc.)
  if (!svgContent) {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const capturedCanvas = await html2canvas(chartContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const dataUrl = capturedCanvas.toDataURL('image/png', 1.0);
      const width = capturedCanvas.width;
      const height = capturedCanvas.height;

      svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>${title}</title>
  <rect width="100%" height="100%" fill="white"/>
  <image xlink:href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;
    } catch (e) {
      console.error('html2canvas fallback failed:', e);
    }
  }

  if (!svgContent) {
    alert('Could not export as SVG. No content found.');
    return;
  }

  // Add XML declaration if missing
  if (!svgContent.startsWith('<?xml')) {
    svgContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgContent;
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}.svg`);
};

/**
 * Export chart to PDF format
 * @param {HTMLElement} chartContainer - The chart container element
 * @param {string} filename - Filename without extension
 * @param {string} title - Chart title
 */
export const exportChartToPDF = async (chartContainer, filename = 'chart', title = 'Chart') => {
  if (!chartContainer) {
    alert('Chart container not found');
    return;
  }

  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');

    // Try to get image from canvas (ECharts)
    let imageData = null;
    let imgWidth = 0;
    let imgHeight = 0;

    const canvas = chartContainer.querySelector('canvas');
    if (canvas) {
      imageData = canvas.toDataURL('image/png', 1.0);
      imgWidth = canvas.width;
      imgHeight = canvas.height;
    } else {
      // Try SVG - convert to canvas first
      const svg = chartContainer.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Create image from SVG
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        // Draw to canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = svg.clientWidth * 2 || 800;
        tempCanvas.height = svg.clientHeight * 2 || 600;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

        imageData = tempCanvas.toDataURL('image/png', 1.0);
        imgWidth = tempCanvas.width;
        imgHeight = tempCanvas.height;

        URL.revokeObjectURL(url);
      }
    }

    // Fallback: use html2canvas for complex elements (maps, etc.)
    if (!imageData) {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const capturedCanvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        imageData = capturedCanvas.toDataURL('image/png', 1.0);
        imgWidth = capturedCanvas.width;
        imgHeight = capturedCanvas.height;
      } catch (e) {
        console.error('html2canvas fallback failed:', e);
      }
    }

    if (!imageData) {
      alert('Could not export as PDF. No content found.');
      return;
    }

    // Calculate PDF dimensions (A4 landscape for charts)
    const pdfWidth = 297; // A4 landscape width in mm
    const pdfHeight = 210; // A4 landscape height in mm
    const margin = 15;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, margin + 5);

    // Add timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, margin, margin + 12);

    // Calculate image dimensions to fit in PDF
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2 - 20; // Leave space for title

    const aspectRatio = imgWidth / imgHeight;
    let finalWidth = contentWidth;
    let finalHeight = contentWidth / aspectRatio;

    if (finalHeight > contentHeight) {
      finalHeight = contentHeight;
      finalWidth = contentHeight * aspectRatio;
    }

    // Center the image
    const xOffset = margin + (contentWidth - finalWidth) / 2;
    const yOffset = margin + 20;

    // Add image
    pdf.addImage(imageData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(128);
    pdf.text('FishNet 2 - World Fish Occurrence Database', margin, pdfHeight - 5);

    // Save
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('PDF export failed:', error);
    alert('PDF export failed. Please install jspdf package: npm install jspdf');
  }
};
