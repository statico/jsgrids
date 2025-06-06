import { DiJqueryLogo } from "react-icons/di";
import { FaAngular, FaEmber, FaReact, FaVuejs } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io";
import { SiSvelte } from "react-icons/si";
import { FrameworkName } from "./libraries";

// An ordered set of all framework names.
export const FrameworkNames: FrameworkName[] = [
  "react",
  "svelte",
  "vue",
  "angular",
  "ember",
  "jquery",
  "vanilla",
];

export const FrameworkTitles = {
  react: "React",
  svelte: "Svelte",
  vue: "Vue.js",
  angular: "Angular",
  ember: "Ember.js",
  jquery: "jQuery",
  vanilla: "Vanilla JavaScript (no framework)",
};

export const FrameworkIcons = {
  react: FaReact,
  vue: FaVuejs,
  angular: FaAngular,
  svelte: SiSvelte,
  ember: FaEmber,
  jquery: DiJqueryLogo,
  vanilla: IoLogoJavascript,
};
