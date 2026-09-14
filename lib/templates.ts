// ============================================================
// ResumeForge — Bundled Resume Template System
// lib/templates.ts
// ============================================================

import { CompilerSettings, DEFAULT_COMPILER_SETTINGS } from "./storage";

export type TemplateCategory = "Classic" | "Modern" | "Minimal" | "Academic";

export interface TemplateFile {
  name: string;
  path: string;
  type: "tex" | "image" | "asset";
  content: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  recommendedUseCase: string;
  compilerSettings: CompilerSettings;
  files: TemplateFile[];
  previewSvg: string;
}

// ---- SVG Visual Mockup Previews -----------------------------

const CLASSIC_PREVIEW_SVG = `<svg viewBox="0 0 210 297" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded shadow-sm border border-zinc-800 bg-zinc-900">
  <rect x="0" y="0" width="210" height="297" fill="#18181b" />
  <!-- Header -->
  <rect x="65" y="20" width="80" height="7" rx="1.5" fill="#f4f4f5" />
  <rect x="75" y="31" width="60" height="3" rx="1" fill="#71717a" />
  <line x1="20" y1="40" x2="190" y2="40" stroke="#3f3f46" stroke-width="0.75" />
  
  <!-- Section 1: Summary -->
  <rect x="20" y="48" width="50" height="4" rx="1" fill="#e4e4e7" />
  <rect x="20" y="56" width="170" height="2.5" rx="0.5" fill="#52525b" />
  <rect x="20" y="61" width="155" height="2.5" rx="0.5" fill="#52525b" />

  <!-- Section 2: Experience -->
  <rect x="20" y="74" width="65" height="4" rx="1" fill="#e4e4e7" />
  <line x1="20" y1="81" x2="190" y2="81" stroke="#3f3f46" stroke-width="0.5" />
  
  <rect x="20" y="87" width="90" height="3" rx="1" fill="#a1a1aa" />
  <rect x="145" y="87" width="45" height="3" rx="1" fill="#71717a" />
  <circle cx="24" cy="95" r="1.2" fill="#71717a" />
  <rect x="30" y="94" width="155" height="2" rx="0.5" fill="#52525b" />
  <circle cx="24" cy="100" r="1.2" fill="#71717a" />
  <rect x="30" y="99" width="140" height="2" rx="0.5" fill="#52525b" />

  <rect x="20" y="108" width="85" height="3" rx="1" fill="#a1a1aa" />
  <rect x="150" y="108" width="40" height="3" rx="1" fill="#71717a" />
  <circle cx="24" cy="116" r="1.2" fill="#71717a" />
  <rect x="30" y="115" width="150" height="2" rx="0.5" fill="#52525b" />

  <!-- Section 3: Education -->
  <rect x="20" y="128" width="55" height="4" rx="1" fill="#e4e4e7" />
  <line x1="20" y1="135" x2="190" y2="135" stroke="#3f3f46" stroke-width="0.5" />
  <rect x="20" y="141" width="100" height="3" rx="1" fill="#a1a1aa" />
  <rect x="155" y="141" width="35" height="3" rx="1" fill="#71717a" />
  <rect x="20" y="147" width="120" height="2.5" rx="0.5" fill="#52525b" />

  <!-- Section 4: Skills -->
  <rect x="20" y="160" width="45" height="4" rx="1" fill="#e4e4e7" />
  <line x1="20" y1="167" x2="190" y2="167" stroke="#3f3f46" stroke-width="0.5" />
  <rect x="20" y="173" width="165" height="2.5" rx="0.5" fill="#52525b" />
  <rect x="20" y="178" width="150" height="2.5" rx="0.5" fill="#52525b" />
</svg>`;

