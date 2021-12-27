import i18n from "i18next";
import {initReactI18next} from "react-i18next";

// tips: export each translation to a seperate file
const resources = {
  en: {
    translation: {
      english: "English",
      french: "Français",
      welcome: "Welcome to Typescript React Native Starter!",
      instructions: "To get started, edit Home.tsx",
      iosInstruction: "Press Cmd+R to reload,\nCmd+D or shake for dev menu",
      androidInstruction: "Double tap R on your keyboard to reload,\nShake or press menu button for dev menu",
      settings: "Settings",
      home: "Home",
      fetchUser: "Fetch user",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue à Typescript React Native Starter !",
      instructions: "Pour commencer, éditez Home.tsx",
      iosInstruction: "Appuyez sur Cmd+R pour recharger,\nCmd+D ou secouez pour le menu dev",
      androidInstruction:
        "Appuyez deux fois sur la touche R de votre clavier pour recharger,\n" +
        "Secouer ou appuyer sur le bouton de menu pour le menu de développement",
      settings: "Paramètres",
      home: "Accueil",
    },
  },
};

// eslint-disable-next-line no-void
void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",

  keySeparator: false,

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
