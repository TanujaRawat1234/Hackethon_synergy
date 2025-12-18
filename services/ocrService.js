const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utills/logger');
const https = require('https');
const http = require('http');

class OCRService {
  /**
   * Extract text from PDF file
   */
  async extractFromPDF(filePath) {
    try {
      console.log('Reading PDF file:', filePath);
      const dataBuffer = fs.readFileSync(filePath);
      console.log('PDF buffer size:', dataBuffer.length, 'bytes');
      
      // pdf-parse is a function that returns a promise
      const data = await pdfParse(dataBuffer);
      console.log('PDF text extracted, length:', data.text?.length || 0);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF appears to be empty or contains only images');
      }
      
      return data.text;
    } catch (error) {
      console.error('PDF extraction error details:', error);
      logger.error('PDF extraction error:', error.message);
      
      // If pdf-parse fails, suggest alternatives
      if (error.message.includes('not a function')) {
        throw new Error('PDF parsing library error. Please upload a text file instead.');
      }
      
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractFromImage(filePath) {
    try {
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => console.log(m),
      });
      return result.data.text;
    } catch (error) {
      logger.error('Image OCR error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Extract text from plain text file
   */
  extractFromTextFile(filePath) {
    try {
      console.log('Reading text file:', filePath);
      const text = fs.readFileSync(filePath, 'utf8');
      console.log('Text file read, length:', text.length);
      return text;
    } catch (error) {
      console.error('Text file read error:', error);
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  /**
   * Extract text from local file
   */
  async extractFromLocalFile(filePath, fileType) {
    try {
      console.log('extractFromLocalFile called with:', { filePath, fileType });
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      console.log('File size:', stats.size, 'bytes');

      // Extract text based on file type
      let extractedText;
      
      if (fileType === 'pdf') {
        extractedText = await this.extractFromPDF(filePath);
      } else if (['txt', 'text', 'plain'].includes(fileType.toLowerCase())) {
        // Handle plain text files
        extractedText = this.extractFromTextFile(filePath);
      } else if (['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(fileType.toLowerCase())) {
        extractedText = await this.extractFromImage(filePath);
      } else {
        // Try to read as text file if unknown type
        console.log('Unknown file type, attempting to read as text...');
        extractedText = this.extractFromTextFile(filePath);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }

      console.log('Successfully extracted text, length:', extractedText.length);
      return extractedText;
    } catch (error) {
      console.error('Local file extraction error:', error);
      logger.error('Local file extraction error:', error.message);
      throw error;
    }
  }

  /**
   * Download file from URL and extract text (for S3 or remote files)
   */
  async extractFromURL(fileUrl, fileType) {
    try {
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, `temp_${Date.now()}.${fileType}`);
      
      // Download file
      await this.downloadFile(fileUrl, tempFilePath);

      // Extract text based on file type
      let extractedText;
      if (fileType === 'pdf') {
        extractedText = await this.extractFromPDF(tempFilePath);
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType.toLowerCase())) {
        extractedText = await this.extractFromImage(tempFilePath);
      } else {
        throw new Error('Unsupported file type');
      }

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return extractedText;
    } catch (error) {
      logger.error('URL extraction error:', error);
      throw error;
    }
  }

  /**
   * Helper to download file from URL
   */
  downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(filePath);

      protocol.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  }
}

module.exports = new OCRService();
