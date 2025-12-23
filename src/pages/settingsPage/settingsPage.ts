import Block, { type BlockProps } from "../../core/block";
import ProfilePage from "../profile/profile";
import EditProfilePage from "../editProfile/editProfile";
import EditPasswordPage from "../editPassword/editPassword";
import { withRouter } from "../../utils/withRouter";
import { connect } from "../../utils/connect";
import type Router from "../../core/Router";
import { Store } from "../../core/Store";

interface SettingsPageProps extends BlockProps {
  router?: Router;
  activeSettingsPage?: string;
  isLoading?: boolean;
  [key: string]: unknown;
}

class SettingsPage extends Block {
  constructor(props: SettingsPageProps = {}) {
    const savedPage = sessionStorage.getItem("activeSettingsPage");

    if (savedPage && savedPage !== props.activeSettingsPage) {
      setTimeout(() => {
        Store.getInstance().set({ activeSettingsPage: savedPage });
      }, 0);
    }

    super("div", props as BlockProps);

    this.initChildren();
  }

  private initChildren(): void {
    this.children.currentPage = this.getCurrentPageComponent();

    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private getCurrentPageComponent(): Block {
    const activeSettingsPage =
      (this.props as SettingsPageProps).activeSettingsPage || "profile";

    let component: Block;
    switch (activeSettingsPage) {
      case "editProfile":
        component = new EditProfilePage({}) as unknown as Block;
        break;
      case "editPassword":
        component = new EditPasswordPage({}) as unknown as Block;
        break;
      case "profile":
      default:
        component = new ProfilePage({}) as unknown as Block;
        break;
    }

    return component;
  }

  componentDidMount(): void {
    const currentPage = this.children.currentPage as Block;
    if (currentPage) {
      currentPage.dispatchComponentDidMount();
    }
  }

  componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): boolean {
    const oldTypedProps = oldProps as SettingsPageProps;
    const newTypedProps = newProps as SettingsPageProps;

    if (oldTypedProps.activeSettingsPage !== newTypedProps.activeSettingsPage) {
      if (newTypedProps.activeSettingsPage) {
        sessionStorage.setItem(
          "activeSettingsPage",
          newTypedProps.activeSettingsPage
        );
      }

      this.children.currentPage = this.getCurrentPageComponent();

      const newPage = this.children.currentPage as Block;
      if (newPage) {
        newPage.dispatchComponentDidMount();
      }
      return true;
    }
    return false;
  }

  render(): string {
    return `
      <div class="settings-page">
        {{{currentPage}}}
      </div>
    `;
  }
}

const mapStateToProps = (
  state: Record<string, unknown>
): Record<string, unknown> => ({
  activeSettingsPage: (state.activeSettingsPage as string) || "profile",
  isLoading: state.isLoading as boolean | undefined,
});

export default connect(mapStateToProps)(withRouter(SettingsPage));
