import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './modal.css';
import Form from 'react-bootstrap/Form';
import React, { Component } from "react";
import Alert from 'react-bootstrap/Alert'
import axios from 'axios';

class YorkInfoModal extends Component{
  constructor(props) {
    super(props);
    let {getGrades, ...newProps} = props;
    this.state = {
      user: "",
      pass: "",
      props:newProps,
      alertState: false,
      alertType: "danger",
      alertMessage: ""
    }

  }

  setAlert(state,message,type,duration){
    this.setState({alertState: state,alertType: type,alertMessage:message});
    setTimeout(() => {this.setState({alertState:false})},duration)
  }

  changeModalState(state){
    let l = {...this.state.props};
    l['show'] = state;
    this.setState({props: l})
  }

  scrapeData(){
    this.changeModalState(false);
    this.setState({user:"",pass:""});
    this.setAlert(true,"Attempting to gather data. ETA:~6 Seconds.","warning",4000);
    axios.post(`getGrades`, { user: this.state.user, pass: this.state.pass })
      .then(res => {
        this.props.getGrades(res.data.gradeList);
        this.setAlert(true,"Data importing successful.","success",2000);
      })
      .catch(error => {
        this.setAlert(true,"Error: " + error.response.data.Error,"danger",3000);
      })
  }



render() {
    return (
      <div>
        <Alert show={this.state.alertState} variant={this.state.alertType} >
          {this.state.alertMessage}
        </Alert>
      <Modal
        {...this.state.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            York Login
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <h4>Enter York Login Info</h4>
          <p>
            <b>Note:</b> This is required to scrape the data from York's Grade website.
            Please be assured that your username/password is not stored and the session to your york account is discarded after the information is scraped for display on here only.<br/>
          </p>
          <Form.Control placeholder="Username" value={this.state.user} onChange={e =>  this.setState({user: e.target.value})} /> <br/>
          <Form.Control placeholder="Password" type="password" value={this.state.pass} onChange={e =>  this.setState({pass: e.target.value})} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={this.state.props.onHide}>Close</Button>
          <Button variant="success" onClick={() => this.scrapeData()}>Get Data</Button>
        </Modal.Footer>
      </Modal>
      </div>
    );
  }
}

export default YorkInfoModal