const MODERN_PREVIEW_SVG = `<svg viewBox="0 0 210 297" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded shadow-sm border border-zinc-800 bg-zinc-900">
  <rect x="0" y="0" width="210" height="297" fill="#18181b" />
  <!-- Header with Accent Bar -->
  <rect x="20" y="18" width="4" height="32" rx="1" fill="#3b82f6" />
  <rect x="32" y="20" width="100" height="8" rx="1.5" fill="#f4f4f5" />
  <rect x="32" y="32" width="70" height="3.5" rx="1" fill="#60a5fa" />
  <rect x="32" y="40" width="120" height="2.5" rx="0.5" fill="#71717a" />

  <!-- Section 1: Experience -->
  <rect x="20" y="58" width="80" height="4.5" rx="1" fill="#60a5fa" />
  <line x1="20" y1="66" x2="190" y2="66" stroke="#2563eb" stroke-width="1" />

  <rect x="20" y="73" width="95" height="3" rx="1" fill="#e4e4e7" />
  <rect x="145" y="73" width="45" height="3" rx="1" fill="#60a5fa" />
  <rect x="20" y="80" width="165" height="2.5" rx="0.5" fill="#a1a1aa" />
  <rect x="20" y="85" width="150" height="2.5" rx="0.5" fill="#52525b" />

  <rect x="20" y="95" width="90" height="3" rx="1" fill="#e4e4e7" />
  <rect x="145" y="95" width="45" height="3" rx="1" fill="#60a5fa" />
  <rect x="20" y="102" width="160" height="2.5" rx="0.5" fill="#a1a1aa" />

  <!-- Section 2: Projects -->
  <rect x="20" y="118" width="60" height="4.5" rx="1" fill="#60a5fa" />
  <line x1="20" y1="126" x2="190" y2="126" stroke="#2563eb" stroke-width="1" />
  <rect x="20" y="133" width="85" height="3" rx="1" fill="#e4e4e7" />
  <rect x="20" y="139" width="165" height="2.5" rx="0.5" fill="#52525b" />

  <!-- Section 3: Education & Skills -->
  <rect x="20" y="155" width="70" height="4.5" rx="1" fill="#60a5fa" />
  <line x1="20" y1="163" x2="190" y2="163" stroke="#2563eb" stroke-width="1" />
  <rect x="20" y="170" width="110" height="3" rx="1" fill="#e4e4e7" />
  <rect x="20" y="176" width="140" height="2.5" rx="0.5" fill="#52525b" />
</svg>`;

const MINIMAL_PREVIEW_SVG = `<svg viewBox="0 0 210 297" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded shadow-sm border border-zinc-800 bg-zinc-900">
  <rect x="0" y="0" width="210" height="297" fill="#18181b" />
  <!-- Centered Minimal Header -->
  <rect x="55" y="24" width="100" height="7" rx="1" fill="#f4f4f5" />
  <rect x="70" y="35" width="70" height="2.5" rx="0.5" fill="#a1a1aa" />

  <!-- Section 1 -->
  <rect x="25" y="52" width="40" height="3.5" rx="0.5" fill="#e4e4e7" />
  <line x1="25" y1="58" x2="185" y2="58" stroke="#3f3f46" stroke-width="0.5" />
  <rect x="25" y="65" width="80" height="2.5" rx="0.5" fill="#d4d4d8" />
  <rect x="145" y="65" width="40" height="2.5" rx="0.5" fill="#71717a" />
  <rect x="25" y="71" width="155" height="2" rx="0.5" fill="#52525b" />
  <rect x="25" y="75" width="140" height="2" rx="0.5" fill="#52525b" />

  <!-- Section 2 -->
  <rect x="25" y="89" width="48" height="3.5" rx="0.5" fill="#e4e4e7" />
  <line x1="25" y1="95" x2="185" y2="95" stroke="#3f3f46" stroke-width="0.5" />
  <rect x="25" y="102" width="85" height="2.5" rx="0.5" fill="#d4d4d8" />
  <rect x="145" y="102" width="40" height="2.5" rx="0.5" fill="#71717a" />
  <rect x="25" y="108" width="150" height="2" rx="0.5" fill="#52525b" />

  <!-- Section 3 -->
  <rect x="25" y="122" width="35" height="3.5" rx="0.5" fill="#e4e4e7" />
  <line x1="25" y1="128" x2="185" y2="128" stroke="#3f3f46" stroke-width="0.5" />
  <rect x="25" y="135" width="160" height="2" rx="0.5" fill="#52525b" />
  <rect x="25" y="140" width="135" height="2" rx="0.5" fill="#52525b" />
</svg>`;

