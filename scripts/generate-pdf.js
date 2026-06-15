import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

async function generate() {
  console.log("Generating static PDF resume for Shivam Maurya...");
  const doc = new jsPDF("p", "mm", "a4");

  // Page dimensions: 210mm x 297mm
  // Margins: Left: 15mm, Right: 15mm, Top: 15mm
  const marginX = 15;
  let currY = 18;

  // Set margins helper
  const rightBoundary = 210 - marginX;

  // Title section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(26, 37, 48); // Dark steel-blue
  doc.text("SHIVAM MAURYA", marginX, currY);
  
  currY += 6;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6); // Amber tone
  doc.text("AI ENGINEER  •  DATA ANALYST  •  FULL STACK DEVELOPER", marginX, currY);

  // Divider
  currY += 4;
  doc.setDrawColor(26, 37, 48);
  doc.setLineWidth(0.6);
  doc.line(marginX, currY, rightBoundary, currY);

  // Helper to draw standard-compliant clickable hyperlinks in vector PDF
  function drawLinkText(text, x, y, url, color = [37, 99, 235]) {
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { link: { url: url } });
    
    const width = doc.getTextWidth(text);
    const fontSize = doc.getFontSize();
    const heightInMm = (fontSize * 0.35277) * 1.1; 
    const topY = y - (fontSize * 0.35277) * 0.85;
    
    doc.link(x, topY, width, heightInMm, { url: url });
    return width;
  }

  // Contact Info
  currY += 5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  
  let currentX = marginX;
  
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("Email: ", currentX, currY);
  currentX += doc.getTextWidth("Email: ");
  
  const emailWidth = drawLinkText("aniheshmaurya456@gmail.com", currentX, currY, "mailto:aniheshmaurya456@gmail.com");
  currentX += emailWidth;
  
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("  |  ", currentX, currY);
  currentX += doc.getTextWidth("  |  ");
  
  doc.setTextColor(71, 85, 105);
  doc.text("Phone: ", currentX, currY);
  currentX += doc.getTextWidth("Phone: ");
  
  const phoneWidth = drawLinkText("+91 9044144059", currentX, currY, "tel:+919044144059");
  currentX += phoneWidth;
  
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("  |  ", currentX, currY);
  currentX += doc.getTextWidth("  |  ");
  
  doc.setTextColor(71, 85, 105);
  doc.text("Gorakhpur, India", currentX, currY);

  currY += 4.5;
  currentX = marginX;
  
  doc.setTextColor(71, 85, 105);
  doc.text("LinkedIn: ", currentX, currY);
  currentX += doc.getTextWidth("LinkedIn: ");
  
  const linkedinWidth = drawLinkText("linkedin.com/in/shivam-maurya-b5468932b", currentX, currY, "https://linkedin.com/in/shivam-maurya-b5468932b");
  currentX += linkedinWidth;
  
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("  |  ", currentX, currY);
  currentX += doc.getTextWidth("  |  ");
  
  doc.setTextColor(71, 85, 105);
  doc.text("GitHub: ", currentX, currY);
  currentX += doc.getTextWidth("GitHub: ");
  
  const githubWidth = drawLinkText("github.com/DevShivam-maurya", currentX, currY, "https://github.com/DevShivam-maurya");

  // Section: Summary
  currY += 8;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 37, 48);
  doc.text("PROFESSIONAL SUMMARY", marginX, currY);

  // Small Section bar
  currY += 1.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginX, currY, rightBoundary, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  
  const bioPara1 = "A highly motivated Computer Science Engineering (Data Science) student passionate about Artificial Intelligence, Data Analytics, and Full Stack Development. Extremely skilled in Python, SQL, C++, React.js, and modern analytics environments with hands-on experience building complex AI companion suites.";
  const bioPara2 = "Proven capability in building intelligent decision systems, statistical predictive pipelines, and high-fidelity interfaces while adhering strictly to professional clean code architecture.";
  
  const bioLines1 = doc.splitTextToSize(bioPara1, rightBoundary - marginX);
  doc.text(bioLines1, marginX, currY);
  currY += bioLines1.length * 4.2 + 1;

  const bioLines2 = doc.splitTextToSize(bioPara2, rightBoundary - marginX);
  doc.text(bioLines2, marginX, currY);
  currY += bioLines2.length * 4.2 + 4;

  // Section: Technical Skills
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 37, 48);
  doc.text("CORE TECHNICAL COMPETENCIES", marginX, currY);

  currY += 1.5;
  doc.line(marginX, currY, rightBoundary, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text("Programming Languages: ", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Python, C++, SQL, JavaScript, HTML, CSS", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Data Analytics & Viz: ", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Power BI, Tableau, Advanced Excel, Pandas, NumPy, Matplotlib", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Modern Web & DB: ", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("React.js, Express.js, Node.js (Full-stack), MongoDB, REST APIs", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Artificial Intelligence: ", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Generative AI, Prompt Engineering, Gemini / OpenAI SDKs, LLM Heuristics", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Fundamentals: ", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Data Structures & Algorithms (DSA), Object-Oriented Design, UI/UX Basics", marginX + 44, currY);


  // Section: Projects
  currY += 8;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 37, 48);
  doc.text("NOTABLE SOFTWARE VENTURES", marginX, currY);

  currY += 1.5;
  doc.line(marginX, currY, rightBoundary, currY);

  // Project 1
  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39); // Slate-900
  doc.text("AI Profile Enhancer System", marginX, currY);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("(React.js, Python, MongoDB, Gemini AI APIs, Framer Motion, TailwindCSS)", marginX + 48, currY);

  currY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const proj1Desc = "An intelligent evaluation platform that ingests developers' public web footprints (GitHub, LinkedIn, portfolios) to evaluate profile metrics, score overall digital branding, diagnose skill gaps, and suggest professional updates.";
  const proj1Lines = doc.splitTextToSize(proj1Desc, rightBoundary - marginX);
  doc.text(proj1Lines, marginX, currY);
  currY += proj1Lines.length * 4.2 + 1.5;

  // Bullets for Project 1
  const proj1Bullet1 = "• Architected automated scrapers and analysis feeds matching profile details against trending job listings.";
  const proj1Bullet2 = "• Designed high-fidelity telemetry dashboards with granular metrics showing analytical report cards.";
  const proj1LinesB1 = doc.splitTextToSize(proj1Bullet1, rightBoundary - marginX - 4);
  const proj1LinesB2 = doc.splitTextToSize(proj1Bullet2, rightBoundary - marginX - 4);
  
  doc.text(proj1LinesB1, marginX + 3, currY);
  currY += proj1LinesB1.length * 4.2 + 0.5;
  doc.text(proj1LinesB2, marginX + 3, currY);
  currY += proj1LinesB2.length * 4.2 + 4.5;

  // Project 2
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  doc.text("LifeLine AI Assistant System", marginX, currY);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("(React.js, Python, Vite, Gemini Pro SDK, CSS Modules)", marginX + 49, currY);

  currY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const proj2Desc = "A premium glassmorphic conversational companion facilitating personal career growth, automatic daily schedule planning, milestone tracking, and task priority loop controls.";
  const proj2Lines = doc.splitTextToSize(proj2Desc, rightBoundary - marginX);
  doc.text(proj2Lines, marginX, currY);
  currY += proj2Lines.length * 4.2 + 1.5;

  // Bullets for Project 2
  const proj2Bullet1 = "• Developed a structured career roadmap generator mapping modern skills to customizable learning checkpoints.";
  const proj2Bullet2 = "• Integrated real-time heuristic response loops using structured text streams that serve professional insights.";
  const proj2LinesB1 = doc.splitTextToSize(proj2Bullet1, rightBoundary - marginX - 4);
  const proj2LinesB2 = doc.splitTextToSize(proj2Bullet2, rightBoundary - marginX - 4);
  
  doc.text(proj2LinesB1, marginX + 3, currY);
  currY += proj2LinesB1.length * 4.2 + 0.5;
  doc.text(proj2LinesB2, marginX + 3, currY);
  currY += proj2LinesB2.length * 4.2 + 8;


  // Section: Education
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 37, 48);
  doc.text("ACADEMIC CREDENTIALS", marginX, currY);

  currY += 1.5;
  doc.line(marginX, currY, rightBoundary, currY);

  // Edu 1
  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text("GL Bajaj Institute of Technology and Management", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("2023 - 2027", rightBoundary - 22, currY);

  currY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("B.Tech in Computer Science Engineering (Data Science)  |  Status: Pursuing Academic Stream", marginX, currY);

  // Edu 2
  currY += 5.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Academic Global School, Gorakhpur", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Class XII (2023)", rightBoundary - 26, currY);

  currY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Senior Secondary School Certificate (PCM Core)  |  Academic Performance Score: 78.6%", marginX, currY);

  // Edu 3
  currY += 5.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Saraswati Vidya Mandir, Gorakhpur", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Class X (2021)", rightBoundary - 24, currY);

  currY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Secondary School Certificate (General Sciences)  |  Academic Performance Score: 90.16%", marginX, currY);


  // Section: Certifications & Highlights
  currY += 8;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 37, 48);
  doc.text("CREDENTIALS & KEY DISTINCTIONS", marginX, currY);

  currY += 1.5;
  doc.line(marginX, currY, rightBoundary, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text("Professional Certifications:", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("1. Data Analyst Certificate  |  2. Palo Alto Networks Cybersecurity Certification", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Coding DSA Accomplishments:", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Solved over 300+ advanced algorithm cases on elite programming portals.", marginX + 44, currY);

  currY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Operational Proficiencies:", marginX, currY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("B.Tech Specialization in Data Science, GenAI Expert, Full-Stack Architecture capable.", marginX + 44, currY);


  // Footer branding
  currY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(marginX, currY, rightBoundary, currY);
  currY += 3.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Certified digital profile document. Generated organically via Shivam Maurya's Professional AI Portfolio.", marginX, currY);
  doc.text("Page 1 of 1", rightBoundary - 13, currY);

  // Write file out
  const publicDir = path.resolve("./public");
  if (!fs.existsSync(publicDir)) {
    console.log("Creating /public directory...");
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputBuffer = doc.output("arraybuffer");
  const targetPath = path.join(publicDir, "resume.pdf");
  fs.writeFileSync(targetPath, Buffer.from(outputBuffer));
  console.log(`Success! PDF file written to ${targetPath}`);
}

generate().catch(e => {
  console.error("Failed to generate static PDF:", e);
});
