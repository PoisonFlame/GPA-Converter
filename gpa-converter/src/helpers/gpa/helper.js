import gpaScale from '../../assets/json/gpaScale.json';

const helpers = {
    generateBlankList: function () {
        let initList = [];
        for (let x = 0; x < 5; x++) {
            initList.push({
                Session: '',
                Course: '',
                Grade: '',
                Credits: ''
            })
        }
        return initList;
    },
    gpaDictionary: function (scale) {
        let init4GPA = {};
        let init9GPA = {};

        for (let i = 0; i < gpaScale.length; i++) {
            init4GPA[gpaScale[i]['letter']] = gpaScale[i]["StandardGPA"];
            init9GPA[gpaScale[i]['letter']] = gpaScale[i]["YorkGPA"];
        }
        if(scale === "4"){
            return init4GPA;
        }else if(scale === "9"){
            return init9GPA;
        }else{
            return {};
        }
    },
    getDefaultColumns: function () {
        return [{
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

export default helpers;