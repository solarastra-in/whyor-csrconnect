import re
with open('src/pages/LandingPage.tsx', 'r') as f:
    content = f.read()

old_hero = """        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>"""

new_hero = """        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>
        
        <div className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-slate-200 mb-16 group">
          <img 
            src="https://images.unsplash.com/photo-1593113563332-ceb47c2f6d0f?q=80&w=2070&auto=format&fit=crop" 
            alt="People volunteering together" 
            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white text-left flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold mb-1">Empowering Communities</h3>
              <p className="text-slate-200">Connecting corporate resources with verified grassroots impact.</p>
            </div>
            <div className="hidden sm:flex space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-slate-200 uppercase tracking-wider">NGOs</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">2M+</p>
                <p className="text-xs text-slate-200 uppercase tracking-wider">Hours</p>
              </div>
            </div>
          </div>
        </div>"""

if "unsplash" not in content:
    content = content.replace(old_hero, new_hero)

with open('src/pages/LandingPage.tsx', 'w') as f:
    f.write(content)
