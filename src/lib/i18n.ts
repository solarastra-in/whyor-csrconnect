import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

const resources = {
  en: {
    translation: {
      "dashboard.overview": "Overview",
      "dashboard.discoverProjects": "Discover Projects",
      "dashboard.employeeEngagement": "Employee Engagement",
      "dashboard.skillVerification": "Skill Verification",
      "dashboard.impactReports": "Impact Reports",
      "dashboard.settings": "Portal Settings",
      "dashboard.matchingCampaigns": "Matching & Campaigns",
      "dashboard.myDashboard": "My Dashboard",
      "dashboard.challenges": "Challenges",
      "dashboard.resourceGroups": "Resource Groups",
      "dashboard.resourceHub": "Resource Hub",
      "dashboard.myImpact": "My Impact",
      
      "landing.hero.title": "Where Corporate Social Responsibility Comes Alive",
      "landing.hero.subtitle": "Empower your employees to drive real impact. A comprehensive platform for corporate volunteering, donation matching, and impact tracking.",
      "landing.nav.onboard": "Set up a new company portal",
      "landing.login.employee": "Employee Login",
      "landing.login.company": "Company Admin Login"
    }
  },
  fr: {
    translation: {
      "dashboard.overview": "Aperçu",
      "dashboard.discoverProjects": "Découvrir les Projets",
      "dashboard.employeeEngagement": "Engagement des Employés",
      "dashboard.skillVerification": "Vérification des Compétences",
      "dashboard.impactReports": "Rapports d'Impact",
      "dashboard.settings": "Paramètres du Portail",
      "dashboard.matchingCampaigns": "Jumelage & Campagnes",
      "dashboard.myDashboard": "Mon Tableau de Bord",
      "dashboard.challenges": "Défis",
      "dashboard.resourceGroups": "Groupes de Ressources",
      "dashboard.resourceHub": "Centre de Ressources",
      "dashboard.myImpact": "Mon Impact",

      "landing.hero.title": "Où la Responsabilité Sociale des Entreprises Prend Vie",
      "landing.hero.subtitle": "Donnez à vos employés les moyens de créer un impact réel. Une plateforme complète pour le bénévolat, le jumelage de dons et le suivi de l'impact.",
      "landing.nav.onboard": "Configurer un nouveau portail d'entreprise",
      "landing.login.employee": "Connexion Employé",
      "landing.login.company": "Connexion Administrateur"
    }
  },
  es: {
    translation: {
      "dashboard.overview": "Visión General",
      "dashboard.discoverProjects": "Descubrir Proyectos",
      "dashboard.employeeEngagement": "Compromiso de los Empleados",
      "dashboard.skillVerification": "Verificación de Habilidades",
      "dashboard.impactReports": "Informes de Impacto",
      "dashboard.settings": "Configuración del Portal",
      "dashboard.matchingCampaigns": "Igualación y Campañas",
      "dashboard.myDashboard": "Mi Panel",
      "dashboard.challenges": "Desafíos",
      "dashboard.resourceGroups": "Grupos de Recursos",
      "dashboard.resourceHub": "Centro de Recursos",
      "dashboard.myImpact": "Mi Impacto",

      "landing.hero.title": "Donde la Responsabilidad Social Corporativa Cobra Vida",
      "landing.hero.subtitle": "Capacite a sus empleados para impulsar un impacto real. Una plataforma integral para el voluntariado corporativo, la igualación de donaciones y el seguimiento del impacto.",
      "landing.nav.onboard": "Configurar un nuevo portal de empresa",
      "landing.login.employee": "Inicio de Sesión de Empleado",
      "landing.login.company": "Inicio de Sesión de Administrador"
    }
  },
  de: {
    translation: {
      "dashboard.overview": "Übersicht",
      "dashboard.discoverProjects": "Projekte Entdecken",
      "dashboard.employeeEngagement": "Mitarbeiterbindung",
      "dashboard.skillVerification": "Kompetenzprüfung",
      "dashboard.impactReports": "Wirkungsberichte",
      "dashboard.settings": "Portaleinstellungen",
      "dashboard.matchingCampaigns": "Matching & Kampagnen",
      "dashboard.myDashboard": "Mein Dashboard",
      "dashboard.challenges": "Herausforderungen",
      "dashboard.resourceGroups": "Ressourcengruppen",
      "dashboard.resourceHub": "Ressourcenzentrum",
      "dashboard.myImpact": "Meine Wirkung",

      "landing.hero.title": "Wo Corporate Social Responsibility Lebendig Wird",
      "landing.hero.subtitle": "Befähigen Sie Ihre Mitarbeiter, echte Wirkung zu erzielen.",
      "landing.nav.onboard": "Neues Firmenportal einrichten",
      "landing.login.employee": "Mitarbeiter-Login",
      "landing.login.company": "Unternehmens-Admin-Login"
    }
  },
  ja: {
    translation: {
      "dashboard.overview": "概要",
      "dashboard.discoverProjects": "プロジェクトを探す",
      "dashboard.employeeEngagement": "従業員エンゲージメント",
      "dashboard.skillVerification": "スキル検証",
      "dashboard.impactReports": "インパクトレポート",
      "dashboard.settings": "ポータル設定",
      "dashboard.matchingCampaigns": "マッチング＆キャンペーン",
      "dashboard.myDashboard": "マイダッシュボード",
      "dashboard.challenges": "チャレンジ",
      "dashboard.resourceGroups": "リソースグループ",
      "dashboard.resourceHub": "リソースハブ",
      "dashboard.myImpact": "私のインパクト",

      "landing.hero.title": "企業の社会的責任が活きる場所",
      "landing.hero.subtitle": "従業員が本当のインパクトを生み出せるよう支援します。",
      "landing.nav.onboard": "新しい企業ポータルをセットアップ",
      "landing.login.employee": "従業員ログイン",
      "landing.login.company": "企業管理者ログイン"
    }
  },
  hi: {
    translation: {
      "dashboard.overview": "अवलोकन",
      "dashboard.discoverProjects": "परियोजनाएं खोजें",
      "dashboard.employeeEngagement": "कर्मचारी सहभागिता",
      "dashboard.skillVerification": "कौशल सत्यापन",
      "dashboard.impactReports": "प्रभाव रिपोर्ट",
      "dashboard.settings": "पोर्टल सेटिंग्स",
      "dashboard.matchingCampaigns": "मैचिंग और अभियान",
      "dashboard.myDashboard": "मेरा डैशबोर्ड",
      "dashboard.challenges": "चुनौतियां",
      "dashboard.resourceGroups": "संसाधन समूह",
      "dashboard.resourceHub": "संसाधन केंद्र",
      "dashboard.myImpact": "मेरा प्रभाव",

      "landing.hero.title": "जहां कॉर्पोरेट सामाजिक उत्तरदायित्व जीवंत होता है",
      "landing.hero.subtitle": "अपने कर्मचारियों को वास्तविक प्रभाव डालने के लिए सशक्त बनाएं।",
      "landing.nav.onboard": "नया कंपनी पोर्टल स्थापित करें",
      "landing.login.employee": "कर्मचारी लॉगिन",
      "landing.login.company": "कंपनी एडमिन लॉगिन"
    }
  },
  zh: {
    translation: {
      "dashboard.overview": "概览",
      "dashboard.discoverProjects": "探索项目",
      "dashboard.employeeEngagement": "员工参与度",
      "dashboard.skillVerification": "技能认证",
      "dashboard.impactReports": "影响力报告",
      "dashboard.settings": "门户设置",
      "dashboard.matchingCampaigns": "匹配与活动",
      "dashboard.myDashboard": "我的仪表板",
      "dashboard.challenges": "挑战活动",
      "dashboard.resourceGroups": "资源小组",
      "dashboard.resourceHub": "资源中心",
      "dashboard.myImpact": "我的影响力",

      "landing.hero.title": "企业社会责任的践行平台",
      "landing.hero.subtitle": "赋能员工创造真实社会影响力。",
      "landing.nav.onboard": "设置新的企业门户",
      "landing.login.employee": "员工登录",
      "landing.login.company": "企业管理员登录"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

