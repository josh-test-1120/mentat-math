/**
 * This component will render an SVG chart of the student progress.
 * Due to the SVG rendering process, and data updates while processing
 * I had to split the useAffects very carefully to ensure
 * that proper re-rendering was happening to the entire SVG
 * when the gradeStrategy is ready
 * @author Joshua Summers
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ExamResult } from "@/components/types/exams";
import Course from "@/components/types/course";
import { GradeRequirements, GradeStrategy, CourseStrategy, ExamAttempt} from "../types/shared";
import { emptyStrategy } from "../types/defaults";

/**
 * Define some types and interfaces for the chart
 */
interface ProgressChartProps {
    exams: ExamAttempt[];
    course: Course;
}

export default function ProgressChart({ exams, course }: ProgressChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [bestExams, setBestExams] = useState<ExamAttempt[]>([]);
    const [ready, setReady] = useState<Boolean>(false);

    // Grade Strategy
    const [gradeStrategy, setGradeStrategy] = useState<GradeRequirements>(emptyStrategy);

    // In your useEffect
    useEffect(() => {
        if (!ready || !containerRef.current) return;

        const handleResize = () => {
            const { clientWidth, clientHeight } = containerRef.current!;

            if (clientWidth > 0 && clientHeight > 0) {
                setDimensions({
                    width: clientWidth,
                    height: clientHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);

        // Initial measurement with retry logic
        const timer = setTimeout(handleResize, 10);

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [ready]);

    // Split the useEffects to ensure proper handling of change rendering
    useEffect(() => {
        if (exams.length > 0 && course) {
            console.log('Processing data...');
            updateRecord();
            reduceRecords();
            populateGradeStrategy();
        }
    }, [exams, course]);

    // UseAffect bound to resize and update of SVG (loading data or processing data)
    useEffect(() => {
        if (!svgRef.current) return;

        svgRef.current.innerHTML = '';

        const chart = createVerticalGradeChartCompactLegend();
        if (chart) {
            svgRef.current.appendChild(chart);
        }
    }, [dimensions, gradeStrategy]);

    // Needed to confirm equality on maps
    const deepEqual = (obj1: GradeRequirements, obj2: GradeRequirements) => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

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

    // Determine and assign the best grade for an exam
    const updateRecord = () => {
        for (let record of exams) {
            record.attempts = exams.filter(exam => exam.exam_id === record.exam_id).length;
            console.log(`For exam: ${record.exam_name} there are ${record.attempts} attempts`);

            const records = exams.filter(exam => exam.exam_id === record.exam_id);
            const highestExam = records.reduce((highest: ExamAttempt, current: ExamAttempt) => {
                if (!highest) return current;
                console.log(`This is highest: ${highest.exam_score}, and this is current: ${current.exam_score}`);
                const currentScore = scoreToNumber(current.exam_score);
                const highestScore = scoreToNumber(highest.exam_score);
                console.log(`This is the highest score: ${highestScore}` +
                    `, and current: ${currentScore}`);
                return currentScore > highestScore ? current : highest;
            }, records[0]);

            record.bestScore = highestExam ? highestExam.exam_score?.toString() : null;
            console.log(`For exam: ${record.exam_name} the best score is: ${record.bestScore}`);
        }

    }

    // Reduce the records to the best exams only
    const reduceRecords = () => {
        // Reduce the duplicate exams to the highest score only
        let records: ExamAttempt[] = exams.filter(exam =>
            {return exam.exam_score === exam.bestScore});
        // Set the best exams state
        setBestExams(records)
    }

    // Load the specific grade strategy details
    const loadGradeStrategy = (strategy: GradeStrategy) => {
        // Define the grade letter strategy
        let newStrategy: GradeStrategy = {
            total: strategy?.total || 0,
            requiredA: strategy?.requiredA || 0,
            optional: strategy?.optional || [],
            allOptional: strategy?.allOptional || false
        }
        // Return the new Grade Strategy
        return newStrategy;
    }

    // Populate the course grade strategy
    const populateGradeStrategy = () => {
        console.log('These are the courses sent to chart:');
        console.log(course);

        // Reset to empty strategy first
        setGradeStrategy(emptyStrategy);

        if (course?.gradeStrategy) {
            try {
                let courseStrategy: CourseStrategy = JSON.parse(course.gradeStrategy);
                console.log('Course Strategy JSON Decode');
                console.log(courseStrategy);

                // Load strategy details
                let newStrategy: GradeRequirements = {
                    A : loadGradeStrategy(courseStrategy.GradeA),
                    B : loadGradeStrategy(courseStrategy.GradeB),
                    C : loadGradeStrategy(courseStrategy.GradeC),
                    D : loadGradeStrategy(courseStrategy.GradeD),
                    F : loadGradeStrategy(courseStrategy.GradeF)
                };

                console.log('New strategy:', newStrategy);
                setGradeStrategy(newStrategy);
            } catch (error) {
                console.error('Error parsing grade strategy:', error);
                // Keep empty strategy but still set ready
            }
        } else {
            console.log('No grade strategy found in course');
        }

        console.log('Setting ready to true');
        setReady(true);
    }

    const createVerticalGradeChartCompactLegend = () => {
        // Dimensions
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

        // Move it to the upper left of margins for proper display in div
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

        // Calculate current grade based on passed total exams and total As
        const passedExams = bestExams.filter(exam =>
            exam.status === 'passed').length;
        const passedAExams = bestExams.filter(exam =>
            exam.status === 'passed' && exam.exam_score === 'A').length;
        // const currentGrade = calculateCurrentGrade(passedExams, gradeRequirements);
        const currentGrade = calculateCurrentGrade(passedExams,
            passedAExams, gradeStrategy);

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
            .tickFormat(null)
            .ticks(6);

        chartGroup.append("g")
            .attr("class", "grid")
            .call(yAxisGrid)
            .attr("opacity", 0.2);

        // Draw grade level bars FIRST (so legend can overlay)
        // Typescript types felt certain grade would be undefined
        // I ensured it that it will never be with the '!' call
        ['F', 'D', 'C', 'B', 'A'].forEach(gradeRef => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeStrategy[grade];
            const barGroup = chartGroup.append('g');

            // Background bar (full requirement)
            barGroup.append('rect')
                .attr('x', xScale(grade)!)
                .attr('y', yScale(requirements.total))
                .attr('width', xScale.bandwidth())
                .attr('height', chartHeight - yScale(requirements.total))
                .attr('fill', gradeColors[grade])
                .attr('opacity', 0.2)
                .attr('rx', 3)
                .attr('ry', 3);

            // Required threshold line
            barGroup.append('line')
                .attr('x1', xScale(grade)!)
                .attr('x2', xScale(grade)! + xScale.bandwidth())
                .attr('y1', yScale(requirements.requiredA))
                .attr('y2', yScale(requirements.requiredA))
                .attr('stroke', gradeColors[grade])
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '3,2');

            const previousGrade = grade.toString() === 'F'
                ? 'F'
                : getPreviousGrade(grade.toString()) as keyof GradeRequirements;

            // Current progress (if applicable for this grade level)
            if (passedExams <= requirements.total
                && passedAExams <= requirements.requiredA
                && passedExams >= (
                gradeStrategy[previousGrade]?.total || 0
            )) {
                barGroup.append('rect')
                    .attr('x', xScale(grade)!)
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
                .attr('x', xScale(grade)! + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 25)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', gradeColors[grade])
                .text(grade);

            // Requirements label
            barGroup.append('text')
                .attr('x', xScale(grade)! + xScale.bandwidth() / 2)
                .attr('y', chartHeight + 45)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .text(`${requirements.requiredA}/${requirements.total}`);
        });

        // Current progress line
        chartGroup.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(passedExams))
            .attr('y2', yScale(passedExams))
            .attr('stroke', '#dab05a')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');

        // Current progress label
        chartGroup.append('text')
            .attr('x', chartWidth + 5)
            .attr('y', yScale(passedExams))
            .attr('text-anchor', 'start')
            .attr('font-size', '10px')
            .attr('font-style', 'italic')
            .text(`${passedExams} passed`);

        // Y-axis (Number of Exams)
        const yAxis = d3.axisLeft(yScale);
        chartGroup.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -30)
            .attr('x', -chartHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('font-style', 'italic')
            .text('Exams Passed');

        // Chart title with current grade
        chartGroup.append('text')
            .attr('x', (chartWidth / 2) + 85)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('font-style', 'italic')
            .text(`Current Grade: ${currentGrade}`);

        // LEGEND - Positioned on top in upper-left corner (over the F/D/C bars area)
        const legend = chartGroup.append('g')
            .attr("transform", `translate(5, 0)`); // Upper-left inside chart area

        // Legend background for better readability
        legend.append('rect')
            .attr('x', 0)
            .attr('y', -40)
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
            .attr('y', -25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('fill', '#A30F32 !important')
            .style('fill', '#A30F32 !important') // Force with !important
            .text('Grade Requirements');

        // Compact legend items
        Object.entries(gradeColors).forEach(([gradeRef, color], index) => {
            const grade = gradeRef as keyof GradeRequirements;
            const requirements = gradeStrategy[grade];
            const yPos = -15 + (index * 18); // Tight spacing

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
                .text(`${grade}: ${requirements.requiredA}/${requirements.total}`);
        });

        // Helper functions
        function calculateCurrentGrade(passed: number, passedAs: number,
                                       requirements: GradeRequirements) {
            if (passed >= requirements.A.total && passedAs >= requirements.A.requiredA) return 'A';
            if (passed >= requirements.B.total && passedAs >= requirements.B.requiredA) return 'B';
            if (passed >= requirements.C.total && passedAs >= requirements.C.requiredA) return 'C';
            if (passed >= requirements.D.total && passedAs >= requirements.D.requiredA) return 'D';
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
        <div className="bg-card-color rounded-lg border w-full h-full min-h-[300px] flex flex-col shadow-md shadow-crimson-700">
            <div
                ref={containerRef}
                className="w-full flex flex-1 relative rounded-lg overflow-hidden text-mentat-gold"
            >
                {exams.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        No exams for this course
                    </div>
                ) : !course ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        No courses for this student
                    </div>
                ) : !ready ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        Generating...
                    </div>
                ) : (deepEqual(gradeStrategy, emptyStrategy) && ready) ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        Course has no grade strategy
                    </div>
                ) : (
                    <svg
                        ref={svgRef}
                        preserveAspectRatio="xMidYMax meet"
                        width="100%"
                        height="100%"
                        style={{
                            display: 'block',
                            position: 'absolute',
                        }}
                    />
                )}
            </div>
        </div>
    );
}