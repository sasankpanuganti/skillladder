import os
import io
import re
import spacy
from spacy.matcher import PhraseMatcher, Matcher
import pdfplumber
import docx
from typing import List, Dict, Any, Set, Tuple

class ResumeParser:
    def __init__(self):
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Skill Matcher (Phrase matching for known skills)
        self.skill_matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        # Section Matcher
        self.section_matcher = Matcher(self.nlp.vocab)
        
        self.taxonomy = self._get_massive_taxonomy()
        self._initialize_skill_matcher()
        self._initialize_section_patterns()

    def _get_massive_taxonomy(self) -> Dict[str, List[str]]:
        """A comprehensive, categorized skill taxonomy for professional indexing."""
        return {
            "Programming Languages": [
                "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "PHP", "Ruby", "Swift", "Kotlin", "Go", 
                "Rust", "Scala", "Perl", "Haskell", "SQL", "R", "MATLAB", "Dart", "Solidity", "Assembly", "VB.NET", "Bash",
                "Cobol", "Fortran", "Lisp", "Prolog", "Objective-C", "Elixir", "Erlang", "F#", "Groovy", "Julia", "Lua", "PowerShell"
            ],
            "Web Frameworks & Libraries": [
                "React", "React.js", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "jQuery", "Bootstrap", 
                "Tailwind CSS", "Redux", "MobX", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", 
                "Ruby on Rails", "Asp.net", "NestJS", "GraphQL", "Material UI", "Chakra UI", "SASS", "LESS", "Webpack",
                "Vite", "Babel", "Gulp", "Prisma", "Sequelize", "TypeORM", "Mongoose", "Socket.io", "Astro"
            ],
            "Industrial Automation and Control": [
                "PLC Programming", "Siemens PLC", "S7 300", "S7 1200", "S7-300", "S7-1200", "OMRON PLC", "Allen Bradley", "AB PLC", "ABB PLC", 
                "SCADA", "HMI", "VFD", "PROFIBUS", "PROFINET", "ASI Communication", "Ladder Diagram", 
                "Functional Block Diagram", "FBD", "WinCC", "Simatic Manager", "CX Programmer", "Keyence", "ASRS Warehouse",
                "Track and Trace", "SEW VFD", "Parameter Setting", "Encoder", "IR Device", "Profibus Coupler",
                "Control Panel Design", "Panel Wiring", "Electrical Load Calculation", "Cable Sizing", "SCADA Integration",
                "Industrial Network Troubleshooting", "Ethernet/IP", "Modbus RTU", "Modbus TCP", "Safety PLC",
                "Emergency System Integration", "Servo Motor", "Motion Control", "PID Control Tuning", "Root Cause Analysis",
                "RCA", "Preventive Maintenance", "Predictive Maintenance", "Energy Management Systems"
            ],
            "Industry 4.0 and Smart Manufacturing": [
                "IIoT", "Industrial Internet of Things", "Digital Twin", "MES", "Manufacturing Execution Systems",
                "OEE", "Overall Equipment Effectiveness", "Data Logging", "Process Optimization", "Remote Monitoring",
                "Barcode System", "RFID Integration", "Industrial Cybersecurity"
            ],
            "Engineering and Maintenance": [
                "Equipment Commissioning", "Site Maintenance", "Troubleshooting", "Production Control", 
                "Material Management", "Procurement", "Client Relationship Management", "Manpower Management",
                "AutoCAD", "EPLAN", "Circuit Breaker", "Bus Bar", "Induction Motor", "Sensors", "Installation",
                "Electrical Installation", "PLC Projects", "Wehrhann AAC Plant", "Contactor", "Relay",
                "Preventive Maintenance", "Corrective Maintenance", "Calibration", "P&ID", "Schematic Reading",
                "BOM Management", "Spare Parts Management", "Quality Control", "Lean Manufacturing Principles"
            ],
            "IT & Networking": [
                "Data Center", "Server Installation", "Storage System", "Network Switches", "Firewall Configuration",
                "RedHat", "CentOS", "Oracle SQL", "MSSQL", "Tomcat", "Web Application Installation",
                "Virtualization", "VMware", "Hyper-V", "Backup & Recovery", "Disaster Recovery",
                "Network Architecture", "Cloud Basics", "AWS Fundamentals", "Azure Fundamentals",
                "Linux Server Hardening", "Database Optimization", "API Integration", "Active Directory", "DNS", "DHCP",
                "VPN Configuration", "Network Monitoring", "Wi-Fi Networks", "VoIP", "SAN", "NAS", "Load Balancing"
            ],
            "Project & Business Management": [
                "Project Planning", "Project Scheduling", "MS Project", "Primavera", "Budget Planning",
                "Cost Control", "Vendor Evaluation", "Technical Negotiation", "Risk Assessment",
                "Mitigation Planning", "KPI Development", "Performance Tracking", "SOP Development",
                "Lean Manufacturing", "Six Sigma", "Kaizen", "Continuous Improvement", "Stakeholder Management",
                "Resource Allocation", "Change Management", "Quality Management", "Procurement Management",
                "Contract Management", "Business Process Improvement", "Strategic Planning", "Market Analysis"
            ],
            "Leadership & Professional": [
                "Leadership", "Decision-Making", "Conflict Resolution", "Cross-Functional Coordination",
                "Technical Training", "Mentoring", "Stakeholder Management", "Change Management",
                "Time Management", "Priority Management", "Presentation Skills", "Reporting Skills",
                "Motivational Leader", "Strategic Thinker", "Team Player", "Innovative", "Communicator",
                "Coaching", "Delegation", "Performance Management", "Emotional Intelligence", "Adaptability",
                "Problem Solving", "Critical Thinking", "Negotiation", "Public Speaking", "Active Listening"
            ],
            "Certifications": [
                "PMP", "Project Management Professional", "Six Sigma Green Belt", "Six Sigma Black Belt",
                "Certified Automation Professional", "CAP", "ITIL Foundation", "CCNA", "Industrial Networking",
                "CompTIA A+", "CompTIA Network+", "CompTIA Security+", "AWS Certified Solutions Architect",
                "Azure Administrator Associate", "Certified Ethical Hacker", "CEH", "Scrum Master", "CSM"
            ],
            "Cybersecurity": [
                "Ethical Hacking", "Penetration Testing", "Network Security", "Information Security", "Cryptography",
                "Firewalls", "VPN", "SIEM", "Vulnerability Assessment", "Incident Response", "OWASP", "Metasploit",
                "Wireshark", "Burp Suite", "Malware Analysis", "Security Audits", "Compliance (GDPR, HIPAA)",
                "Risk Management", "Identity and Access Management", "IAM", "Endpoint Security", "Intrusion Detection Systems",
                "IDS", "Intrusion Prevention Systems", "IPS", "Security Information and Event Management"
            ]
        }

    def _initialize_skill_matcher(self):
        """Seed the PhraseMatcher with the massive taxonomy."""
        # Re-initialize to clear any previous patterns if this method is called multiple times
        # self.skill_matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER") # Already initialized in __init__
        for category, skill_list in self.taxonomy.items():
            patterns = [self.nlp.make_doc(skill) for skill in skill_list]
            self.skill_matcher.add(category, patterns)

    def _initialize_section_patterns(self):
        """High-confidence patterns for resume headers."""
        # self.section_matcher = Matcher(self.nlp.vocab) # Already initialized in __init__
        self.section_matcher.add("SKILLS", [[{"LOWER": {"IN": ["skills", "technical", "technologies", "competencies", "tools", "expertise", "proficiencies", "automation", "engineering"]}}]])
        self.section_matcher.add("EXPERIENCE", [[{"LOWER": {"IN": ["experience", "employment", "history", "work", "projects", "professional", "internships"]}}]])
        self.section_matcher.add("EDUCATION", [[{"LOWER": {"IN": ["education", "academic", "qualifications", "schooling", "certifications", "educational"]}}]])
        self.section_matcher.add("CONTACT", [[{"LOWER": {"IN": ["contact", "personal", "details", "info", "information"]}}]])

    def _clean_text(self, text: str) -> str:
        """Strip invisible noise and normalize whitespace."""
        text = re.sub(r'[^\x00-\x7F]+', ' ', text) # Remove non-ASCII characters
        text = re.sub(r'\s+', ' ', text) # Normalize all whitespace to single spaces
        return text.strip()

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """High-precision text extraction with layout awareness."""
        text = ""
        if filename.lower().endswith(".pdf"):
            try:
                with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                    for page in pdf.pages:
                        # Extract with layout preservation
                        page_text = page.extract_text(layout=True)
                        if page_text:
                            text += page_text + "\n"
            except Exception as e:
                print(f"Error extracting PDF: {e}")
            return self._clean_text(text)
        elif filename.lower().endswith((".docx", ".doc")):
            doc = docx.Document(io.BytesIO(file_content))
            return self._clean_text("\n".join([para.text for para in doc.paragraphs]))
        return ""

    def _segment_resume(self, text: str) -> Dict[str, str]:
        """Categorize text blocks into functional sections."""
        lines = text.split('\n')
        segments = {"HEADER": ""}
        current_section = "HEADER"
        
        for line in lines:
            line_strip = line.strip()
            if not line_strip: continue
            
            # Identify headers (usually short, bold in reality, here short and keyword-rich)
            doc = self.nlp(line_strip.lower())
            matches = self.section_matcher(doc)
            
            # Heuristic: Section headers are usually 1-3 words
            if matches and len(line_strip.split()) <= 3:
                _, start, end = matches[0]
                current_section = self.nlp.vocab.strings[matches[0][0]]
                if current_section not in segments:
                    segments[current_section] = ""
            else:
                segments[current_section] += line + "\n"
        
        return segments

    def _handle_dynamic_discovery(self, segments: Dict[str, str], found_skills: Set[str]) -> Set[str]:
        """Discover new skills in 'SKILLS' and 'EXPERIENCE' sections using NLP."""
        search_text = segments.get("SKILLS", "") + " " + segments.get("EXPERIENCE", "")
        doc = self.nlp(search_text)
        
        # PROPN filtering with strict negative check
        NEGATIVE_FILTER = {
            "Resume", "Summary", "Profile", "Experience", "Education", "Projects", "January", "February", "March", 
            "April", "May", "June", "July", "August", "September", "October", "November", "December", "Present",
            "University", "College", "India", "Bangalore", "Pune", "Mumbai", "Hyderabad", "Address", "Contact",
            "Email", "Phone", "Status", "Responsible", "Developed", "Implemented", "Worked", "Using", "Technical",
            "Professional", "Personal", "Details", "Date", "Name", "Total", "Years", "Months", "Role", "Responsibility",
            "Project", "Project)", "Rwanda", "Ltd", "Pvt", "Inc", "Company", "Helper", "Helpers", "Technician", "Technicians",
            "Assistant", "Manager", "Engineer", "Site", "On-site", "Factory", "Commissioning", "Warehouse", "AAC", "Scales"
        }
        
        discovered = set()
        for chunk in doc.noun_chunks:
            # Clean chunk text
            clean_chunk = re.sub(r'\s+', ' ', chunk.text.strip())
            
            # Filter out resource counts (e.g., "12 Helpers", "9 Technician")
            if re.match(r'^\d+\s+', clean_chunk):
                continue
                
            # Filter by word count (1-4 words to capture engineering terms like "Functional Block Diagram")
            words = clean_chunk.split()
            if 1 <= len(words) <= 4:
                # Check negative filter
                if not any(word.capitalize().rstrip(')') in NEGATIVE_FILTER for word in words):
                    # Check for Proper Noun or specific technical indicators
                    has_propn = any(t.pos_ == "PROPN" for t in chunk)
                    has_noun = any(t.pos_ == "NOUN" for t in chunk)
                    is_title = any(word[0].isupper() for word in words if word)
                    
                    # Avoid company suffixes
                    if any(word.lower() in ["ltd", "pvt", "limited", "inc", "corp"] for word in words):
                        continue
                        
                    if (has_propn or (has_noun and is_title)) and len(clean_chunk) > 2:
                        discovered.add(clean_chunk)
                            
        return discovered

    def _extract_soft_skills(self, doc: spacy.tokens.Doc) -> Set[str]:
        """Context-aware soft skill extraction using linguistic patterns and taxonomy."""
        soft_skills = set()
        
        # 1. Matches from taxonomy (handled in parse_resume)
        
        # 2. Rule-based extraction for common soft skill indicators
        lemmas = [token.lemma_.lower() for token in doc]
        
        soft_skill_keywords = {
            "Leadership": ["lead", "managed", "supervised", "directed", "headed", "mentored"],
            "Communication": ["presented", "communicated", "wrote", "spoke", "negotiated"],
            "Teamwork": ["collaborated", "coordinated", "team", "assisted", "helped"],
            "Problem Solving": ["solved", "analyzed", "resolved", "fixed", "optimized", "troubleshot"]
        }
        
        for skill, indicators in soft_skill_keywords.items():
            if any(ind in lemmas for ind in indicators):
                soft_skills.add(skill)
                
        return soft_skills

    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract email, phone, and links using high-precision regex."""
        email = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        phone = re.findall(r'\(?\+?\d{1,4}?[\s.-]?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,9}', text)
        linkedin = re.findall(r'linkedin\.com/in/[\w-]+', text)
        github = re.findall(r'github\.com/[\w-]+', text)
        
        return {
            "email": email[0] if email else None,
            "phone": phone[0] if phone else None,
            "linkedin": f"https://{linkedin[0]}" if linkedin else None,
            "github": f"https://{github[0]}" if github else None
        }

    def _extract_education_details(self, text: str) -> List[Dict[str, Any]]:
        """Extract school, degree, and graduation year."""
        # Simple extraction for now, can be improved with more patterns
        edu_list = []
        lines = text.split('\n')
        for line in lines:
            if any(key in line.upper() for key in ["B.TECH", "B.SC", "B.E", "M.TECH", "MS", "PHD", "BACHELOR", "MASTER", "UNIVERSITY", "COLLEGE", "INSTITUTE"]):
                year_match = re.search(r'(20\d{2}|19\d{2})', line)
                edu_list.append({
                    "raw": line.strip(),
                    "year": year_match.group(1) if year_match else None
                })
        return edu_list

    def parse_resume(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Expert parsing pipeline."""
        if isinstance(file_content, str):
            text = self._clean_text(file_content)
        else:
            text = self.extract_text(file_content, filename)
            
        if not text.strip():
            return {"error": "Document appears empty or unreadable."}
            
        segments = self._segment_resume(text)
        doc = self.nlp(text)
        
        # 1. High-Confidence Taxonomic Matching
        categorized_skills = {cat: set() for cat in self.taxonomy.keys()}
        matches = self.skill_matcher(doc)
        
        all_found = set()
        for match_id, start, end in matches:
            category = self.nlp.vocab.strings[match_id]
            skill_text = doc[start:end].text
            categorized_skills[category].add(skill_text)
            all_found.add(skill_text)
            
        # 2. Dynamic Discovery (Filtered closely)
        discovered = self._handle_dynamic_discovery(segments, all_found)
        # We add discovered skills to a "Other Technical Skills" category if not already found
        other_skills = discovered - all_found
        
        # Discover soft skills using context
        contextual_soft_skills = self._extract_soft_skills(doc)
        if contextual_soft_skills:
            if "Soft Skills" not in categorized_skills:
                categorized_skills["Soft Skills"] = set()
            categorized_skills["Soft Skills"].update(contextual_soft_skills)
            all_found.update(contextual_soft_skills)
        
        # 3. CGPA & Experience & Contact
        contact_info = self._extract_contact_info(text)
        education = self._extract_education_details(segments.get("EDUCATION", ""))
        
        # High-precision CGPA/Percentage extraction
        cgpa = None
        percentage = None
        
        # Look for CGPA patterns: 8.5/10, CGPA 8.5, 9.0 GPA, 8.5 cgpa, etc.
        cgpa_match = re.search(r'(?:CGPA|GPA|SGPA|Pointer)[\s:]*([0-9]\.?[0-9]{0,2})(?:\/[1]?[0])?', text, re.IGNORECASE)
        if cgpa_match:
            cgpa = cgpa_match.group(1)
        else:
            # Fallback for just a decimal number between 4 and 10 in education context
            edu_text = segments.get("EDUCATION", "")
            cgpa_fallback = re.search(r'\b([4-9]\.[0-9]{1,2}|10\.0)\b', edu_text)
            if cgpa_fallback:
                cgpa = cgpa_fallback.group(1)
                
        # Look for Percentage patterns: 85%, 85.5 %, 85 percent, 85.5 percentage
        perc_match = re.search(r'(\d{2}(?:\.\d{1,2})?)[\s]*(?:%|percent|percentage)', text, re.IGNORECASE)
        if perc_match:
            percentage = perc_match.group(1)
            
        exp_match = re.search(r'(\d+)\+?\s*(?:years|yrs|year)', text, re.IGNORECASE)
        experience = exp_match.group(1) if exp_match else "0"
        
        # 4. Result Formatting
        final_skills = {}
        for cat, skills in categorized_skills.items():
            if skills:
                final_skills[cat] = sorted(list(skills))
        
        if other_skills:
            # Filter other_skills to remove common noise that might have slipped through
            filtered_other = [s for s in other_skills if len(s) > 2 and s not in all_found]
            final_skills["Other Technical Tools"] = sorted(list(set(filtered_other)))[:10]

        # Aggregate skills for the frontend display
        flat_skills = []
        for s_list in final_skills.values():
            flat_skills.extend(s_list)
        flat_skills = sorted(list(set(flat_skills)), key=lambda x: x.lower())
        
        # Scoring logic
        score = 40 # Base
        score += min(40, len(all_found) * 5) # Taxonomy skills weighted higher
        score += min(10, len(other_skills) * 1) # Dynamic skills weighted lower
        if cgpa or percentage: score += 5
        if int(experience) > 0: score += 5

        # Unified Academic Score logic for frontend
        if cgpa:
            academic_score = cgpa
            score_type = "CGPA"
        elif percentage:
            academic_score = f"{percentage}%"
            score_type = "Percentage"
        else:
            academic_score = "N/A"
            score_type = "Score"

        return {
            "skills": flat_skills,
            "categorized_skills": final_skills,
            "education": education,
            "contact": contact_info,
            "cgpa": cgpa,
            "percentage": percentage,
            "academic_score": academic_score,
            "score_type": score_type,
            "years_of_experience": experience,
            "ats_score": min(100, score),
            "status": "success",
            "filename": filename,
            "text_preview": text[:300].replace('\n', ' ').strip() + "..."
        }

# Singleton
resume_parser = ResumeParser()
