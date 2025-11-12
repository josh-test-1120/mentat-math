'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { StudentExams } from "../types/shared";
import Course from "@/components/types/course";
import ToolTip from "@/app/reports/localComponents/ToolTip";
import { numberToLetterGrade, scoreToNumber } from "@/app/reports/utils/GradeDetermination";

interface InstructorStatisticsChartProps {
    students: StudentExams[] | undefined;
    course: Course | undefined;
}

/**
 * This is the instructor statistics chart
 * that will render an SVG of a pie
 * chart that will show the exam
 * statistics according to all students in the course
 * @author Joshua Summers
 * @param students This is an array of StudentExams
 * @param course This is the course
 * @constructor
 */
export default function InstructorStatisticsChart({ students, course }: InstructorStatisticsChartProps) {
    // These are the layout references
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    // These are the layout states
    const [allScores, setAllScores] = useState<string[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [statistics, setStatistics] = useState({
        averageScore: 0,
        passingPercentage: 0,
        failingPercentage: 0,
        highAchievers: 0,
        medianScore: 0,
        averageScoreLetter: 'F',
        medianScoreLetter: 'F'
    });

    // Colors
    const mentatGold = 'rgba(218, 176, 90)';
    const mentatGold70 = 'rgba(218, 176, 90, .7)';
    // Colors for the various bars
    const statisticColors = {
        averageScore: '#3b82f6', // Blue
        passingPercentage: '#10b981', // Green
        failingPercentage: '#ef4444', // Red
        highAchievers: '#8b5cf6', // Purple
        medianScore: '#f59e0b' // Amber
    };

    // Calculate statistics from student data
    useEffect(() => {
        if (!students || students.length === 0) return;

        const scores = students.flatMap(student =>
            student.exams
                ? student.exams
                    .map(exam => exam?.examScore)
                    .filter((score): score is string => score != null)
                : []
        );

        setAllScores(scores);

        if (scores.length === 0) return;

        // Calculate average as number first, then convert to letter
        const averageScoreNumber = scores.reduce((sum, score) =>
            sum + scoreToNumber(score), 0) / scores.length;
        const averageScoreLetter = numberToLetterGrade(averageScoreNumber);

        // Calculate passing/failing (assuming passing is C or better, which is score >= 3)
        const passingCount = scores.filter(score => scoreToNumber(score) >= 3).length;
        const passingPercentage = (passingCount / scores.length) * 100;
        const failingPercentage = 100 - passingPercentage;

        // High achievers (A's - score of 5)
        const highAchieversCount = scores.filter(score => scoreToNumber(score) >= 5).length;
        const highAchievers = (highAchieversCount / scores.length) * 100;

        // Median score as number
        const scoreNumbers = scores.map(score => scoreToNumber(score));
        const sortedScores = [...scoreNumbers].sort((a, b) => a - b);
        const mid = Math.floor(sortedScores.length / 2);
        const medianScoreNumber = sortedScores.length % 2 !== 0
            ? sortedScores[mid]
            : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
        const medianScoreLetter = numberToLetterGrade(medianScoreNumber);

        setStatistics({
            averageScore: averageScoreNumber * 20, // Convert 0-5 scale to 0-100 for chart
            passingPercentage,
            failingPercentage,
            highAchievers,
            medianScore: medianScoreNumber * 20, // Convert 0-5 scale to 0-100 for chart
            averageScoreLetter,
            medianScoreLetter
        });
    }, [students]);

    // Resize effect
    useEffect(() => {
        if (!containerRef.current) return;

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
        const timer = setTimeout(handleResize, 10);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
        };
    }, []);

    // Render chart when dimensions or statistics change
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        svgRef.current.innerHTML = '';
        const chart = createStatisticsBarChart();
        if (chart) {
            svgRef.current.appendChild(chart);
        }
    }, [dimensions, statistics]);

    const createStatisticsBarChart = () => {
        const { width, height } = dimensions;
        if (width === 0 || height === 0) return null;

        const margin = { top: 50, right: 60, bottom: 80, left: 80 };
        const chartWidth = Math.max(0, width - margin.left - margin.right);
        const chartHeight = Math.max(0, height - margin.top - margin.bottom);

        const svg = d3.create("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Statistics data for the chart
        const statsData = [
            {
                label: 'Avg Score',
                value: statistics.averageScore,
                displayValue: statistics.averageScoreLetter, // Show letter grade in tooltip
                type: 'averageScore',
                format: (val: number) => `${val.toFixed(1)}%`,
                description: 'Average exam score across all students'
            },
            {
                label: 'Passing',
                value: statistics.passingPercentage,
                displayValue: `${statistics.passingPercentage.toFixed(1)}%`,
                type: 'passingPercentage',
                format: (val: number) => `${val.toFixed(1)}%`,
                description: 'Percentage of students scoring C or better'
            },
            {
                label: 'Failing',
                value: statistics.failingPercentage,
                displayValue: `${statistics.failingPercentage.toFixed(1)}%`,
                type: 'failingPercentage',
                format: (val: number) => `${val.toFixed(1)}%`,
                description: 'Percentage of students scoring below C'
            },
            {
                label: 'High Achievers',
                value: statistics.highAchievers,
                displayValue: `${statistics.highAchievers.toFixed(1)}%`,
                type: 'highAchievers',
                format: (val: number) => `${val.toFixed(1)}%`,
                description: 'Percentage of students scoring A'
            },
            {
                label: 'Median Score',
                value: statistics.medianScore,
                displayValue: statistics.medianScoreLetter, // Show letter grade in tooltip
                type: 'medianScore',
                format: (val: number) => `${val.toFixed(1)}%`,
                description: 'Middle score when all scores are sorted'
            }
        ];

        console.log('Chart data:', statsData);

        // Scales
        const xScale = d3.scaleBand()
            .domain(statsData.map(d => d.label))
            .range([0, chartWidth])
            .padding(0.4);

        const yScale = d3.scaleLinear()
            .domain([0, 100]) // Percentage scale
            .range([chartHeight, 0])
            .nice();

        // Add grid lines
        chartGroup.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-chartWidth)
                .tickFormat(null)
                .ticks(5))
            .attr("opacity", 0.2);

        // Tooltip
        const tooltip = ToolTip();

        // Create bars
        statsData.forEach(stat => {
            const barGroup = chartGroup.append('g');

            // Bar
            barGroup.append('rect')
                .attr('x', xScale(stat.label)!)
                .attr('y', yScale(stat.value))
                .attr('width', xScale.bandwidth())
                .attr('height', chartHeight - yScale(stat.value))
                .attr('fill', statisticColors[stat.type as keyof typeof statisticColors])
                .attr('rx', 4)
                .attr('ry', 4)
                .on("mouseover", function(event) {
                    d3.select(this)
                        .attr('stroke', mentatGold)
                        .attr('stroke-width', 2);

                    tooltip
                        .html(`
                            <div class="p-2">
                                <div class="font-bold">${stat.label}</div>
                                <div>${stat.displayValue}</div>
                                <div class="text-sm text-mentat-gold/60">${stat.description}</div>
                                <div class="text-xs text-mentat-gold/80 mt-1">
                                    ${students ? students.length : 0} students, ${allScores.length} exams
                                </div>
                            </div>
                        `)
                        .style("opacity", 1)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 15) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr('stroke', 'none');
                    tooltip.style("opacity", 0);
                });

            // Value label on bar
            barGroup.append('text')
                .attr('x', xScale(stat.label)! + xScale.bandwidth() / 2)
                .attr('y', yScale(stat.value) - 5)
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .attr('fill', mentatGold70)
                .text(stat.format(stat.value));
        });

        // X-axis
        chartGroup.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr('font-size', '11px')
            .attr('fill', mentatGold70)
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em');

        // Y-axis
        chartGroup.append('g')
            .call(d3.axisLeft(yScale)
                .tickFormat(d => `${d}%`)
                .tickSize(0)
            )
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", mentatGold)
                .attr("text-shadow", "none")
                .attr("paint-order", "stroke")
                .attr("stroke", "none")
            );

        // Y-axis label
        chartGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -chartHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', mentatGold70)
            .text('Percentage / Score');

        // Chart title
        chartGroup.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', mentatGold70)
            .text('Exam Performance Statistics');

        return svg.node();
    };

    return (
        <div className="bg-card-color rounded-lg border border-mentat-gold/20 w-full h-full
        min-h-[300px] flex flex-col shadow-sm shadow-mentat-gold/40">
            <div
                ref={containerRef}
                className="w-full flex flex-1 relative rounded-lg overflow-hidden text-mentat-gold"
            >
                {!students || students.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        No student grades for analysis
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