import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

const API_BASE = 'http://192.168.100.200:8000/api/v1';

export const ServiceReportSignOff: React.FC = () => {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic state hooks bound directly to real table parameters
  const [formData, setFormData] = useState({
    sr_no: 'SR-2026-0001',
    do_no: 'DO/26/00179', // Matches the real parent data record row we seeded
    company: 'Maxis Berhad',
    store_type: 'MEP',
    store_name: 'Taman Universiti MEP', // Matches real CSV outlet name tracking token
    pic_name: 'Aiman Qushairy',
    pic_tel: '+6012-3456789',
    wo_number: 'WO-99124',
    remedy_number: 'REM-148662',
    diagnostic: 'Hardware replacement for digital brandwall signage player unit.',
    action_taken: 'Replaced faulty PC unit with MMP25-00535 hardware asset swap.',
    operator_email: 'fiqar@click-ix.com' // Domain constraint check matches @click-ix.com
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearCanvas = () => sigCanvasRef.current?.clear();

  const handleExecuteSignOff = async () => {
    if (sigCanvasRef.current?.isEmpty()) {
      alert("Validation Error: Please acquire client signature authorization sign-off on the pad.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const canvas = sigCanvasRef.current?.getCanvas();
      if (!canvas) throw new Error("Canvas context initialization failure.");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Error transforming binary signature image data stream.");
          setIsSubmitting(false);
          return;
        }

        try {
          // Phase 1: Post the binary image payload to populate the central uploads ledger row
          const uploadFormData = new FormData();
          uploadFormData.append("file", blob, "signature_signoff.png");

          const uploadRes = await axios.post(`${API_BASE}/uploads`, uploadFormData, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          const signatureUploadId = uploadRes.data.upload_id;

          // Phase 2: Transmit the master schema JSON matching API_CONTRACT_final.md spec rules
          const reportPayload = {
            sr_no: formData.sr_no,
            do_no: formData.do_no,
            client: {
              company: formData.company,
              company_address: ["Skudai, Johor Bahru Site Location"],
              store_type: formData.store_type,
              store_name: formData.store_name,
              pic_name: formData.pic_name,
              pic_tel: formData.pic_tel
            },
            wo_number: formData.wo_number,
            remedy_number: formData.remedy_number,
            diagnostic: formData.diagnostic,
            action_taken: formData.action_taken,
            acknowledgement: {
              signed_by: formData.pic_name,
              signature_png_upload_id: signatureUploadId,
              operator_email: formData.operator_email
            }
          };

          const finalRes = await axios.post(`${API_BASE}/operations/service-reports`, reportPayload);
          
          if (finalRes.status === 201) {
            setSuccessMsg(`Ledger written successfully! ${finalRes.data.message}`);
          }
        } catch (innerErr: any) {
          console.error(innerErr);
          // Standard error envelope structure parser matching spec rules
          const errMsg = innerErr.response?.data?.detail || "Network pipeline exception occurred.";
          alert(`Transmission Refused: ${errMsg}`);
        } finally {
          setIsSubmitting(false);
        }
      }, "image/png");

    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', padding: '24px', fontFamily: 'monospace', color: '#1e293b' }}>
      <h2>🛠️ Phase C Field Execution Desk (Dynamic Mode)</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label>SR Number:</label>
          <input type="text" name="sr_no" value={formData.sr_no} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label>Parent DO Reference:</label>
          <input type="text" name="do_no" value={formData.do_no} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label>Client Company Name:</label>
          <input type="text" name="company" value={formData.company} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label>Outlet / Site Location:</label>
          <input type="text" name="store_name" value={formData.store_name} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label>Client PIC Name:</label>
          <input type="text" name="pic_name" value={formData.pic_name} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label>Operator Email Contract:</label>
          <input type="email" name="operator_email" value={formData.operator_email} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Fault Diagnostic Text:</label>
        <textarea name="diagnostic" value={formData.diagnostic} onChange={handleInputChange} style={{ width: '100%', height: '60px' }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>Action Taken / Resolution Ledger:</label>
        <textarea name="action_taken" value={formData.action_taken} onChange={handleInputChange} style={{ width: '100%', height: '60px' }} />
      </div>

      <div style={{ border: '2px solid #cbd5e1', background: '#fff', borderRadius: '4px', marginBottom: '12px' }}>
        <SignatureCanvas ref={sigCanvasRef} penColor="#020617" canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={clearCanvas} style={{ padding: '8px 16px', cursor: 'pointer' }}>Clear Pad</button>
        <button onClick={handleExecuteSignOff} disabled={isSubmitting} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
          {isSubmitting ? "Locking Transaction Data..." : "Execute Authorization Submit"}
        </button>
      </div>

      {successMsg && (
        <div style={{ marginTop: '16px', background: '#bbf7d0', padding: '12px', borderLeft: '4px solid #16a34a' }}>
          <strong>✅ {successMsg}</strong>
        </div>
      )}
    </div>
  );
};