// components/D3Chart.js
'use client'; // This component will be rendered on the client

import {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import { Report } from "@/app/reports/types/shared";
import ToolTip from "@/app/reports/localComponents/ToolTip";

interface StatusChartProps {
    data: Report[];
}

interface GradeStatus {
    name: string;
    value: number;
    details: string[];
}

export const StatusChart = ({ data } : StatusChartProps) => {
    // Chart Variables
    const svgRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const scoreToNumber = (score: string) : number => {
        // Convert the letter grade to a number for graphing
        switch (score) {
            case "A": return 5;
            case "B": return 4;
            case "C": return 3;
            case "D": return 2;
            default: return 1;
        }
    }

    const statusToNumber = (status: string) : number => {
        // Count the number of exams that match the status
        let counter = 0;
        // Check each grade and add to the counter
        data.forEach((grade: Report) => {
            if (grade.status === status) counter += 1;
        })
        // Return the counter
        return counter;
    }

    const calculateStatus = (data: Report[]) : GradeStatus[] => {
        // New status map
        let statusMap: GradeStatus[] = [];

        for (const grade of data) {
            if (grade.status !== undefined) {
                const existingGrade = statusMap.find(dict =>
                    grade.status === dict.name);
                if (existingGrade) {
                    // Increment the existing grade's value
                    existingGrade.value++;
                    existingGrade.details.push(grade.examName.toString());
                } else {
                    statusMap.push({
                        name: grade.status,
                        value: 1,
                        details: [grade.examName.toString()],
                    });
                }
            }
        }
        // Return the graph data object
        return statusMap;
    }

    const chart = () => {
        // Transform the grade data into chart data
        let chartData = calculateStatus(data);
        // Color map
        const statusColorMap = {
            'passed': '#2E8B57',        // seagreen
            'failed': '#DC143C',        // orange
            'pending': '#1E90FF',       // dodgerblue
        };

        // Get the tooltip
        const toolTip = ToolTip();

        console.log('This is the transformed chart data');
        console.log(chartData);

        console.log("Container dimensions:", dimensions);
        console.log("Chart data:", chartData);

        // Ensure we have valid scores
        // const validData = data.filter(d => d.exam_score !== undefined);
        const validData = chartData;
        console.log("Valid data:", validData);

        if (validData.length === 0) {
            // Return empty SVG if no valid data
            return d3.create("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
                // .style("background", "#f5f5f5")
                .append("text")
                .attr("x", dimensions.width / 2)
                .attr("y", dimensions.height / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text("No valid data")
                .node();
        }

        // Calculate chart dimensions based on container
        const margin = 20;
        const chartWidth = dimensions.width - margin * 2;
        const chartHeight = dimensions.height - margin * 2;
        const radius = Math.min(chartWidth, chartHeight) / 2;

        console.log(`Chart dimensions: ${chartWidth}x${chartHeight}, radius: ${radius}`);

        // Use it directly
        const color = d3.scaleOrdinal<string>()
            .domain(Object.keys(statusColorMap))
            .range(Object.values(statusColorMap));

        const pie = d3.pie<GradeStatus>()
            .sort(null)
            .value(d => d.value);

        const arc = d3.arc<d3.PieArcDatum<GradeStatus>>()
            .innerRadius(0)
            .outerRadius(radius);

        const labelRadius = radius * 0.6; // Adjust for better label placement
        const arcLabel = d3.arc<d3.PieArcDatum<GradeStatus>>()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const arcs = pie(validData);
        console.log("Generated arcs:", arcs);

        // Create responsive SVG
        const svg = d3.create("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `-${dimensions.width / 2} -${dimensions.height / 2} ${dimensions.width} ${dimensions.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("display", "block"); // Remove any default inline spacing

        // Draw the pie slices
        const slices = svg.append("g")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .style("cursor", "pointer")
            // Use .datum() to ensure data is preserved
            .each(function(d) {
                d3.select(this).datum(d);
            })
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke-width", 3);
                console.log(`This is the data name: ${d.data.name}`);
                console.log(`This is the data: ${d.data.details.toString()}`);
                // Setup the tooltip box
                const content = `
                    <div>
                        <div><strong>Exams: ${d.data.details.join(', ') || 'None'}</strong></div>
                    </div>
                `;
                // Render the tooltip box
                toolTip
                    .html(content)
                    .style("opacity", 1)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("stroke-width", 1);
                toolTip.style("opacity", 0);
            });

        // Add labels only if there's enough space
        const labels = svg.append("g")
            .attr("text-anchor", "middle")
            .style("font", `12px sans-serif`)
            .style("pointer-events", "none")
            .selectAll("text")
            .data(arcs)
            .join("text")
            .attr("transform", d => {
                const [x, y] = arcLabel.centroid(d);
                return `translate(${x},${y})`;
            })
            .style("display", d => (d.endAngle - d.startAngle) > 0.2 ? "block" : "none"); // Hide labels for small slices

        labels.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name)
            .style("fill", "#FCF5E5");

        labels.append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value)
            .style("fill", "#FCF5E5");

        // Add tooltips
        slices.append("title")
            .text(d =>
                `${d.data.name}: ${d.data.value}`);

        return svg.node();
    }

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

    // This code only runs on the client-side
    useEffect(() => {
        // Initialize the SVG Reference
        if (!svgRef.current || dimensions.width === 0) return;
        else svgRef.current.innerHTML = '';
        // Generate the chart
        const svg = chart();
        // Append the created SVG to the DOM
        if (svgRef.current && svg) {
            svgRef.current.appendChild(svg);
        }
    }, [data, dimensions]); // Re-run effect if data or dimensions change

    return (
        <div className="rounded-lg border border-mentat-gold/20 w-full h-full min-h-[300px]
        bg-card-color shadow-sm shadow-crimson-700 relative">
            {data.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    No grades assigned for course
                </div>
            ) : (
                <div
                    ref={svgRef}
                    className="w-full h-full"
                    style={{
                        display: 'block',
                        position: 'absolute',
                    }}
                />
            )}
        </div>
    );
};
