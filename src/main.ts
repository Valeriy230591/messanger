import "./style.scss";
import { Store } from "./core/Store";
import Router from "./core/Router";
import LoginPage from "./pages/login/login";
import SignIn from "./pages/signin/signIn";
import SettingsPage from "./pages/settingsPage/settingsPage";
import NotFoundPage from "./pages/notFound/notFound";
import ErrorPage from "./pages/error/error";
import Chat from "./pages/chat/chat";
import "./types/global";

document.body.innerHTML = `
  <main id="content"></main>
`;

document.addEventListener("DOMContentLoaded", () => {
  const initialState = {
    isLoading: false,
    user: null,
    chats: [],
    messages: {},
    loginError: null,
    signupError: null,
    activeSettingsPage: "profile",
  };

  const store = new Store(initialState);
  window.store = store;

  const router = new Router("#content");
  window.router = router;

  router
    .use("/", LoginPage)
    .use("/signin", SignIn)
    .use("/settings", SettingsPage)
    .use("/messanger", Chat)
    .use("/error", ErrorPage)
    .use("/404", NotFoundPage)
    .use("*", NotFoundPage)
    .start();
});
