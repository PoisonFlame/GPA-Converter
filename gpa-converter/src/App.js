import React, { Component } from "react";
// @ts-ignore
import logo from './assets/images/logo.png';
import gpaScale from './assets/json/gpaScale.json';
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import YorkInfoModal from './components/modal/modal';

class App extends Component {
  constructor(props) {
    super(props);

    this.getGradeListFromYork = this.getGradeListFromYork.bind(this);

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

  getGradeListFromYork(list){
    this.setState({ list: list.reverse().filter(word => this.state.GPA4Scale[word.Grade] !== undefined) })
    this.updateInput(null, null, null);
  }

  render() {
    return (
      <div className="App">
        <br />
        <Image src={logo} alt="Logo" fluid />
        <div>
          <br />
          <p>
            Please choose your grade from the dropdown and input the number of credits. <br />
            The course name is optional and is not used in the calculation but may be used to organize while entering your grades. <br />
            Additionally, if you would like, you may import your grades straight from York University Grades website. <br />
            <b>Note:</b> This requires entering your York username and password to scrape the data from York's Grade website and as such is an optional step. <br />
            If you do end up using this option, please be assured that your username/password is not stored and the session to your york account is discarded after the information is scraped for display on here only.
          </p>
          <YorkInfoModal ref={this.yorkInfoModal} getGrades={this.getGradeListFromYork} show={false} onHide={() => this.yorkInfoModal.current.changeModalState(false)}animation />
          <Button variant="danger" block onClick={() => this.showYorkInfoModal()}>Import York Data</Button>{' '} <br />
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
