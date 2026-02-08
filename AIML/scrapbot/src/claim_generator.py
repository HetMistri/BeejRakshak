from fpdf import FPDF
from pathlib import Path

# Path setup
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"


class PMFBYClaimPDF(FPDF):
    def section_title(self, text):
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, text, 0, 1)
        self.set_font("Arial", "", 10)

    def add_field(self, label, value):
        self.set_font("Arial", "B", 10)
        self.cell(50, 8, label, 0, 0)
        self.set_font("Arial", "", 10)
        self.cell(0, 8, str(value), 0, 1)


def generate_insurance_claim(farmer_data, crop_data, damage_report):
    # Ensure static directory exists
    if not STATIC_DIR.exists():
        STATIC_DIR.mkdir(parents=True)

    pdf = PMFBYClaimPDF()
    pdf.add_page()
    
    # 1. Farmer Details
    pdf.section_title("1. Farmer Verification Details")
    pdf.add_field("Applicant Name:", farmer_data['name'])
    pdf.add_field("Farmer ID (UID):", farmer_data['uid'])
    pdf.add_field("Village/Tehsil:", farmer_data['location'])
    pdf.add_field("Bank Account:", farmer_data['bank_acc'])
    pdf.ln(5)

    # 2. Crop Details
    pdf.section_title("2. Insured Crop Details")
    pdf.add_field("Crop Variety:", crop_data['crop'])
    pdf.add_field("Sowing Date:", crop_data['sowing_date'])
    pdf.add_field("Policy Number:", crop_data['policy_no'])
    pdf.add_field("Land Area (Ha):", crop_data['area'])
    pdf.ln(5)

    # 3. AI Assessment
    pdf.section_title("3. Incident & Damage Report (AI Verified)")
    pdf.add_field("Incident Type:", damage_report['type'])
    pdf.add_field("Date of Incident:", damage_report['date'])
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(50, 8, "AI Estimated Loss:", 0, 0)
    pdf.set_text_color(255, 0, 0) # RED Text
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, damage_report['loss_percentage'], 0, 1)
    
    pdf.set_text_color(0)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 8, f"Reason: Automated stations detected {damage_report['rainfall_mm']}mm rain. Visual analysis confirms damage.")
    pdf.ln(10)

    # 4. Declaration
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 10, "Declaration:", 0, 1)
    pdf.set_font('Arial', '', 9)
    pdf.multi_cell(0, 5, "I declare that the details above are true. Digitally signed via Voice Consent.")
    pdf.ln(10)
    
    pdf.cell(100, 10, f"Signed: {farmer_data['name']}", 0, 0)
    pdf.cell(0, 10, "[ APPROVED ]", 0, 1, 'R')

    filename = STATIC_DIR / f"Claim_{farmer_data['uid']}.pdf"
    pdf.output(str(filename))
    return f"static/Claim_{farmer_data['uid']}.pdf"