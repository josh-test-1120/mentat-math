'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ExamResult } from "@/components/types/exams";
import Course from "@/components/types/course";

type GradeRequirements = Record<'F' | 'D' | 'C' | 'B' | 'A', {
    total: number;
    required: number;
}>;

interface ExamAttempt extends ExamResult {
    attempts: number;
    bestScore?: string | null | undefined;
}

interface StudentProgressData {
    exams: ExamAttempt[];
    courses: Course[];
}

interface ExamProgressChartProps {
    // data: StudentProgressData;
    exams: ExamAttempt[];
    courses: Course[];
    studentName: string | undefined;
}

export default function ExamProgressChart({ exams, courses, studentName }: ExamProgressChartProps) {
    const svgRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const gradeThresholds = {
        C: 4,
        B: 6,
        A: 8,
    };

    // Handle resize to make chart responsive
    useEffect(() => {
        const handleResize = () => {
            if (svgRef.current) {
                const { clientWidth, clientHeight } = svgRef.current;
                setDimensions({
                    width: clientWidth,
                    height: clientHeight
                });
            }
        };

        // Initial measurement
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update effects for changes in exams, courses, or dimensions
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;
        console.log(courses);

        // Clear previous chart
        svgRef.current.innerHTML = '';

        // Reconcile course and exam data
        if (exams.length > 0 && courses.length > 0) {
            updateRecord();
        }

        // const chart = createVerticalGradeChart();
        const chart = createVerticalGradeChartCompactLegend();
        if (chart) {
            svgRef.current.appendChild(chart);
        }
    }, [exams, courses, dimensions]);

    const scoreToNumber = (score: string | undefined) => {
        if (!score) return 0;

        switch (score) {
            case 'A':
                return 5;
                break;
            case 'B':
                return 4;
                break;
            case 'C':
                return 3;
                break;
            case 'D':
                return 2;
                break;
            default:
                return 1;
        }
    }

    function updateRecord() {
        for (let record of exams) {
            record.attempts = exams.filter(exam => exam.exam_id === record.exam_id).length;
            console.log(`For exam: ${record.exam_name} there are ${record.attempts} attempts`);

            const highestExam = exams.reduce((highest: ExamAttempt, current: ExamAttempt) => {
                if (!highest) return current;
                const currentScore = scoreToNumber(current.exam_score);
                const highestScore = scoreToNumber(highest.exam_score);
                return currentScore > highestScore ? current : highest;
            }, exams[0]);

            record.bestScore = highestExam ? highestExam.exam_score?.toString() : null;
            console.log(`For exam: ${record.exam_name} the best score is: ${record.bestScore}`);
        }

    }

    const createVerticalGradeChart = () => {
        const { width, height } = dimensions;

        if (width === 0 || height === 0) return null;

        // Margins optimized for vertical layout with legend
        const margin = { top: 50, right: 120, bottom: 60, left: 60 };
        const chartWidth = Math.max(0, width - margin.left - margin.right);
        const chartHeight = Math.max(0, height - margin.top - margin.bottom);

        const svg = d3.create("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)

        // Force text color fill override
        svg.append('style')
            .text(`
                text {
                    fill: #dab05a !important;
                }
            `);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Grade color mapping
        const gradeColors = {
            'F': '#ef4444', // red
            'D': '#f97316', // orange
            'C': '#eab308', // yellow
            'B': '#3b82f6', // blue
            'A': '#10b981'  // green
        };

        // Grade requirements (example - you'll replace this with your actual data)
        const gradeRequirements: GradeRequirements = {
            'F': { total: 0, required: 0 },
            'D': { total: 4, required: 2 },
            'C': { total: 8, required: 6 },
            'B': { total: 12, required: 9 },
            'A': { total: 18, required: 15 }
        };

        // Calculate current grade based on passed exams
        const passedExams = exams.filter(exam =>
            exam.status === 'passed' && exam.exam_score === 'A').length;
        const currentGrade = calculateCurrentGrade(passedExams, gradeRequirements);

        // Scales
        const xScale = d3.scaleBand()
            .domain(['F', 'D', 'C', 'B', 'A'])
            .range([0, chartWidth])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, 18]) // Max 18 exams
            .range([chartHeight, 0]);

        // Add grid lines
        const yAxisGrid = d3.axisLeft(yScale)
            .tickSize(-chartWidth)
            .tickFormat("")
            .ticks(6);

        chartGroup.append("g")
            .attr("class", "grid")
            .call(yAxisGrid)
            .attr("opacity", 0.2);

        // Draw grade level bars
        ['F', 'D', 'C', 'B', 'A'].forEach(gradeRef => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeRequirements[grade];
            const barGroup = chartGroup.append('g');

            // Background bar (full requirement)
            barGroup.append('rect')
                .attr('x', xScale(grade))
                .attr('y', yScale(requirements.total))
                .attr('width', xScale.bandwidth())
                .attr('height', chartHeight - yScale(requirements.total))
                .attr('fill', gradeColors[grade])
                .attr('opacity', 0.2)
                .attr('rx', 3)
                .attr('ry', 3);

            // Required threshold line
            barGroup.append('line')
                .attr('x1', xScale(grade))
                .attr('x2', xScale(grade) + xScale.bandwidth())
                .attr('y1', yScale(requirements.required))
                .attr('y2', yScale(requirements.required))
                .attr('stroke', gradeColors[grade])
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '3,2');

            const previousGrade = grade.toString() === 'F'
                ? 'F'
                : getPreviousGrade(grade.toString()) as keyof typeof gradeRequirements;

            if (gradeRequirements[grade.toString() === 'F' ? 'F' : 'C'])

            // Current progress (if applicable for this grade level)
            if (passedExams <= requirements.total && passedExams >= (
                gradeRequirements[previousGrade]?.total || 0
            )) {
                barGroup.append('rect')
                    .attr('x', xScale(grade))
                    .attr('y', yScale(passedExams))
                    .attr('width', xScale.bandwidth())
                    .attr('height', chartHeight - yScale(passedExams))
                    .attr('fill', gradeColors[grade])
                    .attr('opacity', 0.8)
                    .attr('rx', 3)
                    .attr('ry', 3);
            }

            // Grade label
            barGroup.append('text')
                .attr('x', xScale(grade) + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 25)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', gradeColors[grade])
                .text(grade);

            // Requirements label
            barGroup.append('text')
                .attr('x', xScale(grade) + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 45)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                // .attr('fill', '#6b7280')
                .text(`${requirements.required}/${requirements.total}`);
        });

        // Current progress line
        chartGroup.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(passedExams))
            .attr('y2', yScale(passedExams))
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');

        // Current progress label
        chartGroup.append('text')
            .attr('x', chartWidth + 5)
            .attr('y', yScale(passedExams))
            .attr('text-anchor', 'start')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            // .attr('fill', '#374151')
            .text(`${passedExams} passed`);

        // Y-axis (Number of Exams)
        const yAxis = d3.axisLeft(yScale);
        chartGroup.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -45)
            .attr('x', -chartHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            // .attr('fill', '#374151')
            .text('Number of Exams Passed');

        // Chart title with current grade
        chartGroup.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            // .attr('fill', '#374151')
            .text(`Exam Progress - Current Grade: ${currentGrade}`);

        // Legend (integrated into chart space)
        const legend = chartGroup.append('g')
            .attr('transform', `translate(${chartWidth + 10}, 0)`);

        // Legend title
        legend.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            // .attr('fill', '#374151')
            .text('Grade Requirements:');

        // Legend items
        Object.entries(gradeColors).forEach(([gradeRef, color], index) => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeRequirements[grade];
            const yPos = 20 + (index * 45);

            // Color swatch
            legend.append('rect')
                .attr('x', 0)
                .attr('y', yPos)
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', color)
                .attr('rx', 2);

            // Grade label
            legend.append('text')
                .attr('x', 20)
                .attr('y', yPos + 10)
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                // .attr('fill', '#374151')
                .text(`Grade ${grade}`);

            // Requirements
            legend.append('text')
                .attr('x', 20)
                .attr('y', yPos + 24)
                .attr('font-size', '10px')
                // .attr('fill', '#6b7280')
                .text(`${requirements.required} of ${requirements.total} required`);
        });

        // Helper functions
        function calculateCurrentGrade(passed: number, requirements: GradeRequirements) {
            if (passed >= requirements.A.required) return 'A';
            if (passed >= requirements.B.required) return 'B';
            if (passed >= requirements.C.required) return 'C';
            if (passed >= requirements.D.required) return 'D';
            return 'F';
        }

        function getPreviousGrade(grade: string) {
            const grades = ['F', 'D', 'C', 'B', 'A'];
            const index = grades.indexOf(grade);
            return index > 0 ? grades[index - 1] : 'F';
        }

        return svg.node();
    };

    const createVerticalGradeChartCompactLegend = () => {
        const { width, height } = dimensions;

        if (width === 0 || height === 0) return null;

        // Reduced margins since legend will overlay the chart
        const margin = { top: 50, right: 60, bottom: 60, left: 60 };
        const chartWidth = Math.max(0, width - margin.left - margin.right);
        const chartHeight = Math.max(0, height - margin.top - margin.bottom);

        const svg = d3.create("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)

        // Force text color fill override
        svg.append('style')
            .text(`
                text {
                    fill: #dab05a !important;
                }
                .legend text {
                    fill: #A30F32 !important;
                }
            `);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Grade color mapping
        const gradeColors = {
            'F': '#ef4444', // red
            'D': '#f97316', // orange
            'C': '#eab308', // yellow
            'B': '#3b82f6', // blue
            'A': '#10b981'  // green
        };

        // Grade requirements
        const gradeRequirements: GradeRequirements = {
            'F': { total: 0, required: 0 },
            'D': { total: 4, required: 2 },
            'C': { total: 8, required: 6 },
            'B': { total: 12, required: 9 },
            'A': { total: 18, required: 15 }
        };

        // Calculate current grade based on passed exams
        const passedExams = exams.filter(exam =>
            exam.status === 'passed' && exam.exam_score === 'A').length;
        const currentGrade = calculateCurrentGrade(passedExams, gradeRequirements);

        // Scales
        const xScale = d3.scaleBand()
            .domain(['F', 'D', 'C', 'B', 'A'])
            .range([0, chartWidth])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, 18]) // Max 18 exams
            .range([chartHeight, 0]);

        // Add grid lines
        const yAxisGrid = d3.axisLeft(yScale)
            .tickSize(-chartWidth)
            .tickFormat("")
            .ticks(6);

        chartGroup.append("g")
            .attr("class", "grid")
            .call(yAxisGrid)
            .attr("opacity", 0.2);

        // Draw grade level bars FIRST (so legend can overlay)
        ['F', 'D', 'C', 'B', 'A'].forEach(gradeRef => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeRequirements[grade];
            const barGroup = chartGroup.append('g');

            // Background bar (full requirement)
            barGroup.append('rect')
                .attr('x', xScale(grade))
                .attr('y', yScale(requirements.total))
                .attr('width', xScale.bandwidth())
                .attr('height', chartHeight - yScale(requirements.total))
                .attr('fill', gradeColors[grade])
                .attr('opacity', 0.2)
                .attr('rx', 3)
                .attr('ry', 3);

            // Required threshold line
            barGroup.append('line')
                .attr('x1', xScale(grade))
                .attr('x2', xScale(grade) + xScale.bandwidth())
                .attr('y1', yScale(requirements.required))
                .attr('y2', yScale(requirements.required))
                .attr('stroke', gradeColors[grade])
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '3,2');

            const previousGrade = grade.toString() === 'F'
                ? 'F'
                : getPreviousGrade(grade.toString()) as keyof typeof gradeRequirements;

            // Current progress (if applicable for this grade level)
            if (passedExams <= requirements.total && passedExams >= (
                gradeRequirements[previousGrade]?.total || 0
            )) {
                barGroup.append('rect')
                    .attr('x', xScale(grade))
                    .attr('y', yScale(passedExams))
                    .attr('width', xScale.bandwidth())
                    .attr('height', chartHeight - yScale(passedExams))
                    .attr('fill', gradeColors[grade])
                    .attr('opacity', 0.8)
                    .attr('rx', 3)
                    .attr('ry', 3);
            }

            // Grade label
            barGroup.append('text')
                .attr('x', xScale(grade) + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 25)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', gradeColors[grade])
                .text(grade);

            // Requirements label
            barGroup.append('text')
                .attr('x', xScale(grade) + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 45)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .text(`${requirements.required}/${requirements.total}`);
        });

        // Current progress line
        chartGroup.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(passedExams))
            .attr('y2', yScale(passedExams))
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');

        // Current progress label
        chartGroup.append('text')
            .attr('x', chartWidth + 5)
            .attr('y', yScale(passedExams))
            .attr('text-anchor', 'start')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text(`${passedExams} passed`);

        // Y-axis (Number of Exams)
        const yAxis = d3.axisLeft(yScale);
        chartGroup.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -45)
            .attr('x', -chartHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Number of Exams Passed');

        // Chart title with current grade
        chartGroup.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(`Exam Progress - Current Grade: ${currentGrade}`);

        // LEGEND - Positioned on top in upper-left corner (over the F/D/C bars area)
        const legend = chartGroup.append('g')
            .attr("transform", `translate(5, 0)`); // Upper-left inside chart area

        // Legend background for better readability
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 120)
            .attr('height', 115)
            .attr('fill', 'white')
            .attr('opacity', 0.05)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('stroke', '#dab05a')
            .attr('stroke-width', 1);

        // Legend title
        legend.append('text')
            .attr('x', 60)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('fill', '#A30F32 !important')
            .style('fill', '#A30F32 !important') // Force with !important
            .text('Grade Requirements');


        // Compact legend items
        Object.entries(gradeColors).forEach(([gradeRef, color], index) => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeRequirements[grade];
            const yPos = 25 + (index * 18); // Tight spacing

            // Color swatch
            legend.append('rect')
                .attr('x', 8)
                .attr('y', yPos)
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', color)
                .attr('rx', 2);

            // Grade label and requirements in one line
            legend.append('text')
                .attr('x', 22)
                .attr('y', yPos + 8)
                .attr('font-size', '9px')
                .attr('fill', '#A30F32')
                .text(`${grade}: ${requirements.required}/${requirements.total}`);
        });

        // Helper functions
        function calculateCurrentGrade(passed: number, requirements: GradeRequirements) {
            if (passed >= requirements.A.required) return 'A';
            if (passed >= requirements.B.required) return 'B';
            if (passed >= requirements.C.required) return 'C';
            if (passed >= requirements.D.required) return 'D';
            return 'F';
        }

        function getPreviousGrade(grade: string) {
            const grades = ['F', 'D', 'C', 'B', 'A'];
            const index = grades.indexOf(grade);
            return index > 0 ? grades[index - 1] : 'F';
        }

        return svg.node();
    };

    return (
        <div className="rounded-lg shadow-sm border w-full h-full min-h-[300px] flex flex-col">
            <div
                ref={svgRef}
                className="w-full flex-1 relative rounded-lg overflow-hidden text-mentat-gold"  // flex-1 takes all available space
            >
                <svg
                    preserveAspectRatio="xMidYMax meet"  // Align content to bottom
                    width="100%"
                    height="100%"
                    style={{
                        display: 'block',
                        position: 'absolute',
                        // bottom: 0  // Force alignment to bottom
                    }}
                />
                {/*</svg>*/}
            </div>
        </div>
    );
}