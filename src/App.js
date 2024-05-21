//处理最顶层的逻辑，检查用户是不是已经登录过了
import { Layout, Dropdown, Menu, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import LoginPage from "./components/LoginPage";
import HostHomePage from "./components/HostHomePage";
import GuestHomePage from "./components/GuestHomePage";

 
const { Header, Content } = Layout; 
//const Header = Layout.Header
//const Content = Layout.Content

//可以把authToken单独定义一个变量避免打错
//const authKey = "authToken"
class App extends React.Component {
  state = { //检查有没有登录
    authed: false,
    asHost: false,
  };
 
  componentDidMount() { //检查有没有登录，state检查，浏览器主动进行
    const authToken = localStorage.getItem("authToken"); //local storage存token
    const asHost = localStorage.getItem("asHost") === "true";
    this.setState({
      authed: authToken !== null, //有没有登录，登陆了=true
      asHost, //asHost: asHost 缩写
    });
  }
 
  handleLoginSuccess = (token, asHost) => { //指用户已经和浏览器互动，和用户有关
    localStorage.setItem("authToken", token);
    localStorage.setItem("asHost", asHost);
    this.setState({
      authed: true,
      asHost,
    });
  };
 
  handleLogOut = () => {
    localStorage.removeItem("authToken"); //移除token
    localStorage.removeItem("asHost");
    this.setState({
      authed: false,
    });
  };
 
  renderContent = () => { //
    if (!this.state.authed) {
      return <LoginPage handleLoginSuccess = {this.handleLoginSuccess} />;
    }
 
    if (this.state.asHost) {
      return <HostHomePage />;
    }

 
    return <GuestHomePage />;
  };
 
  userMenu = ( //logout button和用户互动
    <Menu>
      <Menu.Item key="logout" onClick={this.handleLogOut}>
        Log Out
      </Menu.Item>
    </Menu>
  );
 
  render() {//
    return (
      <Layout style={{ height: "100vh" }}>
        <Header style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
            Stays Booking
          </div>
          {this.state.authed && (//根据authed决定UI，如果已经登录，给出一个登出的选项
          //&&左边是true，右边会出现在页面上
            <div> 
              <Dropdown trigger="click" overlay={this.userMenu}> 
                <Button icon={<UserOutlined />} shape="circle" />
              </Dropdown>
            </div>
          )}
        </Header>
        <Content //
          style={{ height: "calc(100% - 64px)", margin: 20, overflow: "auto" }}
        >
          {this.renderContent()}
        </Content>
      </Layout>
    );
  }
}
 
export default App;