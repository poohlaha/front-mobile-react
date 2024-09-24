/**
 * @fileOverview common store
 * @date 2023-04-12
 * @author poohlaha
 */
import { observable, action } from 'mobx'
import { CONSTANT } from '@config/index'

class CommonStore {
  @observable language = CONSTANT.LANGUAGES[0] // 语言
  @observable skin = CONSTANT.SKINS[1] // 皮肤

  /**
   * 切换皮肤
   * @param index
   */
  @action
  onSkinChange(index: number = -1) {
    if (index === -1) {
      this.skin = this.skin === CONSTANT.SKINS[1] ? CONSTANT.SKINS[0] : CONSTANT.SKINS[1]
    } else {
      this.skin = CONSTANT.SKINS[index]
    }
  }
}

export default new CommonStore()
