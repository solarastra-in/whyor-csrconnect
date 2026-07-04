import re
with open('firestore.rules', 'r') as f:
    content = f.read()

new_rules = """    match /companies/{companyId}/campaigns/{campaignId} {
      allow read: if isSignedIn();
      allow write: if isPlatformAdmin() || isRealUser(); 
    }
    match /companies/{companyId}/config/{configId} {
      allow read: if isSignedIn();
      allow write: if isPlatformAdmin() || isRealUser(); 
    }
    match /skillVerifications/{id} {
      allow read: if isSignedIn();
      allow write: if isPlatformAdmin() || isRealUser();
    }
    match /companies/{companyId} {"""

content = content.replace("    match /companies/{companyId} {", new_rules)

with open('firestore.rules', 'w') as f:
    f.write(content)
