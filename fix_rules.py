import re

with open('firestore.rules', 'r') as f:
    content = f.read()

new_rule = """    match /grants/{grantId} {
      allow read: if isSignedIn();
      allow write: if isRealUser() || isPlatformAdmin();
    }
  }
}"""

content = content.replace("  }\n}", new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
