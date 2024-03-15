import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import iRAPLogo from './resources/iRAP_Logo.png';
import ROSLIB from 'roslib';
import ImageViewer from './components/ImageViewer';
import GamepadComponent from './components/GamepadAPI';


interface IProps {

}
interface IState {
  Button_A_Flag: boolean
  Button_A_Value: number
  readROSInt16: number
  ros: ROSLIB.Ros
  didMounted: boolean
}

const initialROS = (url: string) => {
  const ros = new ROSLIB.Ros(({ url }));
  return ros
}

class App extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      readROSInt16: 0,
      ros: initialROS('ws://0.0.0.0:9090'),
      Button_A_Flag: false,
      Button_A_Value: 0,
      didMounted: false,
    }
  }

  onButtonAClickHandle = () => {
    this.setState({
      Button_A_Value: this.state.Button_A_Value + 1,
      Button_A_Flag: !this.state.Button_A_Flag
    })

    const { ros } = this.state;
    this.PublishInt16(ros, "/gui/buttonCommand", this.state.Button_A_Value)
    console.log("onButtonClickHandle : ", this.state.Button_A_Flag)
  }

  onButtonBClickHandle = () => {

  }



  SubscribeInt16 = (ros: ROSLIB.Ros, topicName: string) => {
    const robotReadTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName, // adjust the topic name based on your setup
      messageType: 'std_msgs/Int16',
    });

    robotReadTopic.subscribe((message: ROSLIB.Message) => {
      const messageResponse = message as ROSLIB.Message &
      {
        data: number,
      };

      this.setState({ readROSInt16: messageResponse.data });
    });

  }


  PublishInt16 = (ros: ROSLIB.Ros, topicName: string, value: number) => {
    const joypadRosTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName, // Adjust the topic name based on your setup, e.g., '/your_joy_topic'
      messageType: 'std_msgs/Int16', // Adjust the message type based on your setup
    });


    const Int16Message = new ROSLIB.Message({
      data: value,
    });


    joypadRosTopic.publish(Int16Message)
  }



  onROSConnection = () => {
    console.log("connected !")
    this.SubscribeInt16(this.state.ros, '/gui/readInt16')
  }

  onROSError = () => {
    console.log("error")
  }

  onROSClose = () => {
    console.log("closed")
  }

  componentDidMount = () => {
    const { ros } = this.state;
    ros.on('connection', this.onROSConnection)
    ros.on('error', this.onROSError)
    ros.on('close', this.onROSClose)
  }

  componentWillUnmount = () => {
    if (this.state.didMounted) {
      this.state.ros.close()
    }
  }




  render() {
    return (
      <div>
        <GamepadComponent ros={this.state.ros} joypadTopicName={'/gui/output/robot_control'} onJoyStickConnection={(connection) => {
          // this.setState({ joyConnection: connection });
        }} joyEnable={this.state.Button_A_Flag} />
        <Row >
          <div className='col d-flex justify-content-center main-camera'>
            <img src={iRAPLogo} alt="" />
            {/* <ImageViewer ros={this.state.ros} ImageCompressedTopic={''} width={''} height={''} rotate={0} hidden={false}></ImageViewer> */}
          </div>
        </Row>
        <Row>
          <Col>
            <div className='col d-flex justify-content-center' >
              <Button onClick={this.onButtonAClickHandle} variant={!this.state.Button_A_Flag ? 'primary' : 'warning'} >Press A</Button>
            </div>
          </Col>

          <Col>
            <div className='col d-flex justify-content-center'>
              <Button onClick={this.onButtonBClickHandle}>Press B</Button>
            </div>
          </Col>

          <Col>
            <div className='col d-flex justify-content-center'>Value A : {this.state.Button_A_Value}</div>
          </Col>

          <Col>
            <div className='col d-flex justify-content-center'>Value B : </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
