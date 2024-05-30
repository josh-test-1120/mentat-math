async function fetchInstructorReport(corID) {
    try {
        console.log("FOOBAR");
        const url = new URL('http://localhost:8080/api/instructorReportString1');
        url.searchParams.append('corID', corID);

        const response = await fetch(url);

        // fetch plain text instead of JSON
        const text = await response.text();

        // split text into an array of words
        const words = text.trim().split(/\s+/);

        // slice each part of the text by 6 columns
        const tuples = [];
        for (let i = 0; i < words.length; i += 6) {
            tuples.push(words.slice(i, i + 6));
        }

        const tableBody = document.getElementById('instructorExamResultsTable').getElementsByTagName('tbody')[0];
        console.log(tuples);

        // clears the table before adding new rows
        tableBody.innerHTML = '';

        // Loop through each tuple and populate the table
        tuples.forEach(tuple => {
            let row = tableBody.insertRow();

            let cellFName = row.insertCell(0);
            cellFName.textContent = tuple[0];

            let cellLName = row.insertCell(1);
            cellLName.textContent = tuple[1];

            let cellExamName = row.insertCell(2);
            cellExamName.textContent = tuple[2];

            let cellDate = row.insertCell(3);
            cellDate.textContent = tuple[3];

            let cellVersion = row.insertCell(4);
            cellVersion.textContent = tuple[4];

            let cellScore = row.insertCell(5);
            cellScore.textContent = tuple[5];
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
    }
}


// Fetch the exams when the page loads
window.onload = fetchInstructorReport(1); // TODO Based on Course ID, Report will change.
