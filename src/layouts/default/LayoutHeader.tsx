import { defineComponent, unref, computed, ref } from 'vue';
import { Layout, Tooltip, Badge } from 'ant-design-vue';
import Logo from '/@/layouts/Logo.vue';
import UserDropdown from './UserDropdown';
import LayoutMenu from './LayoutMenu';
import { appStore } from '/@/store/modules/app';
import { MenuModeEnum, MenuSplitTyeEnum, MenuTypeEnum } from '/@/enums/menuEnum';
import LayoutBreadcrumb from './LayoutBreadcrumb';
import {
  RedoOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LockOutlined,
  BugOutlined,
} from '@ant-design/icons-vue';
import { useFullscreen } from '/@/hooks/web/useFullScreen';
import { useTabs } from '/@/hooks/web/useTabs';
import LockAction from './actions/LockActionItem';
import { useModal } from '/@/components/Modal/index';
import { errorStore } from '/@/store/modules/error';
import { useWindowSizeFn } from '/@/hooks/event/useWindowSize';
import NoticeAction from './actions/notice/NoticeActionItem.vue';

export default defineComponent({
  name: 'DefaultLayoutHeader',
  setup() {
    const widthRef = ref(200);
    const { refreshPage, addTab } = useTabs();
    const [register, { openModal }] = useModal();
    const { toggleFullscreen, isFullscreenRef } = useFullscreen();

    const getProjectConfigRef = computed(() => {
      return appStore.getProjectConfig;
    });
    const showTopMenu = computed(() => {
      const getProjectConfig = unref(getProjectConfigRef);
      const {
        menuSetting: { mode, split: splitMenu },
      } = getProjectConfig;
      return mode === MenuModeEnum.HORIZONTAL || splitMenu;
    });

    let logoEl: Element | null;
    useWindowSizeFn(
      () => {
        if (!unref(showTopMenu)) return;
        let width = 0;
        if (!logoEl) {
          logoEl = document.querySelector('.layout-header__logo');
        }
        if (logoEl) {
          width += logoEl.clientWidth;
        }
        widthRef.value = width + 60;
      },
      200,
      { immediate: true }
    );

    const headerClass = computed(() => {
      const theme = unref(getProjectConfigRef).headerSetting.theme;
      return theme ? `layout-header__header--${theme}` : '';
    });

    function handleToErrorList() {
      errorStore.commitErrorListCountState(0);
      addTab('/exception/error-log', true);
    }

    /**
     * @description: 锁定屏幕
     */
    function handleLockPage() {
      openModal(true);
    }
    return () => {
      const getProjectConfig = unref(getProjectConfigRef);
      const {
        useErrorHandle,
        showLogo,
        headerSetting: { theme: headerTheme, useLockPage, showRedo, showFullScreen, showNotice },
        menuSetting: { mode, type: menuType, split: splitMenu, topMenuAlign },
        showBreadCrumb,
        showBreadCrumbIcon,
      } = getProjectConfig;

      const isSidebarType = menuType === MenuTypeEnum.SIDEBAR;
      const width = unref(widthRef);
      return (
        <Layout.Header class={['layout-header', 'flex p-0 px-4 ', unref(headerClass)]}>
          {() => (
            <>
              <div class="layout-header__content ">
                {showLogo && !isSidebarType && <Logo class={`layout-header__logo`} />}

                {mode !== MenuModeEnum.HORIZONTAL && showBreadCrumb && !splitMenu && (
                  <LayoutBreadcrumb showIcon={showBreadCrumbIcon} />
                )}
                {unref(showTopMenu) && (
                  <div
                    class={[`layout-header__menu `, `justify-${topMenuAlign}`]}
                    style={{ width: `calc(100% - ${unref(width)}px)` }}
                  >
                    <LayoutMenu
                      theme={headerTheme}
                      splitType={splitMenu ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE}
                      menuMode={splitMenu ? MenuModeEnum.HORIZONTAL : null}
                      showSearch={false}
                    />
                  </div>
                )}
              </div>

              <div class={`layout-header__action`}>
                {useErrorHandle && (
                  <Tooltip>
                    {{
                      title: () => '错误日志',
                      default: () => (
                        <Badge
                          count={errorStore.getErrorListCountState}
                          offset={[0, 10]}
                          overflowCount={99}
                        >
                          {() => (
                            <div class={`layout-header__action-item`} onClick={handleToErrorList}>
                              <BugOutlined class={`layout-header__action-icon`} />
                            </div>
                          )}
                        </Badge>
                      ),
                    }}
                  </Tooltip>
                )}

                {useLockPage && (
                  <Tooltip>
                    {{
                      title: () => '锁定屏幕',
                      default: () => (
                        <div class={`layout-header__action-item`} onClick={handleLockPage}>
                          <LockOutlined class={`layout-header__action-icon`} />
                        </div>
                      ),
                    }}
                  </Tooltip>
                )}
                {showNotice && (
                  <div>
                    <Tooltip>
                      {{
                        title: () => '消息通知',
                        default: () => <NoticeAction />,
                      }}
                    </Tooltip>
                  </div>
                )}
                {showRedo && (
                  <Tooltip>
                    {{
                      title: () => '刷新',
                      default: () => (
                        <div class={`layout-header__action-item`} onClick={refreshPage}>
                          <RedoOutlined class={`layout-header__action-icon`} />
                        </div>
                      ),
                    }}
                  </Tooltip>
                )}
                {showFullScreen && (
                  <Tooltip>
                    {{
                      title: () => (unref(isFullscreenRef) ? '退出全屏' : '全屏'),
                      default: () => {
                        const Icon: any = !unref(isFullscreenRef) ? (
                          <FullscreenOutlined />
                        ) : (
                          <FullscreenExitOutlined />
                        );
                        return (
                          <div class={`layout-header__action-item`} onClick={toggleFullscreen}>
                            <Icon class={`layout-header__action-icon`} />
                          </div>
                        );
                      },
                    }}
                  </Tooltip>
                )}
                <UserDropdown class={`layout-header__user-dropdown`} />
              </div>
              <LockAction onRegister={register} />
            </>
          )}
        </Layout.Header>
      );
    };
  },
});
