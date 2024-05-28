import Link from "next/link";
import Image from "next/image";

export default function StudentReport() {
    const img = "/ux-design.png";
    async function fetchExams() {
        try {
            const response = await fetch('http://localhost:8080/api/grades'); //tries to send GET request to specified API endpoint

            const data = await response.json(); //parse data as json and await response

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
            console.error('Error fetching exams:', error);
        }
    }
    //TELMEN's CODE
    async function fetchReport(SID) {
        try {
            console.log("BACKUP!");
            const url = new URL('http://localhost:8080/api/studentReportString1');
            url.searchParams.append('SID', SID);

            const response = await fetch(url);

            // fetch plain text instead of JSON
            const text = await response.text();

            // split text into an array of words
            const words = text.trim().split(/\s+/);

            // slice each part of the text by 4 columns
            const tuples = [];
            for (let i = 0; i < words.length; i += 4) {
                tuples.push(words.slice(i, i + 4));
            }

            const tableBody = document.getElementById('examResultsTable').getElementsByTagName('tbody')[0];
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


    // Fetch the exams when the page loads
    window.onload = function() {
        fetchExams();
        fetchReport(1);
    };
    return (
        <section
        >
            <div class="main">
                <h1>See Grades</h1>
                <table id="examResultsTable">
                    <thead>
                    <tr>
                        <th>Exam Taken Date</th>
                        <th>Exam Name</th>
                        <th>Exam Version</th>
                        <th>Exam Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    <!-- Rows will be added here dynamically -->
                    </tbody>
                </table>
                <p><i>Sorted in Descending order by exam date</i></p>

                <h1>See Tests</h1>
                <table id="testsTable">
                    <thead>
                    <tr>
                        <th>Exam Name</th>
                        <th>Exam Difficulty</th>
                        <th>Required Y/N</th>
                    </tr>
                    </thead>
                    <tbody>
                    <!-- Rows will be added here dynamically -->
                    </tbody>
                </table>
            </div>
        </section>
    );
}