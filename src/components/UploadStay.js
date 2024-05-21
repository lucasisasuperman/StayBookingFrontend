import React from "react";
import { Form, Input, InputNumber, Button, message } from "antd";
import { uploadStay } from "../utils";
//antdesign收集用户信息填表上传多个图片，
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
 
class UploadStay extends React.Component {
  state = {
    loading: false,
  };
 
  fileInputRef = React.createRef();
 
  handleSubmit = async (values) => { 
    const formData = new FormData(); //FormData浏览器自带，当给后端发文件，需要使用formdata
    const { files } = this.fileInputRef.current; //ref从外部获取真正有用的数据在.current上，读取的时候要有.current
 
    if (files.length > 5) {
      message.error("You can at most upload 5 pictures.");
      return;
    }
 
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
 
    formData.append("name", values.name);
    formData.append("address", values.address);
    formData.append("description", values.description);
    formData.append("guest_number", values.guest_number);
 
    this.setState({ //发消息的套路
      loading: true,
    });
    try {
      await uploadStay(formData);
      message.success("upload successfully");
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
      <Form
        {...layout} //用来代替5-8
        name="nest-messages"
        onFinish={this.handleSubmit}
        style={{ maxWidth: 1000, margin: "auto" }}//水平居中
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input /> 
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item> 
        <Form.Item
          name="guest_number"
          label="Guest Number" //type强迫用户只能输入数字，输入的数字最小是1
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item name="picture" label="Picture" rules={[{ required: true }]}>
          <input //让用户选文件，小写input是html自带
            type="file"
            accept="image/png, image/jpeg" //过滤出只有这两种file可以被选取
            ref={this.fileInputRef} //从外界拉取某个元素的内部信息
            multiple={true} //多个文件
          />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit" loading={this.state.loading}> 
            Submit 
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
 
export default UploadStay;
