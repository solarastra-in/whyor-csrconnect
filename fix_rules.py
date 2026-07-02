import re
with open('firestore.rules', 'r') as f:
    content = f.read()

# Add a rule for reflections
new_rule = """    match /users/{userId}/reflections/{reflectionId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
    }

    match /users/{userId}/impactLedger/{id} {"""

content = content.replace("    match /users/{userId}/impactLedger/{id} {", new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