const ACADEMIC_PREVIEW_SVG = `<svg viewBox="0 0 210 297" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded shadow-sm border border-zinc-800 bg-zinc-900">
  <rect x="0" y="0" width="210" height="297" fill="#18181b" />
  <!-- Academic Header -->
  <rect x="20" y="20" width="110" height="7.5" rx="1" fill="#f4f4f5" />
  <rect x="20" y="31" width="80" height="3" rx="0.5" fill="#a1a1aa" />
  <rect x="20" y="37" width="130" height="2.5" rx="0.5" fill="#71717a" />
  <line x1="20" y1="44" x2="190" y2="44" stroke="#e4e4e7" stroke-width="1" />

  <!-- Education -->
  <rect x="20" y="52" width="60" height="4" rx="0.5" fill="#e4e4e7" />
  <rect x="20" y="60" width="100" height="3" rx="0.5" fill="#d4d4d8" />
  <rect x="150" y="60" width="40" height="3" rx="0.5" fill="#71717a" />
  <rect x="20" y="66" width="140" height="2.5" rx="0.5" fill="#52525b" />

  <!-- Research Experience -->
  <rect x="20" y="78" width="90" height="4" rx="0.5" fill="#e4e4e7" />
  <rect x="20" y="86" width="110" height="3" rx="0.5" fill="#d4d4d8" />
  <rect x="150" y="86" width="40" height="3" rx="0.5" fill="#71717a" />
  <rect x="20" y="92" width="165" height="2" rx="0.5" fill="#52525b" />
  <rect x="20" y="96" width="150" height="2" rx="0.5" fill="#52525b" />

  <!-- Publications -->
  <rect x="20" y="108" width="70" height="4" rx="0.5" fill="#e4e4e7" />
  <rect x="20" y="116" width="165" height="2.5" rx="0.5" fill="#a1a1aa" />
  <rect x="20" y="121" width="145" height="2" rx="0.5" fill="#52525b" />

  <rect x="20" y="128" width="160" height="2.5" rx="0.5" fill="#a1a1aa" />
  <rect x="20" y="133" width="140" height="2" rx="0.5" fill="#52525b" />
</svg>`;

// ---- Built-in Template Code Samples -------------------------

const CLASSIC_TEX = `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{enumitem}

\\pagestyle{empty}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Colors
\\definecolor{darkblue}{RGB}{0,51,102}

% Formatting section titles
\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large\\color{darkblue}}{}{0em}{}[\\color{darkblue}\\line(1,0){500}\\vspace{-5pt}]

\\begin{document}

% Header
\\begin{center}
  {\\Huge \\scshape \\bfseries Alex Morgan} \\\\ \\vspace{4pt}
  \\small (555) 019-2834 \\textbullet{} alex.morgan@example.com \\textbullet{} github.com/alexmorgan \\textbullet{} Jodhpur, India
\\end{center}

% Summary
\\section{Professional Summary}
Senior Full-Stack Engineer with 5+ years of experience engineering scalable web applications, REST APIs, and modern frontend interfaces. Adept at TypeScript, React, Node.js, and automated LaTeX document architectures.

% Experience
\\section{Experience}

\\textbf{TechCorp Solutions} \\hfill Jodhpur, India \\\\
\\textit{Senior Software Engineer} \\hfill Jan 2023 -- Present
\\begin{itemize}[noitemsep,topsep=2pt,leftmargin=15pt]
  \\item Architected and launched a cloud microservice handling over 100,000 daily active user transactions.
  \\item Reduced frontend page load latency by 45\\% through dynamic code splitting and asset optimization.
  \\item Mentored junior engineers and instituted automated end-to-end integration testing.
\\end{itemize}

\\vspace{4pt}

\\textbf{Innovate Systems} \\hfill Jaipur, India \\\\
\\textit{Full Stack Developer} \\hfill Jun 2021 -- Dec 2022
\\begin{itemize}[noitemsep,topsep=2pt,leftmargin=15pt]
  \\item Built real-time analytics dashboard with React, Node.js, and WebSocket streaming data.
  \\item Designed PostgreSQL schema migrations and optimized SQL query execution plans.
\\end{itemize}

% Education
\\section{Education}

\\textbf{Jodhpur Institute of Engineering and Technology} \\hfill Jodhpur, India \\\\
Bachelor of Technology in Computer Science \\hfill Graduated May 2021

% Skills
\\section{Technical Skills}
\\begin{itemize}[noitemsep,topsep=2pt,leftmargin=15pt]
  \\item \\textbf{Languages}: TypeScript, JavaScript, Python, C++, HTML5, CSS3, SQL
  \\item \\textbf{Frameworks}: React, Next.js, Node.js, Express, Tailwind CSS
  \\item \\textbf{Tools \\& Infrastructure}: Git, Docker, Linux, PostgreSQL, Jest, Webpack
\\end{itemize}

\\end{document}
`;

