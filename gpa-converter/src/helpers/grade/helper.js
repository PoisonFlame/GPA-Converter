const helpers = {
    getletterGrade: function (gr = null) {
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
    },
    calculateMaxGrade: function (list) {
        let creds = 0;
        let totalGrade = 0;

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
    },
    calculateDesiredGrade: function(desiredGrade) {
        let numberGrade = 0;
        if (desiredGrade === "A+") {
          numberGrade = 90;
        } else if (desiredGrade === "A") {
          numberGrade = 80;
        } else if (desiredGrade === "B+") {
          numberGrade = 75;
        } else if (desiredGrade === "B") {
          numberGrade = 70;
        } else if (desiredGrade === "C+") {
          numberGrade = 65;
        } else if (desiredGrade === "C") {
          numberGrade = 60;
        } else if (desiredGrade === "D+") {
          numberGrade = 55;
        } else if (desiredGrade === "D") {
          numberGrade = 50;
        } else if (desiredGrade === "E") {
          numberGrade = 40;
        } else if (desiredGrade === "F") {
          numberGrade = 39
        }
    
        return ((100 * numberGrade - parseFloat(this.state.grde) * parseFloat(this.state.cred)) / (100 - parseFloat(this.state.cred))).toFixed(2) + '%'
      }
}

export default helpers;