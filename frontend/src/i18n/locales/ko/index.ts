import topbar from "./topbar.json";
import menu from "./menu.json";
import aiAdvisor from "./aiAdvisor.json";
import authority from "./authority.json";
import systemStatus from "./systemStatus.json";
import curricular from "./curricular.json";
import extraCurricular from "./extraCurricular.json";
import community from "./community.json";
import studySpace from "./studySpace.json";
import mypage from "./mypage.json";

const messages = {
  topbar,
  menu,
  aiAdvisor,
  authority,
  systemStatus,
  curricular,
  extraCurricular,
  community,
  studySpace,
  mypage
} as const;

export default messages;
