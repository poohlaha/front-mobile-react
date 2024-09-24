/**
 * @fileOverview base store, all store muse extends this store
 * @date 2023-04-12
 * @author poohlaha
 */
import { action, observable } from 'mobx'
import { SYSTEM } from '@config/index'
import { COMMON, TOAST } from '@utils/base'
import Utils from '@utils/utils'
import SmCrypto from 'sm-crypto'

export default class BaseStore {
  @observable loading: boolean = false
  @observable currentPage: number = 1
  @observable pageSize: number = 10
  @observable totalPage: number = 0 // 总页数

  readonly tokenName: string = 'token'
  readonly DOMAIN_PORT_REG = /^https?:\/\/[^\\/]+\/([^?#]+(\?[^#]*)?)?/

  readonly API_DATA = {
    localIp: '127.0.0.1',
    version: '1.0',
    appVersion: '1.0',
    opStation: 'NA',
    appId: 'KJMHWEB',
    channel: 'web',
  }

  /**
   * 获取相对路径
   */
  @action
  getRelativePath(url: string = '') {
    if (Utils.isBlank(url)) return ''
    const match = url.match(this.DOMAIN_PORT_REG)
    if (match) {
      let matchUrl = match[1] || ''
      if (matchUrl.startsWith('/')) {
        return matchUrl
      }

      return `/${matchUrl}`
    }

    return url || ''
  }

  /**
   * 设置属性
   */
  @action
  setProperty = (property: any, value: any) => {
    // @ts-ignore
    this[property] = value
  }

  /**
   * 获取属性
   */
  @action
  getProperty = (property: any) => {
    // @ts-ignore
    return this[property]
  }

  /**
   * 发送请求
   * options: {
   *   url: '',
   *   success: () -> {},
   *   fail: () => {}
   * }
   */
  async send(options: { [K: string]: any } = {}, needSend: boolean = true, headers: { [K: string]: any } = {}) {
    if (Utils.isObjectNull(options)) {
      console.warn('options is empty !')
      return
    }

    if (Utils.isBlank(options.url)) {
      console.warn('url is empty !')
      return
    }

    let requestUrl = options.url || ''
    if (!requestUrl.startsWith('https://') && !requestUrl.startsWith('http://')) {
      requestUrl = process.env.API_ROOT + requestUrl
    }

    let token = this.sm2Encrypt(`${Utils.getLocal(SYSTEM.LOCAL_TOKEN_NAME) || ''}_${new Date().getTime()}`)
    console.log('token: ', Utils.getLocal(SYSTEM.LOCAL_TOKEN_NAME))
    let requestHeaders = {}
    if (!Utils.isObjectNull(headers)) {
      requestHeaders = headers
    }

    let type = options.responseStream ? '3' : '0'
    let params: any = {
      url: requestUrl,
      data: {
        ...this.API_DATA,
        requestId: Utils.generateUUID(),
        requestTime: Utils.formatDateStr(new Date(), 'yyyyMMddHHmmss'),
        data: {
          ...options.data,
        },
      },
      headers: {
        [this.tokenName]: token || '',
        ...requestHeaders,
      },
      success: (data: any = {}) => {
        if (type !== '0') {
          return options.success?.(data.body || null)
        }

        let body = data.body || {}
        if (body.code !== '0' && body.code !== 0) {
          // token 过期
          if (body.code === SYSTEM.TOKEN_EXPIRED_CODE) {
            /*
            TOAST.show({
              message: COMMON.getLanguageText('TOKEN_EXPIRED_ERROR'),
              type: 3
            })
             */
          } else {
            let whenCodeNoZeroOpenDialog = options.whenCodeNoZeroOpenDialog
            if (whenCodeNoZeroOpenDialog === null || whenCodeNoZeroOpenDialog === undefined) {
              whenCodeNoZeroOpenDialog = true
            }
            if (whenCodeNoZeroOpenDialog) {
              TOAST.show({
                message: COMMON.getLanguageText('ERROR_MESSAGE'),
                type: 3,
              })
            }
          }

          return options.fail?.(body || {})
        }

        return options.success?.(body.data || {}, body)
      },
      failed: async (res: any = {}) => {
        if (res.code === SYSTEM.TOKEN_EXPIRED_CODE) {
        } else {
          options.fail?.(res)
        }
      },
      type: '0',
      responseType: type,
    }

    return needSend ? await $http.send(params) : params
  }

  /**
   * 批量发送
   * @param queue
   */
  @action
  async batchSend(queue: Array<any> = []) {
    if (queue.length === 0) {
      console.log('batch send queue is empty!')
      return []
    }

    let results = (await Promise.all(queue)) || []
    if (results.length === 0) return []

    let data: Array<any> = []
    for (let result of results) {
      if (result === null || result === undefined) {
        result = {}
      }
      let status = result.status
      let body = result.body || {}
      let errorMsg = body.error || body.codeInfo || COMMON.getLanguageText('ERROR_MESSAGE')
      if (status !== 200) {
        TOAST.show({ message: errorMsg, type: 4 })
        return []
      }

      let d = body.data
      let extendData = body.extendData
      data.push({
        data: d,
        extendData,
      })
    }

    return data
  }

  /**
   * sm2加密
   */
  sm2Encrypt(str: string = '') {
    if (Utils.isBlank(str)) return ''
    let publicKey = process.env.SM2_PUBLIC_KEY || ''
    if (!publicKey.startsWith('04')) {
      publicKey = `04${publicKey}`
    }

    // 1: C1C3C2 0: C1C2C3
    return SmCrypto.sm2.doEncrypt(str, publicKey, 1)
  }

  /**
   * 文件上传
   */
  async onUpload(options: { [K: string]: any } = {}, headers: { [K: string]: any } = {}) {
    if (Utils.isObjectNull(options)) return

    let requestHeaders = {}
    let token = this.sm2Encrypt(`${Utils.getLocal(SYSTEM.LOCAL_TOKEN_NAME) || ''}_${new Date().getTime()}`)
    console.log('token: ', Utils.getLocal(SYSTEM.LOCAL_TOKEN_NAME))

    if (!Utils.isObjectNull(headers)) {
      requestHeaders = headers
    }

    let requestUrl = options.url || ''
    if (!requestUrl.startsWith('https://') && !requestUrl.startsWith('http://')) {
      requestUrl = process.env.API_ROOT + requestUrl
    }

    // 测试环境设置禁用证书发送
    if (process.env.APP_NODE_ENV === 'prod') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    let type = options.responseStream ? '3' : '0'
    await $http.send({
      url: requestUrl,
      headers: {
        [this.tokenName]: token || '',
        ...requestHeaders,
      },
      data: options.data,
      method: options.method || '',
      timeout: 500,
      responseType: type,
      success: (data: any = {}) => {
        if (type !== '0') {
          return options.success?.(data.body || null)
        }

        let body = data.body || {}
        if (body.code !== '0' && body.code !== 0) {
          // token 过期
          if (body.code === SYSTEM.TOKEN_EXPIRED_CODE) {
            TOAST.show({
              message: COMMON.getLanguageText('TOKEN_EXPIRED_ERROR'),
              type: 3,
            })
          } else {
            TOAST.show({
              message: COMMON.getLanguageText('ERROR_MESSAGE'),
              type: 3,
            })
          }

          return options.fail?.(body || {})
        }

        return options.success?.(body.data || {})
      },
      failed: async (res: any = {}) => {
        if (res.code === SYSTEM.TOKEN_EXPIRED_CODE) {
          // await this.getLoginUrl()
        } else {
          options.fail?.(res)
        }
      },
      type: '2',
    })
  }
}
