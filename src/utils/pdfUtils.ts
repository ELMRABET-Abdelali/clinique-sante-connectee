
/**
 * Utility function to download content as a PDF file
 * @param content HTML content to convert to PDF
 * @param filename Name of the file to be downloaded
 */
export const downloadPdf = (content: string, filename: string) => {
  // Create a hidden iframe to load the content
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Write content to the iframe
  iframe.contentDocument?.open();
  iframe.contentDocument?.write(content);
  iframe.contentDocument?.close();
  
  // Give it a moment to render
  setTimeout(() => {
    try {
      // Print the iframe content
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF. Veuillez réessayer.');
    }
  }, 500);
};
