import re
with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_func = """export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the sign-in popup.');
      return null;
    }
    if (error.code === 'auth/cancelled-popup-request') {
      console.log('Multiple popup requests. Ignoring.');
      return null;
    }
    console.error("Error signing in with Google", error);
    throw error;
  }
};"""

content = re.sub(
    r'export const signInWithGoogle = async \(\) => \{[\s\S]*?\};',
    new_func,
    content
)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
