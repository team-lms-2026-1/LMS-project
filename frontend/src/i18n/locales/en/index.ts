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
import survey from "./survey.json";
import mentoring from "./mentoring.json";
import competency from "./competency.json";

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
  mypage,
  survey,
  mentoring,
  competency
} as const;

export default messages;
