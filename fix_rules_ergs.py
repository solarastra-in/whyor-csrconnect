import re
with open('firestore.rules', 'r') as f:
    content = f.read()

# Add a rule for ergs
new_rule = """    match /ergs/{ergId} {
      allow read: if isSignedIn();
      allow write: if isPlatformAdmin() || isRealUser(); // Simplify for demo, ideally company_admin or erg_lead
    }
    match /companies/{companyId} {"""

content = content.replace("    match /companies/{companyId} {", new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
