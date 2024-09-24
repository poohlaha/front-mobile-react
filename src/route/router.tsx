/**
 * @fileOverview route
 * @date 2023-04-13
 * @author poohlaha
 */
import React from 'react'
import { RouteInterface } from '@router/router.interface'
import RouterUrls from '@route/router.url.toml'
const { lazy } = React
import Home from '@pages/home'

export const routes: RouteInterface[] = [
  {
    path: '/',
    exact: true,
    component: Home,
    name: 'dashboard',
    auth: false,
    title: '首页',
  },
  {
    path: RouterUrls.SYSTEM.HOME_URL,
    component: Home,
    exact: true,
    name: 'home',
    title: '首页',
    auth: false,
  },
  {
    path: RouterUrls.SYSTEM.NOT_FOUND_URL,
    component: lazy(() => import(/* webpackChunkName:'notfound' */ '@route/not-found/index')),
    exact: true,
    name: '404',
    title: '404',
    auth: false,
  },
]
