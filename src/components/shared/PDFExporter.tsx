import { Printer, ShieldAlert, Sparkles, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PDFPlantData {
  nickname: string;
  scientific_name?: string;
  location?: string;
  room?: string;
  health_score: number;
  last_watered?: string;
  next_water_date?: string;
  notes?: string;
  difficulty?: string;
  light?: string;
  water?: string;
  toxicity?: string;
  care_tips?: string[];
}

interface PDFExporterProps {
  plant: PDFPlantData;
  journalEntries?: Array<{ note: string; created_at: string; milestone_type?: string }>;
  triggerText?: string;
  variant?: "primary" | "outline" | "hero" | "ghost" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}

export const PDFExporter = ({ 
  plant, 
  journalEntries = [], 
  triggerText = "Export Premium Care PDF",
  variant = "hero",
  size = "default"
}: PDFExporterProps) => {

  const handlePrint = () => {
    // Generate a unique report ID
    const reportId = `PH-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedDate = new Date().toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Create an iframe to render the print layout off-screen and print it cleanly
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) return;

    // Construct the print layout HTML with gorgeous styling
    const tipsHtml = (plant.care_tips || [
      "Water thoroughly when the top 2 inches of soil are dry.",
      "Place in bright, indirect sunlight near an east or west window.",
      "Maintain ambient room temperature between 18°C and 27°C.",
      "Feed with diluted liquid fertilizer once a month in spring & summer."
    ]).map(tip => `
      <li style="margin-bottom: 8px; display: flex; align-items: start; gap: 8px;">
        <span style="color: #15803d; font-weight: bold; margin-top: 1px;">✓</span>
        <span>${tip}</span>
      </li>
    `).join("");

    const journalHtml = journalEntries.length > 0 
      ? journalEntries.slice(0, 3).map(entry => `
        <div style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #64748b;">
            <span style="text-transform: uppercase; font-weight: 600; font-size: 9px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
              ${entry.milestone_type || 'general'}
            </span>
            <span>${new Date(entry.created_at).toLocaleDateString()}</span>
          </div>
          <div style="color: #334155; italic">${entry.note}</div>
        </div>
      `).join("")
      : `<p style="font-size: 12px; color: #94a3b8; font-style: italic; margin: 10px 0;">No recent journal entries recorded for this plant.</p>`;

    const toxicityColor = (plant.toxicity?.toLowerCase().includes("toxic") && !plant.toxicity?.toLowerCase().includes("non-toxic"))
      ? "#ef4444" 
      : "#15803d";
    
    const toxicityBg = (plant.toxicity?.toLowerCase().includes("toxic") && !plant.toxicity?.toLowerCase().includes("non-toxic"))
      ? "#fef2f2" 
      : "#f0fdf4";

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${plant.nickname} - Care Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              padding: 15mm;
              position: relative;
              background: #ffffff;
              display: flex;
              flex-direction: column;
            }
            .header-banner {
              background: linear-gradient(135deg, #14532d, #064e3b);
              color: #ffffff;
              padding: 24px 30px;
              border-radius: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 25px;
            }
            .header-banner h1 {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 26px;
              margin: 0;
              font-weight: 700;
            }
            .header-banner .brand-accent {
              color: #fbbf24;
            }
            .header-banner p {
              margin: 4px 0 0 0;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #a7f3d0;
            }
            .report-meta {
              text-align: right;
              font-size: 11px;
              color: #e2e8f0;
            }
            .grid-container {
              display: grid;
              grid-template-columns: 2.5fr 3.5fr;
              gap: 20px;
              flex: 1;
            }
            .column-left {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .column-right {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 18px;
              background-color: #ffffff;
            }
            .card-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 16px;
              font-weight: 700;
              color: #1e293b;
              margin-top: 0;
              margin-bottom: 12px;
              border-bottom: 1.5px solid #f1f5f9;
              padding-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .plant-profile {
              background: linear-gradient(180deg, #f8fafc, #f1f5f9);
              border: 1px dashed #cbd5e1;
            }
            .plant-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            .plant-subtitle {
              font-style: italic;
              color: #64748b;
              font-size: 13px;
              margin: 2px 0 10px 0;
            }
            .health-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #dcfce7;
              color: #166534;
              font-weight: 700;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 13px;
            }
            .stat-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              padding: 6px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            .stat-row:last-child {
              border-bottom: none;
            }
            .stat-label {
              color: #64748b;
              font-weight: 500;
            }
            .stat-value {
              font-weight: 600;
              color: #0f172a;
            }
            .warning-card {
              background: ${toxicityBg};
              border: 1.5px solid ${toxicityColor};
              border-radius: 8px;
              padding: 12px;
              font-size: 12px;
              color: #0f172a;
              margin-bottom: 10px;
            }
            .warning-header {
              font-weight: 700;
              color: ${toxicityColor};
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .care-pill-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 15px;
            }
            .care-pill {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
            }
            .care-pill-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .care-pill-value {
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
            }
            
            /* Cutout Plant Tag Stake */
            .cutout-tag {
              border: 2px dashed #94a3b8;
              border-radius: 12px;
              padding: 15px;
              margin-top: 30px;
              background-color: #fafbfd;
              position: relative;
            }
            .cutout-tag::before {
              content: "✂ CUTOUT STAKE TAG (Place in pot)";
              position: absolute;
              top: -9px;
              left: 20px;
              background: #ffffff;
              padding: 0 8px;
              font-size: 8px;
              font-weight: 800;
              color: #64748b;
              letter-spacing: 1px;
            }
            .tag-grid {
              display: grid;
              grid-template-columns: 1.2fr 2fr 1fr;
              align-items: center;
              gap: 15px;
            }
            .tag-qr-mock {
              width: 70px;
              height: 70px;
              border: 1px solid #cbd5e1;
              background: white;
              padding: 4px;
              border-radius: 6px;
            }
            .tag-checklist {
              font-size: 10px;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            
            /* Footer */
            .footer-info {
              border-top: 1px solid #e2e8f0;
              margin-top: 25px;
              padding-top: 12px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Top Banner -->
            <div class="header-banner">
              <div>
                <h1>Plantastic<span class="brand-accent">Haven</span></h1>
                <p>PRO CERTIFIED CARE GUIDE</p>
              </div>
              <div class="report-meta">
                <div>Report ID: <strong>${reportId}</strong></div>
                <div>Export Date: ${formattedDate}</div>
              </div>
            </div>

            <div class="grid-container">
              <!-- Left Side -->
              <div class="column-left">
                <!-- Profile Summary Card -->
                <div class="card plant-profile">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                      <h2 class="plant-title">${plant.nickname}</h2>
                      <div class="plant-subtitle">${plant.scientific_name || 'Species Unidentified'}</div>
                    </div>
                    <div class="health-badge">
                      <span>♥</span> ${plant.health_score}% Health
                    </div>
                  </div>
                  
                  <div class="stat-row">
                    <span class="stat-label">Location:</span>
                    <span class="stat-value">${plant.location || 'Indoor'}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Placement Room:</span>
                    <span class="stat-value">${plant.room || 'Not specified'}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Last Watered:</span>
                    <span class="stat-value">${plant.last_watered ? new Date(plant.last_watered).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Next Irrigation:</span>
                    <span class="stat-value">${plant.next_water_date ? new Date(plant.next_water_date).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Care Difficulty:</span>
                    <span class="stat-value" style="color: #b45309">${plant.difficulty || 'Easy'}</span>
                  </div>
                </div>

                <!-- Toxicity Warnings -->
                <div class="warning-card">
                  <div class="warning-header">
                    <span>⚠️</span> TOXICITY INFORMATION
                  </div>
                  <div style="line-height: 1.4;">${plant.toxicity || 'Non-toxic to pets and young children. Perfect for families.'}</div>
                </div>

                <!-- Journal Entries Card -->
                <div class="card" style="flex: 1;">
                  <h3 class="card-title">📖 Garden Log Entries</h3>
                  ${journalHtml}
                </div>
              </div>

              <!-- Right Side -->
              <div class="column-right">
                <!-- Environmental Needs -->
                <div class="card">
                  <h3 class="card-title">☀️ Environmental Requirements</h3>
                  <div class="care-pill-grid">
                    <div class="care-pill">
                      <div class="care-pill-label">Lighting Needs</div>
                      <div class="care-pill-value">${plant.light || 'Bright Indirect'}</div>
                    </div>
                    <div class="care-pill">
                      <div class="care-pill-label">Water Intake</div>
                      <div class="care-pill-value">${plant.water || 'Every 7 days'}</div>
                    </div>
                  </div>
                  <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 0;">
                    Ensure soil drains fully. Keep in recommended ambient light settings. Rotate the pot 90 degrees monthly to guarantee even structural growth and prevent leggy reaching.
                  </p>
                </div>

                <!-- Care Protocols -->
                <div class="card" style="flex: 1;">
                  <h3 class="card-title">🌿 Vital Care Guidelines</h3>
                  <ul style="padding-left: 0; list-style-type: none; margin: 0; font-size: 12px; line-height: 1.6; color: #334155;">
                    ${tipsHtml}
                  </ul>
                  ${plant.notes ? `
                    <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #64748b; font-size: 11px;">
                      <strong style="display: block; color: #475569; margin-bottom: 2px;">User Notes:</strong>
                      <span style="color: #64748b; font-style: italic;">"${plant.notes}"</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Cutout Tag -->
            <div class="cutout-tag">
              <div class="tag-grid">
                <div>
                  <div style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 800; color: #14532d;">${plant.nickname}</div>
                  <div style="font-size: 9px; font-style: italic; color: #64748b; line-height: 1.2; margin-top: 2px;">${plant.scientific_name || 'Species Care Label'}</div>
                  <div style="margin-top: 8px; font-size: 9px; font-weight: 700; color: #b45309;">Diff: ${plant.difficulty || 'Easy'}</div>
                </div>
                
                <div class="tag-checklist">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #64748b; border-radius: 2px;"></span>
                    <span>Light: <strong>${plant.light || 'Bright Indirect'}</strong></span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #64748b; border-radius: 2px;"></span>
                    <span>Water: <strong>${plant.water || 'Every 7 days'}</strong></span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #ef4444; border-radius: 2px;"></span>
                    <span style="font-size: 8px;">Toxicity: ${(plant.toxicity?.toLowerCase().includes("toxic") && !plant.toxicity?.toLowerCase().includes("non-toxic")) ? '⚠️ TOXIC' : '✓ Safe'}</span>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <!-- Mock QR code svg -->
                  <svg class="tag-qr-mock" viewBox="0 0 29 29" fill="none" stroke="#000000" stroke-width="1">
                    <path d="M1 1h7v7H1V1zM3 3v3h3V3H3zM21 1h7v7h-7V1zM23 3v3h3V3H3zM1 21h7v7H1v-7zM3 23v3h3v-3H3z" fill="currentColor"/>
                    <path d="M12 2h2v4h-2V2zM15 4h3V2h-3v2zM12 12h5v2h-5v-2zM21 12h2v5h-2v-5zM12 18h2v5h-2v-5zM18 18h4v2h-4v-2z" fill="currentColor"/>
                  </svg>
                  <span style="font-size: 7px; color: #94a3b8; font-weight: 700; margin-top: 3px;">SCAN CARD</span>
                </div>
              </div>
            </div>

            <!-- Footer Info -->
            <div class="footer-info">
              <span>PlantasticHaven Premium — Intelligent Care Sequencer & Database Integration</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    // Trigger printing once loaded
    printFrame.onload = () => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      
      // Clean up the iframe after printing (delayed to allow Chrome to work)
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };

    toast({
      title: "PDF Care Report Generated! 📄",
      description: "Opening print layout interface. You can save as PDF or print directly.",
    });
  };

  return (
    <Button 
      variant={variant === "gold" ? "hero" : variant} 
      size={size === "icon" ? "icon" : size}
      onClick={handlePrint}
      className={`${variant === "gold" ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold" : ""} rounded-xl flex items-center justify-center ${size === "icon" ? "p-2" : "gap-2 font-semibold"} transition-all hover:scale-[1.02] shadow-sm`}
      title={size === "icon" ? triggerText : undefined}
    >
      <Printer className={`w-4 h-4 ${size !== "icon" ? "mr-0.5" : ""}`} />
      {size !== "icon" && triggerText}
    </Button>
  );
};
export default PDFExporter;
