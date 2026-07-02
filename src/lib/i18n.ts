import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

      "landing.hero.title": "Donde la Responsabilidad Social Corporativa Cobra Vida",
      "landing.hero.subtitle": "Capacite a sus empleados para impulsar un impacto real. Una plataforma integral para el voluntariado corporativo, la igualación de donaciones y el seguimiento del impacto.",
      "landing.nav.onboard": "Configurar un nuevo portal de empresa",
      "landing.login.employee": "Inicio de Sesión de Empleado",
      "landing.login.company": "Inicio de Sesión de Administrador"
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
