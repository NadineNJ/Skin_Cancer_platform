import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  selectedFile: File | null = null;
  result: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  // Handle file selection via input element
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Handle file drop
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Prevent default browser behavior when dragging files over drop area
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Upload selected file to backend for detection
  onUpload() {
    if (!this.selectedFile) {
      alert('Please select an image file before uploading.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token missing. Please login again.');
      return;
    }

    this.loading = true;
    this.result = null;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<any>('http://127.0.0.1:5000/predict', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Upload failed: ' + (err.error?.message || err.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  // Generate and download PDF report from detection result
  downloadReport() {
    if (!this.result) {
      alert('No result available to generate report.');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Skin Cancer Detection Report', 20, y);
    y += 10;

    // Diagnosis Result
    doc.setFontSize(14);
    doc.text('Diagnosis Result:', 20, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Type: ${this.result.class}`, 20, y);
    y += 7;
    doc.text(`Confidence: ${this.result.confidence}%`, 20, y);
    y += 10;

    // Helper to write wrapped text
    const writeSection = (title: string, text: string | undefined) => {
      if (!text) return;

      doc.setFontSize(14);
      doc.text(title, 20, y);
      y += 8;

      doc.setFontSize(12);
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7 + 4;
    };

    // Write report sections if available
    writeSection('Report Overview:', this.result.report?.overview); 
    writeSection('Importance of Early Detection:', this.result.report?.importance_of_early_detection);
    writeSection('Recommendation:', this.result.report?.recommendation);
    writeSection('Confidence Explanation:', this.result.report?.confidence_explanation);

    // Save PDF
    doc.save('Skin_Cancer_Report.pdf');
  }
  
}
