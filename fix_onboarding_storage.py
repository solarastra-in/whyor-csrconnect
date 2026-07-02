with open('src/pages/CompanyOnboarding.tsx', 'r') as f:
    content = f.read()

# Replace the formData state initialization
old_state = """  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    about: '',
    brandColor: '#4f46e5',
    autoMatch: true,
  });"""

new_state = """  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('companyOnboardingDraft');
    if (saved) return JSON.parse(saved);
    return {
      companyName: '',
      industry: '',
      website: '',
      about: '',
      brandColor: '#4f46e5',
      autoMatch: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('companyOnboardingDraft', JSON.stringify(formData));
  }, [formData]);"""

content = content.replace(old_state, new_state)

with open('src/pages/CompanyOnboarding.tsx', 'w') as f:
    f.write(content)

with open('src/pages/CharityOnboarding.tsx', 'r') as f:
    content = f.read()

old_state_charity = """  const [formData, setFormData] = useState({
    orgName: '',
    website: '',
    headquarters: '',
    focusArea: '',
    rawDescription: '',
    generatedPurpose: ''
  });"""

new_state_charity = """  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('charityOnboardingDraft');
    if (saved) return JSON.parse(saved);
    return {
      orgName: '',
      website: '',
      headquarters: '',
      focusArea: '',
      rawDescription: '',
      generatedPurpose: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('charityOnboardingDraft', JSON.stringify(formData));
  }, [formData]);"""

content = content.replace(old_state_charity, new_state_charity)

with open('src/pages/CharityOnboarding.tsx', 'w') as f:
    f.write(content)
