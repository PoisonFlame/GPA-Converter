import Validator from 'jsonschema';

const helpers = {
    validateJSON: function (result) {
        const schema = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "Session": {
                        "type": "string"
                    },
                    "Course": {
                        "type": "string"
                    },
                    "Grade": {
                        "type": "string",
                        "required": true
                    },
                    "Credits": {
                        "type": "string",
                        "required": true
                    }
                }
            }
        };
        let v = new Validator.Validator();
        let res = v.validate(JSON.parse(result.toString()), schema)
        return res;
    },
    getNewItem: function (state) {
        let newItem = {
            Session: '',
            Course: '',
            Grade: '',
            Credits: ''
        };
        if (!state) {
            // @ts-ignore
            newItem = {
                Grade: '',
                Credits: ''
            };
        }
        return newItem;
    },
    formatDate: function () {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    },
    download: function (content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {
            type: contentType
        });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    },
    getColumns: function (state) {
        if (state) {
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
            ];
        }
        return [{
                dataField: 'Grade %',
                table2: 'Grade in Percentage'
            },
            {
                dataField: 'Weight',
                table2: 'Letter Grade'
            }
        ]
    }
}

export default helpers;