import Handlebars from "handlebars";
import * as Page from "./pages";
import "./style.scss";

import { render } from "./core/renderDom";
import LoginPage from "./pages/login/login";
import SignIn from "./pages/signin/signIn";
import ProfilePage from "./pages/profile/profile";
import NotFoundPage from "./pages/notFound/notFound";
import ErrorPage from "./pages/error/error";
import EditProfilePage from "./pages/editProfile/editProfile";
import EditPasswordPage from "./pages/editPassword/editPassword";
import Chat from "./pages/chat/chat";
const templates = {
  navigate: Handlebars.compile(Page.Navigate),
};

document.body.innerHTML = `
    ${templates.navigate({})}
    <main id="content"></main>
`;

function showPage(page: string) {
  const content = document.getElementById("content");

  if (page === "login") {
    const loginPage = new LoginPage({});
    if (content) {
      content.innerHTML = "";
      render("#content", loginPage);
    }
  } else if (page === "signin") {
    const signInPage = new SignIn({});
    if (content) {
      content.innerHTML = "";
      render("#content", signInPage);
    }
  } else if (page === "profile") {
    const profilePage = new ProfilePage({});
    if (content) {
      content.innerHTML = "";
      render("#content", profilePage);
    }
  } else if (page === "editProfile") {
    const editProfilePage = new EditProfilePage({});
    if (content) {
      content.innerHTML = "";
      render("#content", editProfilePage);
    }
  } else if (page === "editPassword") {
    const editPasswordPage = new EditPasswordPage({});
    if (content) {
      content.innerHTML = "";
      render("#content", editPasswordPage);
    }
  } else if (page === "notFound") {
    const notFoundPage = new NotFoundPage({});
    if (content) {
      content.innerHTML = "";
      render("#content", notFoundPage);
    }
  } else if (page === "error") {
    const errorPage = new ErrorPage({});
    if (content) {
      content.innerHTML = "";
      render("#content", errorPage);
    }
  } else if (page === "chat") {
    const chatPage = new Chat({});
    if (content) {
      content.innerHTML = "";
      render("#content", chatPage);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      if (!(link instanceof HTMLElement)) {
        return;
      }

      const href = link.getAttribute("href");

      if (href === "/login") {
        showPage("login");
      } else if (href === "/signin") {
        showPage("signin");
      } else if (href === "/notFound") {
        showPage("notFound");
      } else if (href === "/profile") {
        showPage("profile");
      } else if (href === "/editProfile") {
        showPage("editProfile");
      } else if (href === "/editPassword") {
        showPage("editPassword");
      } else if (href === "/chat") {
        showPage("chat");
      } else if (href === "/error") {
        showPage("error");
      }
    });
  });

  showPage("login");
});
