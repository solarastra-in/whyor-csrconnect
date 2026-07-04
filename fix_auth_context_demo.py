import re
with open('src/contexts/AuthContext.tsx', 'r') as f:
    content = f.read()

new_func = """  const signInAsDemo = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await firebaseSignInAsDemo();
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        toast.error('Demo mode (Anonymous Auth) is not enabled in Firebase project settings.');
      } else {
        toast.error('Failed to sign in as demo.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };"""

content = re.sub(
    r'  const signInAsDemo = async \(\) => \{[\s\S]*?toast\.error\(\'Failed to sign in as demo\.\'\);\s*\}\s*\}\s*\};',
    new_func,
    content
)

with open('src/contexts/AuthContext.tsx', 'w') as f:
    f.write(content)
