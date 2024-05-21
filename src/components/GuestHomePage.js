import React from "react";
import {
  Image,
  message,
  Tabs,
  List,
  Typography,
  Form,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Carousel,
  Modal,
} from "antd";
import { bookStay, cancelReservation, getReservations, searchStays } from "../utils";
import { LeftCircleFilled, RightCircleFilled } from "@ant-design/icons";
import { StayDetailInfoButton } from "./HostHomePage";


const { TabPane } = Tabs;
const { Text } = Typography;
class CancelReservationButton extends React.Component {
    state = {
      loading: false,
    };
   
    handleCancelReservation = async () => {
      const { reservationId, onCancelSuccess } = this.props;
      this.setState({
        loading: true,
      });
   
      try {
        await cancelReservation(reservationId);
      } catch (error) {
        message.error(error.message);
      } finally {
        this.setState({
          loading: false,
        });
      }
   
      onCancelSuccess();
    };
   
    render() {
      return (
        <Button
          loading={this.state.loading}
          onClick={this.handleCancelReservation}
          danger={true}
          shape="round"
          type="primary"
        >
          Cancel Reservation
        </Button>
      );
    }
  }
  

class BookStayButton extends React.Component {
    state = {
      loading: false,
      modalVisible: false, //用户点了book之后进一步收集信息，这里是checkin checkout时间
    };
   
    handleCancel = () => {
      this.setState({
        modalVisible: false,
      });
    };
   
    handleBookStay = () => {
      this.setState({
        modalVisible: true,
      });
    };
   
    handleSubmit = async (values) => {
      const { stay } = this.props;
      this.setState({
        loading: true,
      });
   
      try {
        await bookStay({
          checkin_date: values.checkin_date.format("YYYY-MM-DD"),
          checkout_date: values.checkout_date.format("YYYY-MM-DD"),
          stay: {
            id: stay.id,
          },
        });
        message.success("Successfully book stay"); //可以优化为stay的具体的时间信息
        //可以加一个handle cancel让弹窗自己关闭
      } catch (error) {
        message.error(error.message);
      } finally {
        this.setState({
          loading: false,
        });
      }
    };
   
    render() {
      const { stay } = this.props;
      return (
        <>
          <Button onClick={this.handleBookStay} shape="round" type="primary">
            Book Stay
          </Button>
          <Modal //button trigger modal
            destroyOnClose={true}
            title={stay.name}
            visible={this.state.modalVisible}
            footer={null} //不需要默认的button
            onCancel={this.handleCancel}
          >
            <Form
              preserve={false}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              onFinish={this.handleSubmit}
            >
              <Form.Item
                label="Checkin Date"
                name="checkin_date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label="Checkout Date"
                name="checkout_date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button
                  loading={this.state.loading}
                  type="primary"
                  htmlType="submit"
                >
                  Book
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </>
      );
    }
  }
  

class SearchStays extends React.Component {
    state = {
      data: [],
      loading: false,
    };
   
    search = async (query) => {
      this.setState({
        loading: true,
      });
   
      try { //只有在点search之后才会拉去数据
        const resp = await searchStays(query);
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
        <> 
          <Form onFinish={this.search} layout="inline"> 
            <Form.Item
            //唯一的目的就是search，可以onfinish
              label="Guest Number" 
              name="guest_number" //form组件从用户那边收集的数据会在一个新的object的里面的某个property
              rules={[{ required: true }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              label="Checkin Date"
              name="checkin_date"
              rules={[{ required: true }]} //datepicker andesign的组件，先收集checkin
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
            //再收集checkout，因为api上面是两个，收集的form上是两个数据checkin checkout
              label="Checkout Date"
              name="checkout_date"
              rules={[{ required: true }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item>
              <Button
                loading={this.state.loading}
                type="primary" 
                htmlType="submit" //希望button被点击后search被trigger这里必须是submit
              >
                Submit 
              </Button>
            </Form.Item>
          </Form>
          <List
            style={{ marginTop: 20 }}
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
                  extra={<BookStayButton stay={item} />} //在右上角出现bookstaybutton

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
        </>
      );
    }
  }
  

class MyReservations extends React.Component {
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
      const resp = await getReservations();
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
        style={{ width: 1000, margin: "auto" }}
        loading={this.state.loading}
        dataSource={this.state.data}
        renderItem={(item) => (
          <List.Item actions={[
            <CancelReservationButton onCancelSuccess={this.loadData} reservationId={item.id} />,
          ]}>
            <List.Item.Meta
              title={<Text>{item.stay.name}</Text>}
              description={
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

class GuestHomePage extends React.Component {
    render() {
      return (
        <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
          <TabPane tab="Search Stays" key="1">
            <SearchStays />
          </TabPane>
          <TabPane tab="My Reservations" key="2">
            <MyReservations />
          </TabPane>
          
        </Tabs>
      );
    }
  }
   
  export default GuestHomePage;
  