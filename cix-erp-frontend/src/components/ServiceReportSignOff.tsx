// src/components/ServiceReportSignOff.tsx
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

// Pulling the local API base path from our .env.local file configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.200:8000/api/v1';

export const ServiceReportSignOff: React.FC = () => {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  // Clear button helper to wipe the HTML canvas tracking clean
  const clearCanvas = () => sigCanvasRef.current?.clear();

  const handleExecuteSignOff = async () => {
    if (sigCanvasRef.current?.isEmpty()) {
      alert("Validation Block: Canvas signature pad is completely empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Convert Canvas to raw blob data object instead of base64 embedding in JSON string fields
      const canvas = sigCanvasRef.current?.getTrimmedCanvas();
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Error: Failed to process raw canvas image streaming context.");
          return;
        }

        // Package the image payload structure into multipart/form-data form arrays
        const uploadFormData = new FormData();
        uploadFormData.append("file", blob, "client_signature.png");

        // 2. Stream signature data chunk directly via the multipart upload endpoint contract
        const uploadResponse = await axios.post(`${API_BASE}/uploads`, uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const signatureUploadId = uploadResponse.data.upload_id;

        // 3. Formulate the structure matching your official API specifications
        const reportPayload = {
          sr_no: "SR-26-00188", // Formatted per business layout guidelines
          do_no: "DO/26/00179",
          client: {
            company: "Maxis Berhad",
            company_address: ["Level 18, Menara Maxis", "KLCC, 50088 Kuala Lumpur"],
            store_type: "Flagship",
            store_name: "KLCC Centre Court",
            pic_name: "Aiman Rashid",
            pic_tel: "+60123456789"
          },
          wo_number: "WO-77231",
          remedy_number: "REM-148662",
          diagnostic: "HDMI matrix configuration logic sync fault on display 02.",
          action_taken: "Reallocated hardware, verified Maxis naming scheme output string.",
          acknowledgement: {
            signed_by: "Aiman Rashid",
            signature_png_upload_id: signatureUploadId,
            operator_email: "aiman.qushairy@click-ix.com" // Authenticating internal email boundary rule
          }
        };

        // 4. Send structured dataset to kickstart backend engine ReportLab compiling logic
        const finalResponse = await axios.post(`${API_BASE}/operations/service-reports`, reportPayload);

        if (finalResponse.status === 200 || finalResponse.status === 201) {
          // Point download asset directly to streaming FileResponse path
          const fullDownloadLink = `${API_BASE}/operations/service-reports/${encodeURIComponent(reportPayload.sr_no)}/download`;
          setGeneratedPdfUrl(fullDownloadLink);
          alert("Operational Success: Service Document written to MariaDB and compiled!");
        }
      }, "image/png");

    } catch (err) {
      console.error("System Error: File handling flow broken", err);
      alert("System Action Interrupted: Inspect server network pipeline settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Triggers native browser hardware driver prints without shifting viewport container frames
  const triggerNativePrint = () => {
    if (!generatedPdfUrl) return;
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.src = generatedPdfUrl;
    
    document.body.appendChild(printFrame);
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
  };

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', fontFamily: 'sans-serif', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: '#1e293b', margin: '0 0 8px 0', fontSize: '20px' }}>Field Service Sign-off Desk (iPad Viewport)</h3>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>Captured operators must use corporate accounts ending with @click-ix.com.</p>
      
      {/* Interactive Signature Writing Frame Container */}
      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', padding: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="#0f172a"
          canvasProps={{ width: 600, height: 200, style: { cursor: 'crosshair', maxWidth: '100%' } }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={clearCanvas} style={{ padding: '10px 20px', background: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          Wipe Pad Clean
        </button>
        <button onClick={handleExecuteSignOff} disabled={isSubmitting} style={{ padding: '10px 20px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          {isSubmitting ? "Locking Manifesto..." : "Submit & Lock Service Report"}
        </button>
      </div>

      {/* Conditional Rendering Action Panel for Print & Download Tasks */}
      {generatedPdfUrl && (
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '24px', animation: 'fadeIn 0.5s ease' }}>
          <h4 style={{ color: '#0f172a', margin: '0 0 12px 0' }}>📄 Document Manifest Ready:</h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={triggerNativePrint} style={{ padding: '12px 24px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🖨️ Direct Hardware Print
            </button>
            
            <a href={generatedPdfUrl} download style={{ textDecoration: 'none', padding: '12px 24px', background: '#0f172a', color: '#ffffff', borderRadius: '6px', fontWeight: '700', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📥 Download PDF Copy
            </a>
          </div>
        </div>
      )}
    </div>
  );
};