import React, { Component } from "react";
// @ts-ignore
import logo from './assets/images/logo.png';
import gpaScale from './assets/json/gpaScale.json';
import exampleJSON from './assets/json/exampleJSON.json';
import {Table, Form, Button, Image, Alert} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import YorkInfoModal from './components/modal/modal';
import Files from "react-files";
import Validator from 'jsonschema';
import ReactTooltip from 'react-tooltip';
import Switch from "react-switch";
import gpaHelpers from './helpers/gpa/helper'

class App extends Component {
  constructor(props) {
    super(props);

    this.getGradeListFromYork = this.getGradeListFromYork.bind(this);
    this.setAlert = this.setAlert.bind(this);

    let initList = [];
    let init4GPA = {};
    let init9GPA = {};

    for (let i = 0; i < gpaScale.length; i++) {
      init4GPA[gpaScale[i]['letter']] = gpaScale[i]["StandardGPA"];
      init9GPA[gpaScale[i]['letter']] = gpaScale[i]["YorkGPA"];
    }

    this.yorkInfoModal = React.createRef();

    this.state = {
      gpa4: 'N/A',
      gpa9: 'N/A',
      grde: 'N/A',
      cred: 'N/A',
      desiredGrade: 'Choose Grade',
      GPA4Scale: init4GPA,
      GPA9Scale: init9GPA,
      list: gpaHelpers.generateBlankList(),
      modalShow: false,
      alertState: false,
      pageStateDisabled: false,
      gpaConverter: true,
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
            "Session": { "type": "string" },
            "Course": { "type": "string" },
            "Grade": { "type": "string", "required": true },
            "Credits": { "type": "string", "required": true }
          }
        }
      };
      let v = new Validator.Validator();
      let res = v.validate(JSON.parse(event.target.result.toString()), schema)
      if (res.valid === true) {
        if(isNaN(JSON.parse(event.target.result.toString())[0].Grade)){
          this.toggleView(true);
        }else{
          this.toggleView(false);
        }
        // @ts-ignore
        this.setState({ list: JSON.parse(event.target.result) }, () => {
          this.setAlert({ state: true, type: "success", message: "Import successful.", duration: 3000 });
        });
      } else {
        this.setAlert({ state: true, type: "danger", message: "Error: Import failed. Please check your JSON file format is correct. (hover over import button to see an image of correct format)", duration: 8000 })
      }
      this.setState({ inputKey: Date.now() })
      this.updateInput(null, null, null);
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

  updateInput(key=null, index=null, value=null) {
    const list = [...this.state.list];
    let creds = 0.0;
    let total4GPA = 0;
    let total9GPA = 0;
    let totalGrade = 0;
    if (key !== null) {
      list[index][key] = value;
      this.setState({
        list: list
      })
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i]['Grade'] !== "Choose Grade" && list[i]['Grade'] !== "" && parseFloat(list[i]['Credits']) > 0 && (!this.state.gpaConverter || (this.state.GPA4Scale[list[i]['Grade']] !== undefined && this.state.GPA9Scale[list[i]['Grade']] !== undefined))) {
        creds += parseFloat(list[i]['Credits']);
        if (this.state.gpaConverter) {
          total4GPA += this.state.GPA4Scale[list[i]['Grade']] * parseFloat(list[i]['Credits'])
          total9GPA += this.state.GPA9Scale[list[i]['Grade']] * parseFloat(list[i]['Credits'])
        } else {
          totalGrade += parseFloat(list[i]['Grade']) * parseFloat(list[i]['Credits']);
        }
      } else {
        continue;
      }
    }

    let gpa4 = (total4GPA / creds).toFixed(2);
    let gpa9 = (total9GPA / creds).toFixed(2);
    let grde = (totalGrade / creds).toFixed(2);

    this.setState({
      gpa4: parseInt(gpa4) >= 0 ? gpa4 : "N/A",
      gpa9: parseInt(gpa9) >= 0 ? gpa9 : "N/A",
      grde: parseFloat(grde) >= 0 ? grde : "N/A",
      cred: (creds) >= 0 ? creds : "N/A"
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
    if (params.duration !== undefined) {
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

  loadFileError(err) {
    let message = ""
    if (err.code === 1) {
      message = err.message + ". Please make sure file type is a JSON file and matches the expected format (hover over import button to see an image of correct format)";
    } else if (err.code === 2) {
      message = err.message + " and possibly isn't the right file. Please submit a JSON file that matches the expected format (hover over import button to see an image of correct format)";
    } else {
      message = err.message;
    }
    this.setAlert({ state: true, type: "danger", message: "Error: " + message, duration: 8000 })
  }

  exportList() {
    this.download(JSON.stringify(this.state.list), (this.state.gpaConverter ? 'gpa[' : 'grades[') + this.formatDate() + ']', 'application/json');
  }

  toggleView(state) {
    const gpaColumns = [{
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
    ];

    const gradeColumns = [{
      dataField: 'Grade %',
      table2: 'Grade in Percentage'
    },
    {
      dataField: 'Weight',
      table2: 'Letter Grade'
    }
    ]

    let cols = [];
    let list = [];
    if (state) {
      cols = gpaColumns;
      for (let x = 0; x < 5; x++) {
        list.push({
          Session: '',
          Course: '',
          Grade: '',
          Credits: ''
        })
      }
    } else {
      cols = gradeColumns;
      for (let x = 0; x < 5; x++) {
        list.push({
          Grade: '',
          Credits: ''
        })
      }
    }

    this.setState({ gpaConverter: state, columns: cols, list: list, grde: "N/A", gpa4: "N/A", gpa9: "N/A" });
  }

  getletterGrade(gr = null) {
    if (gr === null) {
      gr = this.state.grde;
    }
    if (gr === "N/A") {
      return "N/A";
    }

    let grade = parseInt(gr);
    if (grade >= 90) {
      return "A+";
    } else if (grade >= 80) {
      return "A";
    } else if (grade >= 75) {
      return "B+";
    } else if (grade >= 70) {
      return "B";
    } else if (grade >= 65) {
      return "C+";
    } else if (grade >= 60) {
      return "C";
    } else if (grade >= 55) {
      return "D+";
    } else if (grade >= 50) {
      return "D";
    } else if (grade >= 40) {
      return "E";
    } else {
      return "F";
    }
  }

  calculateMaxGrade() {
    let creds = 0;
    let totalGrade = 0;
    const list = [...this.state.list];
    for (let i = 0; i < list.length; i++) {
      if (list[i]['Grade'] !== "" && parseFloat(list[i]['Credits']) > 0) {
        creds += parseFloat(list[i]['Credits']);
        totalGrade += parseFloat(list[i]['Grade']) * parseFloat(list[i]['Credits']);
      } else {
        continue;
      }
    }
    let remainderCreds = 100 - creds;
    if (creds !== 0) {
      creds += remainderCreds;
      totalGrade += 100 * remainderCreds;
    }
    if (creds === 0) {
      return "N/A";
    } else {
      return (totalGrade / creds).toFixed(2) + "%"
    }
  }

  calculateDesiredGrade(){
    let desiredGrade = this.state.desiredGrade;
    let numberGrade = 0;
    if(desiredGrade === "A+"){
      numberGrade = 90;
    }else if(desiredGrade === "A"){
      numberGrade = 80;
    }else if(desiredGrade === "B+"){
      numberGrade = 75;
    }else if(desiredGrade === "B"){
      numberGrade = 70;
    }else if(desiredGrade === "C+"){
      numberGrade = 65;
    }else if(desiredGrade === "C"){
      numberGrade = 60;
    }else if(desiredGrade === "D+"){
      numberGrade = 55;
    }else if(desiredGrade === "D"){
      numberGrade = 50;
    }else if(desiredGrade === "E"){
      numberGrade = 40;
    }else if(desiredGrade === "F"){
      numberGrade = 39
    }

    return ((100*numberGrade - parseFloat(this.state.grde)*parseFloat(this.state.cred))/(100-parseFloat(this.state.cred))).toFixed(2) + '%'

  }

  clearAllFields(){
    let list = [...this.state.list]
    for (let i=0;i<list.length;i++){
      if(this.state.gpaConverter){
        list[i]["Session"] = "";
        list[i]["Course"] = "";
        list[i]["Grade"] = "";
        list[i]["Credits"] = "";
      }else{
        list[i]["Grade"] = "";
        list[i]["Credits"] = "";
      }
    }
    this.setState({list:list});
    this.updateInput();
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
            <Button disabled={!this.state.gpaConverter} style={{ marginRight: "10px", height: "3%" }} variant="danger" onClick={() => this.showYorkInfoModal()}>Import from York</Button>{' '}


            <Files key={this.state.inputKey} className="files-dropzone" onChange={file => { this.loadFile(file[0]) }} onError={err => this.loadFileError(err)} accepts={[".json"]} maxFileSize={500000} minFileSize={0} clickable>
              <Button data-tip data-for="jsonExample" variant="info">Import from JSON</Button>{' '}
              <ReactTooltip id="jsonExample" place="bottom" type="dark" effect="solid">
                <p>The format should be as follows: (this is an example)</p>
                <span style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(exampleJSON, null, 2)}</span> <br />
                <p><strong>Note: </strong> You can always put in grades manually in the table and click export to generate this! </p>
              </ReactTooltip>
            </Files>

            <Button style={{ marginLeft: "10px", height: "3%" }} variant="success" onClick={() => this.exportList()}>Export to JSON</Button>{' '} <br /> <br />

          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{ marginRight: "5px" }}>Grade Calculator</span>
            <Switch onChange={state => this.toggleView(state)} checkedIcon={false} uncheckedIcon={false} checked={this.state.gpaConverter} />
            <span style={{ marginLeft: "5px" }}>GPA Converter</span>
          </div>
          <br />
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
                  {this.state.gpaConverter &&
                    <td>
                      <Form.Control placeholder="Course Name (Optional)" value={_.Course} onChange={e => this.updateInput("Course", index, e.target.value)} />
                    </td>}
                  {this.state.gpaConverter ?
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
                    :
                    <td>
                      <Form.Control type="number" min="0" max="100" placeholder="Grade on a scale of 1-100" value={_.Grade} onChange={e => this.updateInput("Grade", index, e.target.value)} />
                    </td>
                  }
                  <td>
                    <Form.Control type="number" placeholder={this.state.gpaConverter ? "Credits. Eg. 3.00" : "Weight"} value={_.Credits} onChange={e => this.updateInput("Credits", index, e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <thead>
              {this.state.gpaConverter ?
                <tr>
                  {Array.from(this.state.columns).map((_, index) => (
                    <th key={index}>{_.table2}</th>
                  ))}
                </tr>
                :
                <tr>
                  <th>
                    Grade: {this.state.grde + '%'}
                  </th>
                  <th>
                    Letter Grade: {this.getletterGrade()}
                  </th>
                </tr>
              }
            </thead>
            <tbody>
              {this.state.gpaConverter &&
                <tr>
                  <td>
                    {this.state.gpa4}
                  </td>
                  <td>
                    {this.state.gpa9}
                  </td>
                  {this.state.gpaConverter &&
                    <td>
                      <Button variant="danger" onClick={() => this.clearAllFields()}>Clear All Fields</Button>{' '} <Button variant="primary" onClick={() => this.addItem()}>Add New Row</Button>{' '}
                    </td>}
                </tr>
              }
            </tbody>
            {!this.state.gpaConverter &&
              <thead>
                <tr>
                  <th>
                    Total Weight : {this.state.cred}%
                </th>
                  <th>
                    Max Achievable Grade: {(this.state.cred === "N/A" && this.state.grde === "N/A") || (this.state.cred === 0 || this.state.grde === 0) ? "N/A" : this.calculateMaxGrade() + " / " + this.getletterGrade(this.calculateMaxGrade())}
                  </th>
                </tr>
                <tr>
                  <th>
                    <Form.Label>Desired Grade</Form.Label>
                    <Form.Control as="select" placeholder="Course Name (Optional)" value={this.state.desiredGrade} onChange={e => this.setState({desiredGrade:e.target.value})}>
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
                      
                </th>
                  <th style={{verticalAlign: "middle"}}>
                   Need on Remainder: {(this.state.desiredGrade === "Choose Grade" || this.state.creds === "N/A" || this.state.grde === "N/A") ? "N/A" : this.calculateDesiredGrade() + " / " + this.getletterGrade(this.calculateDesiredGrade())}
                  </th>
                </tr>
              </thead>
              }
          </Table>
          {!this.state.gpaConverter &&
          <div>
            <Button style={{marginRight: "5px"}} variant="danger" onClick={() => this.clearAllFields()}>Clear All Fields</Button> 
            <Button variant="primary" onClick={() => this.addItem()}>Add New Row</Button>
          </div>
          } 
          <br />
        </div>
      </div>
    );
  }
}

export default App;