const MODERN_MAIN_TEX = `\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\definecolor{primary}{RGB}{37, 99, 235} % Royal Blue accent
\\definecolor{darkgray}{RGB}{30, 41, 59}

\\pagestyle{empty}

% Styled Section Headings
\\titleformat{\\section}
  {\\color{primary}\\Large\\bfseries\\scshape}
  {}
  {0em}
  {}
  [\\color{primary}\\titlerule]

\\titlespacing*{\\section}{0pt}{10pt}{6pt}

\\begin{document}

% Modern Header with Bar Accent
\\begin{center}
  {\\Huge \\bfseries \\color{darkgray} Jordan Vance} \\\\[4pt]
  {\\color{primary}\\large Lead Product Engineer \\& Software Architect} \\\\[6pt]
  \\small jordan.vance@example.com \\,\\textbullet\\, +91 98765 43210 \\,\\textbullet\\, linkedin.com/in/jordanvance
\\end{center}

\\vspace{6pt}

\\input{sections/experience.tex}
\\input{sections/projects.tex}
\\input{sections/education.tex}
\\input{sections/skills.tex}

\\end{document}
`;

const MODERN_EXP_TEX = `% sections/experience.tex
\\section{Professional Experience}

{\\Large \\textbf{Enterprise Cloud Platform}} \\hfill \\textbf{Jan 2022 -- Present} \\\\
\\textit{Lead Software Architect} \\hfill \\textit{Bangalore, India}
\\begin{itemize}[leftmargin=14pt, itemsep=2pt, topsep=3pt]
  \\item Directed the engineering of a distributed document processing pipeline processing 2M+ PDFs monthly.
  \\item Reduced cloud infrastructure costs by 30\\% via containerization and auto-scaling policies.
  \\item Led a cross-functional squad of 8 developers using Agile methodologies.
\\end{itemize}

\\vspace{4pt}

{\\Large \\textbf{Apex Digital Systems}} \\hfill \\textbf{Aug 2019 -- Dec 2021} \\\\
\\textit{Senior Frontend Engineer} \\hfill \\textit{Remote}
\\begin{itemize}[leftmargin=14pt, itemsep=2pt, topsep=3pt]
  \\item Developed scalable component library adopted across 12 product lines.
  \\item Maintained 99.9\\% application uptime across major platform releases.
\\end{itemize}
`;

const MODERN_PROJ_TEX = `% sections/projects.tex
\\section{Key Projects}

\\textbf{ResumeForge LaTeX Workspace} \\hfill \\textit{TypeScript, Next.js, Docker}
\\begin{itemize}[leftmargin=14pt, itemsep=2pt, topsep=3pt]
  \\item Built browser-native IDE with sandboxed pdflatex compilation and real-time PDF preview.
  \\item Engineered local multi-project storage system with zero third-party telemetry.
\\end{itemize}
`;

const MODERN_EDU_TEX = `% sections/education.tex
\\section{Education}

\\textbf{National Institute of Technology} \\hfill \\textbf{2015 -- 2019} \\\\
Bachelor of Technology in Computer Engineering \\hfill GPA: 3.9 / 4.0
`;

