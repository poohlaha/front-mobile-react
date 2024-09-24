/**
 * @fileOverview chat
 * @date 2023-04-12
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import { Button, Space } from 'antd-mobile'
import Loading from '@views/components/loading/loading'

const Home: React.FC<IRouterProps> = (props: IRouterProps): ReactElement => {
  const { homeStore } = useStore()

  const render = () => {
    return (
      <div className="home-page wh100 flex-direction-column">
        <div className="page-margin-bottom">
          <Space wrap>
            <Button color="primary" fill="solid">
              Solid
            </Button>
            <Button color="primary" fill="outline">
              Outline
            </Button>
            <Button color="primary" fill="none">
              None
            </Button>
          </Space>
        </div>

        <div className="card">
          <div className="card-top flex-align-center flex-jsc-between">
            <div className="card-title font-bold flex-align-center">
              <p>卡片标题</p>
            </div>
            {/* 状态 */}
            <div className="card-status">状态</div>
          </div>

          {/* 描述 */}
          <span className="over-two-ellipsis card-desc card-top-margin">这是一个卡片描述</span>

          <div className="card-footer flex-align-center flex-jsc-between">
            {/* 日期 */}
            <span className="card-desc">2024-09-24</span>

            {/* 查看详情 */}
            <span className="card-desc">查看详情</span>
          </div>
        </div>

        <Loading show={true} />
      </div>
    )
  }

  return render()
}

export default observer(Home)
