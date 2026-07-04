import re
with open('src/contexts/AuthContext.tsx', 'r') as f:
    content = f.read()

new_content = content.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [isSigningIn, setIsSigningIn] = useState(false);'
)

new_func = """  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };"""

new_content = re.sub(
    r'  const signIn = async \(\) => \{\s*await signInWithGoogle\(\);\s*\};',
    new_func,
    new_content
)

with open('src/contexts/AuthContext.tsx', 'w') as f:
    f.write(new_content)
