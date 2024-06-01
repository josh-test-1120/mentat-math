import {apiHandler} from "../../utils/api";
import {toast} from "react-toastify";

async function fetchExams() {
    try {
        //const response = await fetch('http://localhost:8080/api/grades'); //tries to send GET request to specified API endpoint
        try {
            const response = await apiHandler({},'GET',
                'api/grades/',
                `${BACKEND_API}`
            );
            console.log('api call done');
            console.log(response);
            if (!response.message.includes('success')) throw Error(response.message);
            const data = await response.message; //parse data as json and await response\
            console.log("This is the data");
            console.log(data);

            const tableBody = document.getElementById('testsTable').getElementsByTagName('tbody')[0];


            //loops through each exam item
            data.forEach(exam => {
                let row = tableBody.insertRow();

                let cellName = row.insertCell(0);
                cellName.textContent = exam.exam_name;

                let cellDifficulty = row.insertCell(1);
                cellDifficulty.textContent = exam.exam_difficulty;

                let cellRequired = row.insertCell(2);
                cellRequired.textContent = exam.is_required ? 'Yes' : 'No';
            });

        } catch (error) {
            console.error('Error fetching exams:', error.toString());
        }

    }
    catch (error) {
        toast.error("Failed to create exams");
    }


}
//TELMEN's CODE
async function fetchReport(SID) {
    try {
        console.log("BACKUP!");
        //const response = await fetch('http://localhost:8080/api/studentReportString1');

        const url = new URL('http://localhost:8080/api/studentReportString1');
        url.searchParams.append('SID', SID);

        // const response = await fetch(url);
        console.log(url.toString());
        const response = await apiHandler({'id':SID},'GET',
            url.toString(),
            ``
        );
        console.log("This is the response from exam student");
        console.log(response);
        // fetch plain text instead of JSON
        var words = Object.keys(response).map((key) => [key, response[key]]);
        console.log(words);

        // split text into an array of words
        //const words = text.trim().split(/\s+/);

        // slice each part of the text by 4 columns
        const tuples = [];
        for (let i = 0; i < words.length; i += 4) {
            tuples.push(words.slice(i, i + 4));
        }

        console.log(testTable);
        const tableBody= document.getElementById('examResultsTable').getElementsByTagName('tbody')[0];
        console.log(tuples);

        // clears the table before adding new rows
        tableBody.innerHTML = '';

        // Loop through each tuple and populate the table
        tuples.forEach(tuple => {
            let row = tableBody.insertRow();

            let cellDate = row.insertCell(0);
            cellDate.textContent = tuple[0];

            let cellName = row.insertCell(1);
            cellName.textContent = tuple[1];

            let cellVersion = row.insertCell(2);
            cellVersion.textContent = tuple[2];

            let cellScore = row.insertCell(3);
            cellScore.textContent = tuple[3];
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
    }
}

function windowOnload() {
    // Fetch the exams when the page loads
    //fetchExams();

    fetchReport(1);
}