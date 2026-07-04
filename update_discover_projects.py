import re
with open('src/pages/DiscoverProjects.tsx', 'r') as f:
    content = f.read()

# Replace step state
if "const [donateStep, setDonateStep] = useState<'amount' | 'game' | 'complete'>('amount');" in content:
    content = content.replace("const [donateStep, setDonateStep] = useState<'amount' | 'game' | 'complete'>('amount');", "const [donateStep, setDonateStep] = useState<'amount' | 'payment' | 'game' | 'complete'>('amount');")

# Inject payment step rendering
payment_step_render = """                          {donateStep === 'payment' && (
                            <div className="py-8 text-center space-y-6">
                              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <CreditCard className="h-8 w-8 text-blue-600 animate-pulse" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
                              <p className="text-gray-500">Connecting to Razorpay secure gateway...</p>
                              
                              <div className="max-w-xs mx-auto space-y-3 mt-6">
                                <Button 
                                  className="w-full bg-blue-600 hover:bg-blue-700" 
                                  onClick={() => {
                                    toast.success('Payment successful via Razorpay (Simulated)');
                                    setDonateStep('game');
                                  }}
                                >
                                  Simulate Success
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full text-red-600 border-red-200 hover:bg-red-50" 
                                  onClick={() => {
                                    toast.error('Payment cancelled');
                                    setDonateStep('amount');
                                  }}
                                >
                                  Cancel Payment
                                </Button>
                              </div>
                            </div>
                          )}"""

if "                          {donateStep === 'game' && (" in content and 'donateStep === \'payment\'' not in content:
    content = content.replace("                          {donateStep === 'game' && (", payment_step_render + "\n\n                          {donateStep === 'game' && (")

# Update 'Continue to Match Game' button
content = content.replace("onClick={() => setDonateStep('game')}", "onClick={() => setDonateStep('payment')}")
content = content.replace("Continue to Match Game", "Proceed to Payment")
content = content.replace("import { Search, MapPin, Building2, Tag, Check, Calendar, ChevronRight } from 'lucide-react';", "import { Search, MapPin, Building2, Tag, Check, Calendar, ChevronRight, CreditCard } from 'lucide-react';")

with open('src/pages/DiscoverProjects.tsx', 'w') as f:
    f.write(content)
