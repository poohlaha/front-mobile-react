/**
 * @fileOverview layout
 * @date 2023-04-12
 * @author poohlaha
 */
import React, { ReactElement, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { RouteInterface } from '@router/router.interface'
import NotFound from '@route/not-found'
import ScrollToTop from '@router/scrollToTop'
import { routes } from '@route/router'
import Loading from '../views/components/loading'
import Utils from '@utils/utils'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import { CONSTANT } from '@config/index'
import '@assets/styles/theme/index.less'
import RouterUrls from '@route/router.url.toml'
import { LanguageProvider } from '@provider/language'
import { ConfigProvider } from 'antd-mobile'
import antdZhCN from 'antd-mobile/es/locales/zh-CN'
import antdEnUS from 'antd-mobile/es/locales/en-US'
import zhCN from '@assets/locales/zh.toml'
import enUS from '@assets/locales/en.toml'
import { IntlProvider } from 'react-intl'
import 'lib-flexible'

const { Suspense } = React

const RenderRoutes = (routes: RouteInterface[]) => {
  // 判断没用的路由, 跳转到404
  let usedRoutes: Array<RouteInterface> = []
  for (let router of routes) {
    if (!Utils.isBlank(router.path) || router.component !== null) {
      usedRoutes.push(router)
    }
  }

  if (usedRoutes.length > 0) {
    return (
      <Routes>
        {routes.map((route: RouteInterface, index: number) => {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Suspense fallback={<Loading show={true} />}>
                  <ScrollToTop />
                  <route.component routes={route.routes || []} />
                </Suspense>
              }
            ></Route>
          )
        })}

        <Route path="*" element={<Navigate to={RouterUrls.SYSTEM.NOT_FOUND_URL} />} />
      </Routes>
    )
  } else {
    return <Route element={<NotFound />} />
  }
}

// 切换皮肤
const switchSkin = (skin: string = '') => {
  let classList = document.body.classList || []
  const remove = () => {
    if (skin === CONSTANT.SKINS[0]) {
      classList.remove(CONSTANT.SKINS[1])
    } else {
      classList.remove(CONSTANT.SKINS[0])
    }
  }

  remove()
  if (!classList.contains(skin)) {
    classList.add(skin)
  }
}

const Layout = (): ReactElement => {
  const { commonStore } = useStore()

  const langList: any = {
    zh: zhCN,
    en: enUS,
  }

  useEffect(() => {
    switchSkin(commonStore.skin)
  }, [commonStore.skin])

  const render = () => {
    return (
      <IntlProvider
        locale={commonStore.language}
        defaultLocale={CONSTANT.LANGUAGES[0]}
        messages={langList[commonStore.language]}
      >
        {/* 注入语言 */}
        <LanguageProvider>
          {/* ant design 国际化注入 */}
          <ConfigProvider locale={commonStore.language === CONSTANT.LANGUAGES[0] ? antdZhCN : antdEnUS}>
            {RenderRoutes(routes)}
          </ConfigProvider>
        </LanguageProvider>
      </IntlProvider>
    )
  }

  return render()
}

export default observer(Layout)
