import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './modal.css';
import Form from 'react-bootstrap/Form';
import React, { Component } from "react";
import axios from 'axios';

class YorkInfoModal extends Component{
  constructor(props) {
    super(props);
    let {getGrades,setAlert, ...newProps} = props;
    this.state = {
      user: "",
      pass: "",
      props:newProps
    }
  }

  changeModalState(state){
    let l = {...this.state.props};
    l['show'] = state;
    this.setState({props: l})
  }

  scrapeData(){
    this.changeModalState(false);
    this.setState({user:"",pass:""});
    this.props.setAlert({state: true, message: "Attempting to gather data. Please Wait.", type: "warning", pageStateDisabled:true});
    axios.post(`getGrades`, { user: this.state.user, pass: this.state.pass })
      .then(res => {
        this.props.getGrades(res.data.gradeList);
        this.props.setAlert({state: true, message: "Data importing successful.", type: "success", duration:2000, pageStateDisabled:false});
      })
      .catch(error => {
        this.props.setAlert({state: true, message: "Error: " + error.response.data.Error, type: "danger", duration: 3000, pageStateDisabled:false});
      })
  }

render() {
    return (
      <div>
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