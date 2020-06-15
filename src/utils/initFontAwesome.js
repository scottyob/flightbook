import { library } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faRocket,
  faLink,
  faPowerOff,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function initFontAwesome() {
  library.add(faLink);
  library.add(faUser);
  library.add(faGithub);
  library.add(faPowerOff);
  library.add(faRocket);
}

export default initFontAwesome;
