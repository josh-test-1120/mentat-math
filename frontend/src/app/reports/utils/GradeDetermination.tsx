/**
 * This utility will make a grade determination for
 * the student based on their grades and the course
 * grading strategy
 * @author Joshua Summers
 */

import { GradeRequirements, ExamAttempt} from "../types/shared";

// Convert letter grade to number
export const scoreToNumber = (score: string | undefined) => {
    // Default for no score or pending score
    if (!score) return 0;
    // Case handler
    switch (score) {
        case 'A': return 5;
        case 'B': return 4;
        case 'C': return 3;
        case 'D': return 2;
        default: return 1;
    }
}

// Determine and assign the best grade for an exam
export const updateRecord = (grades: ExamAttempt[]) => {
    // Iterate through the grades
    for (let record of grades) {
        // Set the attempts property
        record.attempts = grades.filter(exam => exam.exam_id === record.exam_id).length;
        // console.log(`For exam: ${record.exam_name} there are ${record.attempts} attempts`);

        const records = grades.filter(exam => exam.exam_id === record.exam_id);
        const highestExam = records.reduce((highest: ExamAttempt, current: ExamAttempt) => {
            if (!highest) return current;
            // console.log(`This is highest: ${highest.exam_score}, and this is current: ${current.exam_score}`);
            const currentScore = scoreToNumber(current.exam_score);
            const highestScore = scoreToNumber(highest.exam_score);
            // console.log(`This is the highest score: ${highestScore}` +
            //     `, and current: ${currentScore}`);
            return currentScore > highestScore ? current : highest;
        }, records[0]);
        // Set the best score property
        record.bestScore = highestExam ? highestExam.exam_score?.toString() : null;
        // console.log(`For exam: ${record.exam_name} the best score is: ${record.bestScore}`);
    }
}

// Reduce the records to the best exams only
export const reduceRecords = (grades: ExamAttempt[]) => {
    // Reduce the duplicate exams to the highest score only
    let records: ExamAttempt[] = grades.filter(exam =>
        exam.exam_score === exam.bestScore);
    // Set the best exams state
    return records;
}

// Current Grade Determination Utility
export default function GradeDetermination(grades: ExamAttempt[],
                                           strategies?: GradeRequirements) {
    /**
     * Main part of function code
     */
    // First let's convert the
    updateRecord(grades);
    // Reduce exams to best grades
    let bestGrades: ExamAttempt[] = reduceRecords(grades);
    // Determine passed exams
    let passed = bestGrades.filter(exam =>
        exam.status === 'passed').length;
    let passedAs = bestGrades.filter(exam =>
        exam?.exam_score === 'A').length;

    // Determine letter grade
    // Handle determination if strategies are supplied
    if (strategies) {
        if (passed >= strategies.A.total && passedAs >= strategies.A.requiredA) return 'A';
        else if (passed >= strategies.B.total && passedAs >= strategies.B.requiredA) return 'B';
        else if (passed >= strategies.C.total && passedAs >= strategies.C.requiredA) return 'C';
        else if (passed >= strategies.D.total && passedAs >= strategies.D.requiredA) return 'D';
        else return 'F';
    }
    // Default determination based on raw average
    else {
        let count = 0;
        bestGrades.forEach((grade) => {
            count += scoreToNumber(grade.exam_score)
        })
        let gradeNumber = Math.floor(count / bestGrades.length);
        if (gradeNumber === 5) return 'A';
        else if (gradeNumber === 4) return 'B';
        else if (gradeNumber === 3) return 'C';
        else if (gradeNumber === 2) return 'D';
        else return 'F';
    }
}