const MODERN_SKILLS_TEX = `% sections/skills.tex
\\section{Skills \\& Core Competencies}
\\textbf{Architecture}: Microservices, RESTful APIs, Container Security, CI/CD \\\\
\\textbf{Tech Stack}: React, Node.js, Next.js, TypeScript, PostgreSQL, Docker, LaTeX
`;

const MINIMAL_TEX = `\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\huge \\textbf{Taylor Reed}} \\\\[4pt]
  taylor.reed@example.com \\, | \\, +1 (555) 234-5678 \\, | \\, github.com/treed
\\end{center}

\\vspace{10pt}

\\noindent\\textbf{\\large EXPERIENCE}
\\rule{\\linewidth}{0.4pt}
\\vspace{4pt}

\\noindent \\textbf{Senior Systems Engineer} \\hfill 2022 -- Present \\\\
\\textit{Starlight Cloud Infrastructure} \\hfill Austin, TX
\\begin{itemize}
  \\item Built resilient edge networking proxies handling 50k requests/sec with sub-5ms latency.
  \\item Authored comprehensive internal developer tooling in Rust and Go.
\\end{itemize}

\\vspace{6pt}

\\noindent \\textbf{Full Stack Engineer} \\hfill 2019 -- 2022 \\\\
\\textit{Vanguard Digital} \\hfill San Francisco, CA
\\begin{itemize}
  \\item Migrated monolithic codebase to modular TypeScript components, improving test coverage to 92\\%.
\\end{itemize}

\\vspace{10pt}

\\noindent\\textbf{\\large EDUCATION}
\\rule{\\linewidth}{0.4pt}
\\vspace{4pt}

\\noindent \\textbf{B.S. in Computer Science} \\hfill 2015 -- 2019 \\\\
University of California, Berkeley

\\vspace{10pt}

\\noindent\\textbf{\\large SKILLS}
\\rule{\\linewidth}{0.4pt}
\\vspace{4pt}

\\noindent TypeScript, Go, Python, React, PostgreSQL, Docker, Linux Systems Programming.

\\end{document}
`;

const ACADEMIC_MAIN_TEX = `\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Dr. Morgan E. Sterling}} \\\\[4pt]
  Department of Computer Science \\, \\textbullet \\, Institute for Advanced Research \\\\
  Email: m.sterling@example.edu \\, \\textbullet \\, Web: research.example.edu/msterling
\\end{center}

\\vspace{10pt}

\\input{sections/education.tex}
\\input{sections/research.tex}
\\input{sections/publications.tex}
\\input{sections/skills.tex}

\\end{document}
`;

const ACADEMIC_EDU_TEX = `% sections/education.tex
\\section{Education}

\\textbf{Ph.D. in Computer Science} \\hfill 2018 -- 2023 \\\\
Massachusetts Institute of Technology (MIT) \\\\
\\textit{Dissertation}: Formal Verification of Distributed Consensus Protocols

\\vspace{4pt}

\\textbf{B.S. in Mathematics and Computer Science} \\hfill 2014 -- 2018 \\\\
Stanford University \\hfill \\textit{Summa Cum Laude}
`;

const ACADEMIC_RESEARCH_TEX = `% sections/research.tex
\\section{Research Appointments}

\\textbf{Postdoctoral Fellow} \\hfill 2023 -- Present \\\\
Center for Quantum \\& Distributed Computing, Cambridge, MA
\\begin{itemize}
  \\item Researching verified fault-tolerant state machine replication in modern cloud networks.
  \\item Co-principal investigator on standardizing protocol analysis tools.
\\end{itemize}
`;

const ACADEMIC_PUBS_TEX = `% sections/publications.tex
\\section{Selected Publications}

\\begin{enumerate}
  \\item \\textbf{Sterling, M. E.}, \\& Davis, K. (2024). Automated Verification of Fault-Tolerant Distributed Consensus. \\textit{Journal of the ACM}, 71(3), 145--182.
  \\item \\textbf{Sterling, M. E.}, Chen, L., \\& Patel, R. (2022). High-Throughput Proof Assistance for Memory-Safe Languages. In \\textit{Proceedings of POPL '22} (pp. 89--104).
\\end{enumerate}
`;

