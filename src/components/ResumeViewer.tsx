import { useState } from "react";
import { X, Printer, Download, Mail, Phone, MapPin, Linkedin, Github, FileText, CheckCircle2 } from "lucide-react";
import { PERSONAL_INFO, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS } from "../portfolioData";
import { motion } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ResumeViewerProps {
  onClose: () => void;
  profileImage: string | null;
  showToast?: (msg: string, type?: 'success' | 'info') => void;
}

export default function ResumeViewer({ onClose, profileImage, showToast }: ResumeViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStaticPDF = async () => {
    try {
      if (showToast) {
        showToast("Fetching official resume PDF...", "success");
      }
      
      const response = await fetch("/resume.pdf");
      if (!response.ok) {
        throw new Error(`Failed to fetch /resume.pdf: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Verify that the retrieved binary starts with the %PDF magic string
      const textPreview = await blob.slice(0, 50).text();
      if (!textPreview.startsWith("%PDF")) {
        console.warn("Fetched file is HTML or invalid raw data, forcing clean client-side dynamic generation build...");
        await handleDownloadPDF();
        return;
      }

      // Generate a clean application/pdf blob to ensure correct MIME-type processing
      const cleanBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(cleanBlob);
      
      // Attempt download trigger
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = "Shivam_Maurya_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch (e) {
          // ignore if already removed
        }
        URL.revokeObjectURL(blobUrl);
      }, 500);

      if (showToast) {
        showToast("Resume downloaded successfully!", "success");
      }
    } catch (err) {
      console.warn("Static route download failed, falling back to instant dynamic build:", err);
      await handleDownloadPDF();
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    let cleanStyleEl: HTMLStyleElement | null = null;
    const disabledSheets: { sheet: CSSStyleSheet; wasEnabled: boolean }[] = [];
    const originalGetComputedStyle = window.getComputedStyle;

    try {
      const element = document.getElementById("printable-resume-area");
      if (!element) {
        throw new Error("Printable resume container not found");
      }

      // 1. Gather all CSS rules from accessible styles (excluding cross-origin stylesheets that restrict rules)
      let combinedCss = "";
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = sheet.cssRules;
          if (rules) {
            for (let i = 0; i < rules.length; i++) {
              combinedCss += rules[i].cssText + "\n";
            }
          }
        } catch (sheetError) {
          // Cross-origin stylesheets (like Google Fonts) might fail to access, which is fine as they don't contain Tailwind-themed oklch colors.
          console.warn("Skipped cross-origin stylesheet during oklch sanitization:", sheetError);
        }
      }

      // Helper to dynamically convert Tailwind OKLCH colors to standard RGBA colors
      const replaceOklchWithRgb = (cssText: string): string => {
        let result = cssText.replace(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/gi, (match, lStr, cStr, hStr, aStr) => {
          try {
            const L = parseFloat(lStr);
            const C = parseFloat(cStr);
            const H = parseFloat(hStr);
            let A = 1;
            if (aStr) {
              if (aStr.endsWith("%")) {
                A = parseFloat(aStr) / 100;
              } else {
                A = parseFloat(aStr);
              }
            }

            // OKLCH to linear sRGB conversion formulas
            const hRad = (H * Math.PI) / 180;
            const oklA = C * Math.cos(hRad);
            const oklB = C * Math.sin(hRad);

            const l_lms = L + 0.3963377774 * oklA + 0.2158017574 * oklB;
            const m_lms = L - 0.1055613458 * oklA - 0.0638541728 * oklB;
            const s_lms = L - 0.0894841775 * oklA - 1.2914855480 * oklB;

            const lComp = Math.pow(Math.max(0, l_lms), 3);
            const mComp = Math.pow(Math.max(0, m_lms), 3);
            const sComp = Math.pow(Math.max(0, s_lms), 3);

            const r_linear = 4.0767416621 * lComp - 3.3077115913 * mComp + 0.2309699292 * sComp;
            const g_linear = -1.2684380046 * lComp + 2.6097574011 * mComp - 0.3413193965 * sComp;
            const b_linear = -0.0041960863 * lComp - 0.7034186147 * mComp + 1.7076147010 * sComp;

            const convertChannel = (channelVal: number) => {
              if (channelVal <= 0.0031308) {
                return 12.92 * channelVal;
              }
              return 1.055 * Math.pow(channelVal, 1 / 2.4) - 0.055;
            };

            const r = Math.min(255, Math.max(0, Math.round(convertChannel(r_linear) * 255)));
            const g = Math.min(255, Math.max(0, Math.round(convertChannel(g_linear) * 255)));
            const b = Math.min(255, Math.max(0, Math.round(convertChannel(b_linear) * 255)));

            return `rgba(${r}, ${g}, ${b}, ${A})`;
          } catch {
            return "rgba(100, 116, 139, 1)"; // fallback gray
          }
        });

        // Clean any complex, nested oklch expressions to avoid parser crash
        result = result.replace(/oklch\([^)]+\)/gi, "rgba(100, 116, 139, 1)");
        return result;
      };

      // 2. Intercept window.getComputedStyle to translate oklch to RGBA dynamically for html2canvas
      window.getComputedStyle = function (el: Element, pseudo?: string) {
        const style = originalGetComputedStyle.call(this, el, pseudo);
        return new Proxy(style, {
          get(target, prop) {
            const val = target[prop as keyof typeof target];
            if (typeof val === "string" && val.includes("oklch")) {
              return replaceOklchWithRgb(val);
            }
            if (typeof val === "function") {
              return val.bind(target);
            }
            return val;
          }
        }) as any;
      };

      // 3. Inject a sanitized duplicate style block free of oklch.
      cleanStyleEl = document.createElement("style");
      cleanStyleEl.id = "clean-pdf-styles";
      cleanStyleEl.textContent = replaceOklchWithRgb(combinedCss);
      document.head.appendChild(cleanStyleEl);

      // 4. Temporarily disable ALL other stylesheets to avoid oklch engine crashes
      for (const sheet of Array.from(document.styleSheets)) {
        if (sheet.ownerNode !== cleanStyleEl) {
          disabledSheets.push({ sheet, wasEnabled: !sheet.disabled });
          try {
            sheet.disabled = true;
          } catch (disableErr) {
            console.warn("Could not disable stylesheet during PDF export:", disableErr);
          }
        }
      }

      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
        });
        
        // Dry-trigger toDataURL to test if the canvas is tainted
        canvas.toDataURL("image/png");
      } catch (innerError) {
        console.warn("Canvas was tainted or failed with profile photo. Re-rendering without profile photo...", innerError);
        
        if (showToast) {
          showToast("Optimizing PDF (bypassing custom cross-origin image)...", "info");
        }

        // Temporarily hide images so it's guaranteed same-origin compliant
        const imgs = element.querySelectorAll("img");
        imgs.forEach((img) => {
          img.style.display = "none";
        });

        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
        });

        // Restore image element visibility
        imgs.forEach((img) => {
          img.style.display = "";
        });
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      // Try multiple saving schemes for perfect iframe & browser support
      let downloadSuccessful = false;
      try {
        pdf.save("Shivam_Maurya_Resume.pdf");
        downloadSuccessful = true;
      } catch (saveError) {
        console.warn("Direct pdf.save failed, attempting virtual anchor click:", saveError);
        try {
          const blob = pdf.output("blob");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "Shivam_Maurya_Resume.pdf";
          document.body.appendChild(a);
          a.click();
          downloadSuccessful = true;
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 200);
        } catch (anchorErr) {
          console.error("Custom blob anchor failed, trying fallback:", anchorErr);
        }
      }

      if (downloadSuccessful) {
        if (showToast) {
          showToast("Resume PDF generated and downloaded successfully!", "success");
        }
      } else {
        // Fallback: open PDF stream in a new tab if sandbox prevents direct download
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (win) {
          if (showToast) {
            showToast("Opening PDF document in a new tab for printing...", "info");
          }
        } else {
          if (showToast) {
            showToast("Web sandbox blocked window. Please download our direct PDF fallback instead.", "info");
          }
        }
      }
    } catch (error) {
      console.error("Failed to export canvas to PDF:", error);
      if (showToast) {
        showToast("Dynamic generation failed. Launching print dialogue, or use our direct download fallback...", "info");
      }
      window.print();
    } finally {
      // Restore window.getComputedStyle back to normal
      window.getComputedStyle = originalGetComputedStyle;

      // Restore all original stylesheets back to enabled/disabled status
      for (const item of disabledSheets) {
        try {
          item.sheet.disabled = !item.wasEnabled;
        } catch (restoreErr) {
          console.error("Failed to restore stylesheet status:", restoreErr);
        }
      }
      // Remove temporary style tag
      if (cleanStyleEl) {
        cleanStyleEl.remove();
      }
      setIsDownloading(false);
    }
  };

  return (
    <div id="resume-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden no-print"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-500" />
            <span className="font-display font-semibold text-lg text-white">Shivam_Maurya_Resume.pdf</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleDownloadStaticPDF}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition duration-300 cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span>Download Resume</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-semibold transition duration-300 cursor-pointer shadow-md shadow-cyan-500/10"
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Generate Dynamic PDF</span>
                </>
              )}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold transition duration-300 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Mock PDF Container */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-950/40">
          <div className="bg-white text-slate-800 p-8 rounded-lg shadow-xl max-w-[21cm] mx-auto font-sans leading-relaxed text-[12px]">
            {/* Printable Area Start */}
            <div id="printable-resume-area" className="w-full">
              {/* Core Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-5 flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  {profileImage && (
                    <img 
                      src={profileImage} 
                      alt="Shivam Maurya" 
                      className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">{PERSONAL_INFO.name}</h1>
                    <p className="text-amber-600 font-semibold font-display text-sm tracking-wide mt-1 uppercase">
                      {PERSONAL_INFO.tagline}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{PERSONAL_INFO.email}</span>
                    <Mail className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{PERSONAL_INFO.phone}</span>
                    <Phone className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Gorakhpur, India</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column (8 cols): Summary, Experience/Projects, Education */}
                <div className="col-span-8 space-y-6">
                  {/* Summary */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Professional Summary
                    </h2>
                    <p className="text-slate-700 text-justify">
                      {PERSONAL_INFO.bio[0]} {PERSONAL_INFO.bio[1]} {PERSONAL_INFO.bio[2]}
                    </p>
                  </div>

                  {/* Core Projects */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Core Development Projects
                    </h2>
                    <div className="space-y-4">
                      {PROJECTS.map((project) => (
                        <div key={project.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-slate-900 text-[13px]">{project.title}</h3>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Personal Initiative</span>
                          </div>
                          <p className="text-slate-500 text-[10px] italic mb-1.5 font-mono">
                            Tech Stack: {project.techStack.join(", ")}
                          </p>
                          <p className="text-slate-700 mb-1">{project.description}</p>
                          <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                            {project.features.map((feature, i) => (
                              <li key={i}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Academic Credentials
                    </h2>
                    <div className="space-y-3">
                      {EDUCATION.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-[12px]">{edu.institution}</h3>
                            <p className="text-slate-600">{edu.degree}</p>
                            {edu.score && (
                              <p className="text-violet-700 font-semibold mt-0.5">Academic Score: {edu.score}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-slate-600 text-[10px] font-semibold">{edu.year}</span>
                            {edu.status && (
                              <span className="block text-emerald-600 font-medium text-[9px] uppercase mt-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 italic">
                                {edu.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): Skills, Certifications, Links */}
                <div className="col-span-4 space-y-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  {/* Digital Ecosystem */}
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Socio & Repo Eco
                    </h2>
                    <div className="space-y-2 text-[10px]">
                      <a href={PERSONAL_INFO.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-violet-700 font-semibold hover:underline">
                        <Linkedin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{PERSONAL_INFO.linkedInLabel}</span>
                      </a>
                      <a href={PERSONAL_INFO.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 font-semibold hover:underline">
                        <Github className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{PERSONAL_INFO.githubLabel}</span>
                      </a>
                    </div>
                  </div>

                  {/* Skill Groupings */}
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Tech Competencies
                    </h2>
                    <div className="space-y-3">
                      {["Programming", "Data Analytics", "Web Development", "Database", "AI & ML", "Core Concepts"].map((cat) => {
                        const skillsInCat = SKILLS.filter(s => s.category === cat || (cat === "AI & ML" && s.category === "AI & ML"));
                        if (skillsInCat.length === 0) return null;
                        return (
                          <div key={cat} className="space-y-1">
                            <h4 className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">{cat}</h4>
                            <div className="flex flex-wrap gap-1">
                              {skillsInCat.map(s => (
                                <span key={s.name} className="bg-slate-200/60 text-slate-800 text-[9px] px-1.5 py-0.5 rounded font-medium">
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 font-display">
                      Certificates
                    </h2>
                    <div className="space-y-2.5">
                      {CERTIFICATIONS.map((cert, idx) => (
                        <div key={idx} className="text-[10px]">
                          <h4 className="font-bold text-slate-800 leading-tight">{cert.title}</h4>
                          <p className="text-slate-500 text-[9px]">{cert.issuer} ({cert.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights Card */}
                  <div className="bg-violet-50 p-2.5 rounded border border-violet-100 text-slate-700 space-y-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-700" />
                      <span className="font-bold">Recruiter Checklists</span>
                    </div>
                    <ul className="list-disc pl-3 text-slate-600 space-y-0.5">
                      <li>B.Tech (Data Science) Student</li>
                      <li>Elite in Python & Modern Analytics</li>
                      <li>Highly proficient in Generative AI</li>
                      <li>Capable of custom Full-Stack APIs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Printable Area End */}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-t border-slate-800 text-sm">
          <span className="text-slate-400">Pressing 'Print / Save' will launch standard system export dialog.</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </motion.div>

      {/* Real Printable Section hidden in screen view but active in @media print */}
      <div className="hidden print-only block bg-white text-slate-950 min-h-screen p-8 w-full">
        {/* Core Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            {profileImage && (
              <img 
                src={profileImage} 
                alt="Shivam Maurya" 
                className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">{PERSONAL_INFO.name}</h1>
              <p className="text-amber-700 font-semibold font-display text-sm mt-1 uppercase">
                {PERSONAL_INFO.tagline}
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-700 space-y-0.5">
            <div>Email: {PERSONAL_INFO.email}</div>
            <div>Phone: {PERSONAL_INFO.phone}</div>
            <div>GitHub: {PERSONAL_INFO.githubLabel}</div>
            <div>LinkedIn: {PERSONAL_INFO.linkedInLabel}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 text-slate-900 text-[11px]">
          {/* Main Column */}
          <div className="col-span-8 space-y-5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 font-display text-slate-900">
                Professional Summary
              </h2>
              <p className="text-slate-800">
                {PERSONAL_INFO.bio[0]} {PERSONAL_INFO.bio[1]} {PERSONAL_INFO.bio[2]}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 font-display text-slate-900">
                Core Development Projects
              </h2>
              <div className="space-y-4">
                {PROJECTS.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-[12px] text-slate-900">{project.title}</h3>
                      <span className="text-[9px] text-slate-500 font-mono">Personal Development Initiative</span>
                    </div>
                    <p className="text-slate-500 text-[9px] font-mono mb-1">
                      Technologies used: {project.techStack.join(", ")}
                    </p>
                    <p className="text-slate-800 mb-1 leading-relaxed">{project.description}</p>
                    <ul className="list-disc pl-4 text-slate-800 space-y-0.5 leading-relaxed">
                      {project.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 font-display text-slate-900">
                Education
              </h2>
              <div className="space-y-2">
                {EDUCATION.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[11px] text-slate-900">{edu.institution}</h3>
                      <p className="text-slate-700">{edu.degree}</p>
                      {edu.score && (
                        <p className="text-indigo-700 font-bold mt-0.5">Score Secured: {edu.score}</p>
                      )}
                    </div>
                    <div className="text-right text-slate-600 text-[9px] font-semibold">
                      <span>{edu.year}</span>
                      {edu.status && <p className="text-[8px] font-mono italic">{edu.status}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-5 bg-slate-50 p-4 rounded border border-slate-200">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 font-display text-slate-900">
                Skill Competencies
              </h2>
              <div className="space-y-3">
                {["Programming", "Data Analytics", "Web Development", "Database", "AI & ML", "Core Concepts"].map((cat) => {
                  const skillsInCat = SKILLS.filter(s => s.category === cat);
                  if (skillsInCat.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-0.5">
                      <h4 className="text-[9px] font-bold text-indigo-800 uppercase tracking-tight">{cat}</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillsInCat.map(s => (
                          <span key={s.name} className="bg-white text-slate-800 border border-slate-200 text-[8px] px-1 py-0.2 rounded font-medium">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 font-display text-slate-900">
                Certifications
              </h2>
              <div className="space-y-2">
                {CERTIFICATIONS.map((cert, idx) => (
                  <div key={idx} className="text-[9px]">
                    <h4 className="font-bold text-slate-900">{cert.title}</h4>
                    <p className="text-slate-600 text-[8px]">{cert.issuer} ({cert.year})</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border border-dashed border-indigo-200 rounded text-slate-700 text-[9px] spacing-y-1">
              <span className="font-bold text-indigo-900">Key Distinctions:</span>
              <ul className="list-disc pl-3 text-slate-600 space-y-0.5">
                <li>B.Tech CSE Data Science specialization</li>
                <li>Grounded Machine Learning background</li>
                <li>GenAI API, Prompting expertise</li>
                <li>Proven full-stack project construction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
