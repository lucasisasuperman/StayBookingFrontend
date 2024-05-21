//定义一个空class
//打开新页面，getstaybuhost，渲染，点按钮详细信息一个ccomponent，移除也是一个component与后端代码沟通
//页面上重新获取数据，显示不同，点view reservation，会有个弹窗，显示reservation信息
import {
    message,
    Tabs,
    List,
    Card,
    Image,
    Carousel,
    Button,
    Tooltip,
    Space,
    Modal,
  } from "antd";
  import {
    LeftCircleFilled,
    RightCircleFilled,
    InfoCircleOutlined,
  } from "@ant-design/icons";
  import Text from "antd/lib/typography/Text";
  import React from "react";
  import { deleteStay, getReservationsByStay, getStaysByHost } from "../utils";
import UploadStay from "./UploadStay";


 
const { TabPane } = Tabs;
//tabs用来分隔
 
class HostHomePage extends React.Component {
  render() {//可以从render content中直接返回相关逻辑，来测试
    return ( //destroyInactiveTabPane移除未active的tabbar
    //defaultActiveKey调用tabpane的key，保持一致
      <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}> 
        <TabPane tab="My Stays" key="1"> 
          <MyStays />
        </TabPane>
        <TabPane tab="Upload Stay" key="2">
          <UploadStay />
        </TabPane>
      </Tabs>
    );
  }
}
 
class MyStays extends React.Component {
    state = {
      loading: false,
      data: [],
    };
   
    componentDidMount() {
      this.loadData();
    }
   
    loadData = async () => {
      this.setState({
        loading: true,
      });
   
      try {
        const resp = await getStaysByHost();
        this.setState({
          data: resp,
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        this.setState({
          loading: false,
        });
      }
    };
   
    render() {
      return (
        <List
          loading={this.state.loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 3,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={this.state.data}
          renderItem={(item) => (
            <List.Item>
              <Card
                key={item.id}
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Text ellipsis={true} style={{ maxWidth: 150 }}>
                      {item.name}
                    </Text>
                    <StayDetailInfoButton stay={item} />
                  </div>
                }
                actions={[<ViewReservationsButton stay={item} />]}
                extra={<RemoveStayButton stay={item} onRemoveSuccess={this.loadData} />}
              >
                {
                  <Carousel
                    dots={false}
                    arrows={true}
                    prevArrow={<LeftCircleFilled />}
                    nextArrow={<RightCircleFilled />}
                  >
                    {item.images.map((image, index) => (
                      <div key={index}>
                        <Image src={image.url} width="100%" />
                      </div>
                    ))}
                  </Carousel>
                }
              </Card>
            </List.Item>
          )}
        />
      );
    }
  }

  

export default HostHomePage;
export class StayDetailInfoButton extends React.Component {
    state = {
      modalVisible: false,
    };
   
    openModal = () => {
      this.setState({
        modalVisible: true,
      });
    };
   
    handleCancel = () => {
      this.setState({
        modalVisible: false,
      });
    };
   
    render() {
      const { stay } = this.props;
      const { name, description, address, guest_number } = stay;
      const { modalVisible } = this.state;
      return (
        <>
          <Tooltip title="View Stay Details">
            <Button
              onClick={this.openModal}
              style={{ border: "none" }}
              size="large"
              icon={<InfoCircleOutlined />}
            />
          </Tooltip>
          {modalVisible && (
            <Modal
              title={name}
              centered={true}
              visible={modalVisible}
              closable={false}
              footer={null}
              onCancel={this.handleCancel}
            >
              <Space direction="vertical">
                <Text strong={true}>Description</Text>
                <Text type="secondary">{description}</Text>
                <Text strong={true}>Address</Text>
                <Text type="secondary">{address}</Text>
                <Text strong={true}>Guest Number</Text>
                <Text type="secondary">{guest_number}</Text>
              </Space>
            </Modal>
          )}
        </>
      );
    }
  }

  class RemoveStayButton extends React.Component {
    state = {
      loading: false,
    };
   
    handleRemoveStay = async () => { //await会等着前面的结果拿到
      const { stay, onRemoveSuccess } = this.props;
      this.setState({
        loading: true,
      });
   
      try {
        await deleteStay(stay.id);
        onRemoveSuccess();
      } catch (error) {
        message.error(error.message);
      } finally {
        this.setState({
          loading: false,
        });
      }
    };
   
    render() {
      return (
        <Button
          loading={this.state.loading} //loading和loading连起来
          onClick={this.handleRemoveStay}//和handleremovestay连起来
          danger={true}
          shape="round"
          type="primary"
        >
          Remove Stay
        </Button>
      );
    }
  }
  
  class ViewReservationsButton extends React.Component {
    state = {
      modalVisible: false,
    };
   
    openModal = () => {
      this.setState({
        modalVisible: true,
      });
    };
   
    handleCancel = () => {
      this.setState({
        modalVisible: false,
      });
    };
   
    render() {
      const { stay } = this.props;
      const { modalVisible } = this.state;
   
      const modalTitle = `Reservations of ${stay.name}`;
   
      return (
        <>
          <Button onClick={this.openModal} shape="round">
            View Reservations
          </Button>
          {modalVisible && (
            <Modal
              title={modalTitle}
              centered={true}
              visible={modalVisible}
              closable={false} //右上角的X按钮
              footer={null} //ok cancel button会被移除
              onCancel={this.handleCancel}
              destroyOnClose={true} //每次点开都要拉数据
            >
              <ReservationList stayId={stay.id} />
            </Modal>
          )}
        </>
      );
    }
  }

  class ReservationList extends React.Component {
    state = {
      loading: false,
      reservations: [],
    };
   
    componentDidMount() {
      this.loadData();
    }
   
    loadData = async () => {
      this.setState({
        loading: true,
      });
   
      try {
        const resp = await getReservationsByStay(this.props.stayId);
        this.setState({
          reservations: resp,
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        this.setState({
          loading: false,
        });
      }
    };
   
    render() {
      const { loading, reservations } = this.state;
   
      return ( //text中间内容取决于后端传送来的数据
        <List
          loading={loading}
          dataSource={reservations}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text>Guest Name: {item.guest.username}</Text>}
                description={ //<></>一个统一的根节点，div和空<></>区别，div需要多元素，空<></>不会被转化
                  <>
                    <Text>Checkin Date: {item.checkin_date}</Text>
                    <br /> 
                    <Text>Checkout Date: {item.checkout_date}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      );
    }
  }
  