const ACADEMIC_SKILLS_TEX = `% sections/skills.tex
\\section{Academic Service \\& Teaching}

\\textbf{Teaching Assistant}: Formal Methods (CS 6.824), MIT (2021--2022) \\\\
\\textbf{Reviewer}: ACM POPL, IEEE S\\&P, PLDI \\\\
\\textbf{Languages}: Coq, Lean, OCaml, C++, Python, LaTeX
`;

// ---- Registry Export ---------------------------------------

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic Professional",
    category: "Classic",
    description: "Traditional single-column resume with clean typography and conservative section headers.",
    recommendedUseCase: "Ideal for Software Engineering, Business, Finance & Corporate roles.",
    compilerSettings: { ...DEFAULT_COMPILER_SETTINGS },
    previewSvg: CLASSIC_PREVIEW_SVG,
    files: [
      {
        name: "main.tex",
        path: "main.tex",
        type: "tex",
        content: CLASSIC_TEX,
      },
    ],
  },
  {
    id: "modern",
    name: "Modern Executive",
    category: "Modern",
    description: "Contemporary resume featuring an accent title bar and multi-file section architecture.",
    recommendedUseCase: "Best for Product Managers, Tech Leads, Designers & Senior Engineers.",
    compilerSettings: { paperSize: "letter", passes: 1 },
    previewSvg: MODERN_PREVIEW_SVG,
    files: [
      {
        name: "main.tex",
        path: "main.tex",
        type: "tex",
        content: MODERN_MAIN_TEX,
      },
      {
        name: "experience.tex",
        path: "sections/experience.tex",
        type: "tex",
        content: MODERN_EXP_TEX,
      },
      {
        name: "projects.tex",
        path: "sections/projects.tex",
        type: "tex",
        content: MODERN_PROJ_TEX,
      },
      {
        name: "education.tex",
        path: "sections/education.tex",
        type: "tex",
        content: MODERN_EDU_TEX,
      },
      {
        name: "skills.tex",
        path: "sections/skills.tex",
        type: "tex",
        content: MODERN_SKILLS_TEX,
      },
    ],
  },
  {
    id: "minimal",
    name: "Minimalist Standard",
    category: "Minimal",
    description: "Sleek, highly readable resume with restrained spacing and subtle line dividers.",
    recommendedUseCase: "Great for Startups, Developers, Systems Engineers & Minimalist Aesthetics.",
    compilerSettings: { ...DEFAULT_COMPILER_SETTINGS },
    previewSvg: MINIMAL_PREVIEW_SVG,
    files: [
      {
        name: "main.tex",
        path: "main.tex",
        type: "tex",
        content: MINIMAL_TEX,
      },
    ],
  },
  {
    id: "academic",
    name: "Academic CV",
    category: "Academic",
    description: "Structured multi-file CV for research publications, teaching, and academic background.",
    recommendedUseCase: "Perfect for Researchers, Professors, PhD Candidates & Scholars.",
    compilerSettings: { paperSize: "letter", passes: 1 },
    previewSvg: ACADEMIC_PREVIEW_SVG,
    files: [
      {
        name: "main.tex",
        path: "main.tex",
        type: "tex",
        content: ACADEMIC_MAIN_TEX,
      },
      {
        name: "education.tex",
        path: "sections/education.tex",
        type: "tex",
        content: ACADEMIC_EDU_TEX,
      },
      {
        name: "research.tex",
        path: "sections/research.tex",
        type: "tex",
        content: ACADEMIC_RESEARCH_TEX,
      },
      {
        name: "publications.tex",
        path: "sections/publications.tex",
        type: "tex",
        content: ACADEMIC_PUBS_TEX,
      },
      {
        name: "skills.tex",
        path: "sections/skills.tex",
        type: "tex",
        content: ACADEMIC_SKILLS_TEX,
      },
    ],
  },
];
