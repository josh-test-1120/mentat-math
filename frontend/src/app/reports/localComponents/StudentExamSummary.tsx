"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { RingSpinner } from "@/components/UI/Spinners";
import { Calendar, Clock, Users, FileText } from "lucide-react";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

interface ScheduledExamStats {
    examName: string;
    examId: number;
    scheduledDate: string;
    totalScheduled: number;
    students: {
        username: string;
        email: string;
        scheduledDate: string;
        testWindowId: number;
    }[];
}

interface DaySummary {
    date: string;
    totalExams: number;
    exams: ScheduledExamStats[];
}

/**
 * Student Exam Summary Component
 * Shows instructors which students scheduled which exams
 */
export default function StudentExamSummary() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [dataByDay, setDataByDay] = useState<Map<string, ScheduledExamStats[]>>(new Map());
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [expandedExams, setExpandedExams] = useState<Set<number>>(new Set());

    useEffect(() => {
        const accessToken = session?.user?.accessToken;
        if (accessToken) {
            fetchSummary();
        }
    }, [session]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const accessToken = session?.user?.accessToken;
            if (!accessToken || !BACKEND_API) return;
            
            const response = await apiHandler(
                undefined,
                'GET',
                `api/scheduled-exam/summary`,
                BACKEND_API,
                accessToken
            );

            if (response instanceof Error || response.error) {
                console.error('Error fetching summary:', response);
                return;
            }

            // Organize data by day
            const dayMap = new Map<string, ScheduledExamStats[]>();
            
            if (Array.isArray(response)) {
                response.forEach((item: any) => {
                    const date = item.scheduledDate || "No Date";
                    if (!dayMap.has(date)) {
                        dayMap.set(date, []);
                    }
                    dayMap.get(date)!.push(item);
                });
            }

            setDataByDay(dayMap);
            
            // Set the first date as selected by default
            if (dayMap.size > 0) {
                setSelectedDate(Array.from(dayMap.keys())[0]);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExam = (examId: number) => {
        const newExpanded = new Set(expandedExams);
        if (newExpanded.has(examId)) {
            newExpanded.delete(examId);
        } else {
            newExpanded.add(examId);
        }
        setExpandedExams(newExpanded);
    };

    const sortedDates = Array.from(dataByDay.keys()).sort((a, b) => {
        if (a === "No Date") return 1;
        if (b === "No Date") return -1;
        return new Date(a).getTime() - new Date(b).getTime();
    });

    const getDayStats = (date: string) => {
        const exams = dataByDay.get(date) || [];
        const totalScheduled = exams.reduce((sum, exam) => sum + exam.totalScheduled, 0);
        const uniqueStudents = new Set(
            exams.flatMap(exam => exam.students.map(s => s.email))
        ).size;
        
        return { totalScheduled, uniqueStudents, examCount: exams.length };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RingSpinner />
            </div>
        );
    }

    if (dataByDay.size === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-mentat-gold/50 mb-4" />
                <p className="text-mentat-gold/70 text-lg">No scheduled exams found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-crimson/20 to-crimson/10 p-6 rounded-lg border border-crimson/30">
                <h2 className="text-2xl font-bold text-mentat-gold mb-2 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Student Exam Scheduling Summary
                </h2>
                <p className="text-mentat-gold/70">View which students scheduled which exams</p>
            </div>

            {/* Date Navigation */}
            <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-lg border border-mentat-gold/20">
                {sortedDates.map((date) => {
                    const stats = getDayStats(date);
                    return (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                selectedDate === date
                                    ? 'bg-crimson text-mentat-gold border-2 border-crimson'
                                    : 'bg-white/5 text-mentat-gold/70 border border-mentat-gold/20 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{date}</span>
                                <span className="text-xs bg-mentat-gold/20 px-2 py-0.5 rounded">
                                    {stats.examCount} exams
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Summary */}
            {selectedDate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-crimson/20 to-crimson/10 p-4 rounded-lg border border-crimson/30">
                        <div className="flex items-center gap-2 text-mentat-gold/70 mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Scheduled</span>
                        </div>
                        <p className="text-3xl font-bold text-mentat-gold">
                            {getDayStats(selectedDate).totalScheduled}
                        </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-mentat-gold/20 to-mentat-gold/10 p-4 rounded-lg border border-mentat-gold/30">
                        <div className="flex items-center gap-2 text-mentat-gold/70 mb-2">
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-medium">Unique Students</span>
                        </div>
                        <p className="text-3xl font-bold text-mentat-gold">
                            {getDayStats(selectedDate).uniqueStudents}
                        </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-crimson/20 to-crimson/10 p-4 rounded-lg border border-crimson/30">
                        <div className="flex items-center gap-2 text-mentat-gold/70 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Exams</span>
                        </div>
                        <p className="text-3xl font-bold text-mentat-gold">
                            {getDayStats(selectedDate).examCount}
                        </p>
                    </div>
                </div>
            )}

            {/* Exam List for Selected Date */}
            {selectedDate && dataByDay.get(selectedDate) && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-mentat-gold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {selectedDate}
                    </h3>

                    {dataByDay.get(selectedDate)!.map((exam) => (
                        <div
                            key={exam.examId}
                            className="bg-white/5 border border-mentat-gold/20 rounded-lg overflow-hidden hover:border-crimson/50 transition-all"
                        >
                            {/* Exam Header */}
                            <button
                                onClick={() => toggleExam(exam.examId)}
                                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="bg-crimson/20 text-crimson px-3 py-1 rounded-full font-bold text-sm min-w-[3rem] text-center">
                                        {exam.totalScheduled}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-mentat-gold font-semibold">{exam.examName}</h4>
                                        <p className="text-mentat-gold/70 text-sm">
                                            Exam ID: {exam.examId}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-mentat-gold/70">
                                    {expandedExams.has(exam.examId) ? '▼' : '▶'}
                                </div>
                            </button>

                            {/* Student Details */}
                            {expandedExams.has(exam.examId) && (
                                <div className="px-6 py-4 bg-white/5 border-t border-mentat-gold/20">
                                    <div className="space-y-2">
                                        {exam.students.map((student, idx) => (
                                            <div
                                                key={idx}
                                                className="flex justify-between items-center py-2 px-3 bg-white/5 rounded hover:bg-white/10 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-mentat-gold font-medium">{student.username}</p>
                                                    <p className="text-mentat-gold/70 text-sm">{student.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-mentat-gold/70 text-sm">
                                                        Window ID: {student.testWindowId}
                                                    </p>
                                                    <p className="text-mentat-gold/50 text-xs">
                                                        {student.scheduledDate}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

