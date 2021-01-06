import React, { Component } from "react";
// @ts-ignore
import logo from './assets/images/logo.png';
import gpaScale from './assets/json/gpaScale.json';
import exampleJSON from './assets/json/exampleJSON.json';
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Alert from 'react-bootstrap/Alert'
import YorkInfoModal from './components/modal/modal';
import Files from "react-files";
import Validator from 'jsonschema';
import ReactTooltip from 'react-tooltip';

class App extends Component {
  constructor(props) {
    super(props);

    this.getGradeListFromYork = this.getGradeListFromYork.bind(this);
    this.setAlert = this.setAlert.bind(this);

    let initList = [];
    let init4GPA = {};
    let init9GPA = {};

    for (let x = 0; x < 5; x++) {
      initList.push({
        Session: '',
        Course: '',
        Grade: '',
        Credits: ''
      })
    }

    for (let i = 0; i < gpaScale.length; i++) {
      init4GPA[gpaScale[i]['letter']] = gpaScale[i]["StandardGPA"];
      init9GPA[gpaScale[i]['letter']] = gpaScale[i]["YorkGPA"];
    }

    this.yorkInfoModal = React.createRef();

    this.state = {
      gpa4: 'N/A',
      gpa9: 'N/A',
      GPA4Scale: init4GPA,
      GPA9Scale: init9GPA,
      list: initList,
      modalShow: false,
      alertState: false,
      pageStateDisabled: false,
      alertType: "danger",
      alertMessage: "",
      inputKey: Date.now(),
      columns: [{
        dataField: 'Course',
        table2: '4.0 Scale'
      }, {
        dataField: 'Grade',
        table2: '9.0 Scale'
      },
      {
        dataField: 'Credits',
        table2: 'Add'
      }
      ]
    }

    this.fileReader = new FileReader();
    this.fileReader.onload = event => {
      const schema = {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "Session": { "type": "string"},
          "Course" : { "type": "string"},
          "Grade"  : { "type": "string", "required": true},
          "Credits": { "type": "string", "required": true}
          }
        }
      };
      let v = new Validator.Validator();
      let res = v.validate(JSON.parse(event.target.result.toString()), schema)
      if(res.valid === true){
        // @ts-ignore
        this.setState({ list: JSON.parse(event.target.result) }, () => {
          this.setAlert({state: true, type: "success", message: "Import successful.", duration: 3000});
        });
      }else{
        this.setAlert({state: true, type: "danger", message: "Error: Import failed. Please check your JSON file format is correct. (hover over import button to see an image of correct format)", duration: 8000})
      }
      this.setState({inputKey: Date.now()})
      this.updateInput(null,null,null);
    };

  }

  addItem() {
    const newItem = {
      Session: '',
      Course: '',
      Grade: '',
      Credits: ''
    };

    const list = [...this.state.list];
    list.push(newItem)
    this.setState({ list })
  }

  updateInput(key, index, value) {
    const list = [...this.state.list];
    let creds = 0;
    let total4GPA = 0;
    let total9GPA = 0;
    if (key !== null) {
      list[index][key] = value;
      this.setState({
        list: list
      })
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i]['Grade'] !== "Choose Grade" && list[i]['Grade'] !== "" && parseInt(list[i]['Credits']) > 0 && this.state.GPA4Scale[list[i]['Grade']] !== undefined && this.state.GPA9Scale[list[i]['Grade']] !== undefined) {
        creds += parseInt(list[i]['Credits']);
        total4GPA += this.state.GPA4Scale[list[i]['Grade']] * parseInt(list[i]['Credits'])
        total9GPA += this.state.GPA9Scale[list[i]['Grade']] * parseInt(list[i]['Credits'])
      } else {
        continue;
      }
    }

    let gpa4 = (total4GPA / creds).toFixed(2);
    let gpa9 = (total9GPA / creds).toFixed(2);

    this.setState({
      gpa4: parseInt(gpa4) >= 0 ? gpa4 : "N/A",
      gpa9: parseInt(gpa9) >= 0 ? gpa9 : "N/A"
    })
  }

  showYorkInfoModal() {
    this.yorkInfoModal.current.changeModalState(true)
  }

  setAlert(params) {
    this.setState({ alertState: params.state, alertType: params.type, alertMessage: params.message });
    if (params.pageStateDisabled !== undefined) {
      this.setState({ pageStateDisabled: params.pageStateDisabled })
    }
    if (params.duration !== undefined){
    setTimeout(() => { this.setState({ alertState: false }) }, params.duration)
    }
  }

  getGradeListFromYork(list) {
    this.setState({ list: list.reverse().filter(word => this.state.GPA4Scale[word.Grade] !== undefined) })
    this.updateInput(null, null, null);
  }

  formatDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  loadFile(file) {
    try {
      if (file.extension === 'json' && file.type === 'application/json') {
        this.fileReader.readAsText(file);
      }
    } catch (e) {
    }
  }

  loadFileError(err){
    let message = ""
    if(err.code === 1){
      message = err.message + ". Please make sure file type is a JSON file and matches the expected format (hover over import button to see an image of correct format)";
    }else if(err.code === 2){
      message = err.message + " and possibly isn't the right file. Please submit a JSON file that matches the expected format (hover over import button to see an image of correct format)";
    }else{
      message = err.message;
    }
    this.setAlert({state: true, type: "danger", message: "Error: " + message, duration: 8000})
  }

  exportList() {
    this.download(JSON.stringify(this.state.list), 'grades[' + this.formatDate() + ']', 'application/json');
  }

  render() {
    return (
      <div className="App">
        <Alert show={this.state.alertState} variant={this.state.alertType} >
          {this.state.alertMessage}
        </Alert>
        <br />
        <Image src={logo} alt="Logo" fluid />
        <div
          // @ts-ignore
          disabled={this.state.pageStateDisabled}>
          <br />
          <p>
            Please choose your grade from the dropdown and input the number of credits. <br />
            The course name is optional and is not used in the calculation but may be used to organize while entering your grades. <br />
            Additionally, if you would like, you may import your grades straight from York University Grades website. <br />
            <b>Note:</b> This requires entering your York username and password to scrape the data from York's Grade website and as such is an optional step. <br />
            If you do end up using this option, please be assured that your username/password is not stored and the session to your york account is discarded after the information is scraped for display on here only.
          </p>
          <YorkInfoModal ref={this.yorkInfoModal} setAlert={this.setAlert} getGrades={this.getGradeListFromYork} show={false} onHide={() => this.yorkInfoModal.current.changeModalState(false)} animation />
          <div style={{ display: "inline-flex", padding: "20px" }}>
            <Button style={{ marginRight: "10px", height: "3%" }} variant="danger" onClick={() => this.showYorkInfoModal()}>Import from York</Button>{' '}
            
            
      <Files key={this.state.inputKey} className="files-dropzone" onChange={file => { this.loadFile(file[0])}} onError={err => this.loadFileError(err)} accepts={[".json"]} maxFileSize={500000} minFileSize={0} clickable>
              <Button data-tip data-for="jsonExample" variant="info">Import from JSON</Button>{' '}
              <ReactTooltip id="jsonExample" place="bottom" type="dark" effect="solid">
                <p>The format should be as follows: (this is an example)</p>
                <span style={{whiteSpace: "pre-wrap"}}>{ JSON.stringify(exampleJSON,null,2)}</span> <br/>
                <p><strong>Note: </strong> You can always put in grades manually in the table and click export to generate this! </p>
              </ReactTooltip>
            </Files>
            
            <Button style={{ marginLeft: "10px", height: "3%" }} variant="success" onClick={() => this.exportList()}>Export to JSON</Button>{' '} <br /> <br />

          </div>
          <Table responsive bordered hover striped variant="dark">
            <thead>
              <tr>
                {Array.from(this.state.columns).map((_, index) => (
                  <th key={index}>{_.dataField}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(this.state.list).map((_, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control placeholder="Course Name (Optional)" value={_.Course} onChange={e => this.updateInput("Course", index, e.target.value)} />
                  </td>
                  <td>
                    <Form.Control as="select" placeholder="Course Name (Optional)" value={_.Grade} onChange={e => this.updateInput("Grade", index, e.target.value)}>
                      <option>Choose Grade</option>
                      <option>A+</option>
                      <option>A</option>
                      <option>B+</option>
                      <option>B</option>
                      <option>C+</option>
                      <option>C</option>
                      <option>D+</option>
                      <option>D</option>
                      <option>E</option>
                      <option>F</option>
                    </Form.Control>
                  </td>
                  <td>
                    <Form.Control type="number" placeholder="Credits. Eg. 3.00" value={_.Credits} onChange={e => this.updateInput("Credits", index, e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <thead>
              <tr>
                {Array.from(this.state.columns).map((_, index) => (
                  <th key={index}>{_.table2}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {this.state.gpa4}
                </td>
                <td>
                  {this.state.gpa9}
                </td>
                <td>
                  <Button variant="primary" block onClick={() => this.addItem()}>Add New Row</Button>{' '}
                </td>
              </tr>
            </tbody>
          </Table>
          <br />
        </div>
      </div>
    );
  }
}

export default App;
