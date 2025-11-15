import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        anonymous: 'Register Anonymously',
      },
      nav: {
        home: 'Home',
        dashboard: 'Dashboard',
        cases: 'Cases',
        messages: 'Messages',
        profile: 'Profile',
        resources: 'Resources',
      },
      cases: {
        title: 'Cases',
        newCase: 'New Case',
        myCases: 'My Cases',
        status: 'Status',
        urgency: 'Urgency',
        caseType: 'Case Type',
        description: 'Description',
        location: 'Location',
        createdAt: 'Created',
        updatedAt: 'Updated',
      },
      dashboard: {
        welcome: 'Welcome',
        overview: 'Overview',
        recentCases: 'Recent Cases',
        upcomingDeadlines: 'Upcoming Deadlines',
      },
    },
  },
  es: {
    translation: {
      common: {
        submit: 'Enviar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        success: 'Éxito',
      },
      auth: {
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        logout: 'Cerrar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        noAccount: '¿No tienes una cuenta?',
        hasAccount: '¿Ya tienes una cuenta?',
        anonymous: 'Registrarse Anónimamente',
      },
      nav: {
        home: 'Inicio',
        dashboard: 'Panel',
        cases: 'Casos',
        messages: 'Mensajes',
        profile: 'Perfil',
        resources: 'Recursos',
      },
    },
  },
  fr: {
    translation: {
      common: {
        submit: 'Soumettre',
        cancel: 'Annuler',
        save: 'Sauvegarder',
        delete: 'Supprimer',
        edit: 'Modifier',
        loading: 'Chargement...',
        error: 'Une erreur est survenue',
        success: 'Succès',
      },
      auth: {
        login: 'Se Connecter',
        register: "S'inscrire",
        logout: 'Se Déconnecter',
        email: 'Email',
        password: 'Mot de Passe',
      },
    },
  },
  ar: {
    translation: {
      common: {
        submit: 'إرسال',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'نجح',
      },
      auth: {
        login: 'تسجيل الدخول',
        register: 'التسجيل',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
