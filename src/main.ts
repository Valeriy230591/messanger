import "./style.scss";
import { Store } from "./core/Store";
import Router from "./core/Router";
import LoginPage from "./pages/login/login";
import SignIn from "./pages/signin/signIn";
import SettingsPage from "./pages/settingsPage/settingsPage";
import NotFoundPage from "./pages/notFound/notFound";
import ErrorPage from "./pages/error/error";
import Chat from "./pages/chat/chat";
import { userMe } from "./services/auth";
import "./types/global";

document.body.innerHTML = `
  <main id="content"></main>
`;

const checkAuthAndNavigate = async () => {
  const currentPath = window.location.pathname;
  const protectedPaths = ["/settings", "/messanger"];
  const authPaths = ["/", "/signin"];

  try {
    const user = await userMe();

    window.store.set({ user, isLoading: false });

    if (user && authPaths.includes(currentPath)) {
      window.router.go("/messanger");
      return false;
    }

    if (!user && protectedPaths.includes(currentPath)) {
      window.router.go("/");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.store.set({ user: null, isLoading: false });

    if (protectedPaths.includes(currentPath)) {
      window.router.go("/");
      return false;
    }
    return true;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const initialState = {
    isLoading: true,
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
    .use("*", NotFoundPage);

  const shouldShowCurrentPage = await checkAuthAndNavigate();

  if (shouldShowCurrentPage) {
    router.start();
  }
});
