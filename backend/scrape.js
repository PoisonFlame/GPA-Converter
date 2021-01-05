const puppeteer = require('puppeteer');
const express = require('express');
const app = express()
const port = 8888;
app.listen(port, () => console.log('Server alive on port ' + port))

const gpaScale = require('./gpaScale.json');

app.use(express.json());
app.use(express.urlencoded());

app.post('/getGrades', async (req, res, next) => {
    let listOfCourses = [];
    let GPACreditsTotal = 0;
    let GPANineScaleTotal = 0;
    let GPAFourScaleTotal = 0;

    try {
        if (req.body.user === "" || req.body.pass === "") {
            res.status(500).send({
                Error: "User and pass cannot be empty."
            })
            return
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({
            Error: "Please specify user and pass."
        })
        return
    }

    function calculateGPA(letter, credits) {
        for (let i = 0; i < gpaScale.length; i++) {
            if (gpaScale[i]["letter"] === letter) {
                GPANineScaleTotal += (gpaScale[i]["YorkGPA"]) * parseInt(credits);
                GPAFourScaleTotal += (gpaScale[i]["StandardGPA"]) * parseInt(credits);
            }
        }
        if (letter != "" && letter != "in progress")
            GPACreditsTotal += parseInt(credits);
    }



    const browser = await puppeteer.launch({
        headless: true, args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://wrem.sis.yorku.ca/Apps/WebObjects/ydml.woa/wa/DirectAction/document?name=CourseListv1');
    await page.type('#mli', req.body.user, {
        delay: 30
    });
    await page.type('#password', req.body.pass, {
        delay: 30
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);


    // await page.goto('file:///D:/DEV/GPACalc/backend/test.html');

    

    try {

        const data = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('table[class="bodytext"] > tbody > tr'))
            // @ts-ignore
            return tds.map(td => td.innerText.split('\t'));
        });

        data.slice(1).forEach(function (el) {
            // Calculate Credits
            let cr = el[1].substr(el[1].length - 6).split(" ")[0].trim();
            // Push Courses to List of Courses Array
            listOfCourses.push({
                Session: el[0].trim(),
                Course: el[1].trim(),
                Title: el[2].trim(),
                Grade: el[3].trim(),
                Credits: cr,
            })
            // Calculate GPA
            calculateGPA(el[3].trim(), cr)
        });

        let calculations = {
            totalCredits: GPACreditsTotal,
            YorkTotalGradePoints: GPANineScaleTotal.toFixed(2),
            StandardTotalGradePoints: GPAFourScaleTotal.toFixed(2),
            YorkGPA: (GPANineScaleTotal / GPACreditsTotal).toFixed(2),
            StandardGPA: (GPAFourScaleTotal / GPACreditsTotal).toFixed(2)
        }

        if (listOfCourses.length === 0) {
            res.status(500).send({
                Error: "Failed to get grades. Login/Password Incorrect."
            })
            return;
        }

        res.status(201).send({
            gradeList: listOfCourses,
            calculations: calculations
        })
    } catch (e) {
        res.status(500).send({
            Error: "Failed to get grades data."
        })
    }
    await browser.close();
});

app.use((req,res,next) => {
    res.status(404).send({Error: 'Page not found.'})
})