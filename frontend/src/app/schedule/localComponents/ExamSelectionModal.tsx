'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Check, X, AlertCircle, Clock, Award, BookOpen } from 'lucide-react';
import { Exam } from '@/components/types/exams';
import { apiHandler } from '@/utils/api';
import { useSession } from 'next-auth/react';

interface ExamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    testWindowId: number;
    testWindowTitle: string;
    courseId: number;
    onExamsSelected: (selectedExamIds: number[]) => void;
    initiallySelectedExams?: number[];
}

interface ExamWithSelection extends Exam {
    isSelected: boolean;
    isAllowed: boolean;
    status?: 'active' | 'inactive';
}

const ExamSelectionModal: React.FC<ExamSelectionModalProps> = ({
    isOpen,
    onClose,
    testWindowId,
    testWindowTitle,
    courseId,
    onExamsSelected,
    initiallySelectedExams = []
}) => {
    const { data: session, status } = useSession();
    const [exams, setExams] = useState<ExamWithSelection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
    const [requiredFilter, setRequiredFilter] = useState<'all' | 'required' | 'optional'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    const hasFetched = useRef(false);
    
    // Memoize access token to prevent unnecessary re-renders
    const accessToken = useMemo(() => session?.user?.accessToken, [session?.user?.accessToken]);

    // Memoized fetch function to prevent recreation on every render
    const fetchExamsAndRestrictions = useCallback(async () => {
        if (!courseId || !testWindowId || !accessToken) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch exams and restrictions in parallel
            const [examsResponse, restrictionsResponse] = await Promise.all([
                apiHandler(
                    undefined,
                    'GET',
                    `api/exams/course/${courseId}`,
                    `${BACKEND_API}`,
                    accessToken
                ),
                apiHandler(
                    undefined,
                    'GET',
                    `api/test-window-exam-restrictions/test-window/${testWindowId}/allowed-ids`,
                    `${BACKEND_API}`,
                    accessToken
                )
            ]);

            if (examsResponse?.error) {
                setError(examsResponse.message || 'Failed to fetch exams');
                return;
            }

            const examsData = Array.isArray(examsResponse) ? examsResponse : examsResponse?.data || [];
            
            // Get allowed exam IDs from restrictions
            let allowedExamIds: number[] = [];
            if (!restrictionsResponse?.error && restrictionsResponse?.allowedExamIds) {
                allowedExamIds = restrictionsResponse.allowedExamIds;
            } else if (initiallySelectedExams.length > 0) {
                // Fallback to initially selected exams if no restrictions found
                allowedExamIds = initiallySelectedExams;
            }
            
            // Convert to ExamWithSelection format
            const examsWithSelection: ExamWithSelection[] = examsData.map((exam: any) => {
                console.log('Raw exam data:', exam);
                console.log('exam_state value:', exam.exam_state, 'type:', typeof exam.exam_state);
                
                return {
                    ...exam,
                    isSelected: allowedExamIds.includes(exam.exam_id),
                    isAllowed: true, // Default to allowed, can be modified based on existing restrictions
                    status: exam.exam_state === 1 ? 'active' : 'inactive'
                };
            });

            setExams(examsWithSelection);
        } catch (err) {
            console.error('Error fetching exams and restrictions:', err);
            setError('Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    }, [courseId, testWindowId, BACKEND_API, accessToken, initiallySelectedExams]);

    // Fetch exams for the course and existing restrictions
    useEffect(() => {
        if (!isOpen || !courseId || !testWindowId || hasFetched.current) return;

        hasFetched.current = true;
        fetchExamsAndRestrictions();
    }, [isOpen, courseId, testWindowId, fetchExamsAndRestrictions]);

    // Reset fetch flag when modal closes
    useEffect(() => {
        if (!isOpen) {
            hasFetched.current = false;
        }
    }, [isOpen]);

    // Filter exams based on search and filter criteria
    const filteredExams = useMemo(() => {
        console.log('Filtering exams. Total exams:', exams.length);
        console.log('Status filter:', statusFilter);
        
        return exams.filter(exam => {
            const matchesSearch = exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'all' || exam.exam_difficulty === Number(difficultyFilter);
            const matchesRequired = requiredFilter === 'all' || 
                (requiredFilter === 'required' && exam.exam_required === 1) ||
                (requiredFilter === 'optional' && exam.exam_required === 0);
            const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;

            console.log(`Exam ${exam.exam_name}: difficulty=${exam.exam_difficulty} (${typeof exam.exam_difficulty}), filter=${difficultyFilter} (${typeof difficultyFilter}), matchesDifficulty=${matchesDifficulty}`);
            
            return matchesSearch && matchesDifficulty && matchesRequired && matchesStatus;
        });
    }, [exams, searchTerm, difficultyFilter, requiredFilter, statusFilter]);

    const selectedExams = useMemo(() => {
        return exams.filter(exam => exam.isSelected);
    }, [exams]);

    const handleExamToggle = (examId: number) => {
        setExams(prev => prev.map(exam => 
            exam.exam_id === examId 
                ? { ...exam, isSelected: !exam.isSelected }
                : exam
        ));
    };

    const handleSelectAll = () => {
        const allSelected = filteredExams.every(exam => exam.isSelected);
        setExams(prev => prev.map(exam => {
            const isInFiltered = filteredExams.some(filtered => filtered.exam_id === exam.exam_id);
            return isInFiltered ? { ...exam, isSelected: !allSelected } : exam;
        }));
    };

    const handleSave = async () => {
        const selectedIds = selectedExams.map(exam => exam.exam_id);
        
        try {
            // Save the exam restrictions to the backend
            const response = await apiHandler(
                {
                    testWindowId: testWindowId,
                    examIds: selectedIds,
                    isAllowed: true
                },
                'POST',
                `api/test-window-exam-restrictions/set`,
                `${BACKEND_API}`,
                accessToken ?? undefined
            );

            if (response?.error) {
                console.error('Error saving exam restrictions:', response.error);
                // Still call the callback for UI updates
                onExamsSelected(selectedIds);
            } else {
                console.log('Exam restrictions saved successfully:', response);
                onExamsSelected(selectedIds);
            }
        } catch (error) {
            console.error('Error saving exam restrictions:', error);
            // Still call the callback for UI updates
            onExamsSelected(selectedIds);
        }
        
        onClose();
    };

    const getDifficultyColor = (difficulty: number) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800'
        };
        return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Award className="w-4 h-4 text-green-500" />;
            case 'inactive':
                return <Clock className="w-4 h-4 text-gray-500" />;
            default:
                return <BookOpen className="w-4 h-4 text-gray-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-mentat-black border border-mentat-gold/20 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-mentat-gold/20">
                    <div>
                        <h2 className="text-2xl font-bold text-mentat-gold">Select Allowed Exams</h2>
                        <p className="text-mentat-gold/80 mt-1">
                            Choose which exams can be taken in "{testWindowTitle}"
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-mentat-gold"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-mentat-gold/20 bg-white/5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentat-gold/60 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search exams..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-mentat-black border border-mentat-gold/30 rounded-lg focus:ring-2 focus:ring-mentat-gold focus:border-mentat-gold text-mentat-gold placeholder-mentat-gold/50"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                                className="px-3 py-2 bg-mentat-black border border-mentat-gold/30 rounded-lg focus:ring-2 focus:ring-mentat-gold text-mentat-gold"
                            >
                                <option value="all">All Difficulties</option>
                                <option value={1}>Difficulty 1</option>
                                <option value={2}>Difficulty 2</option>
                                <option value={3}>Difficulty 3</option>
                                <option value={4}>Difficulty 4</option>
                                <option value={5}>Difficulty 5</option>
                            </select>

                            <select
                                value={requiredFilter}
                                onChange={(e) => setRequiredFilter(e.target.value as any)}
                                className="px-3 py-2 bg-mentat-black border border-mentat-gold/30 rounded-lg focus:ring-2 focus:ring-mentat-gold text-mentat-gold"
                            >
                                <option value="all">All Types</option>
                                <option value="required">Required</option>
                                <option value="optional">Optional</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="px-3 py-2 bg-mentat-black border border-mentat-gold/30 rounded-lg focus:ring-2 focus:ring-mentat-gold text-mentat-gold"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Selection Summary */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-mentat-gold/80">
                                {selectedExams.length} of {exams.length} exams selected
                            </span>
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-mentat-gold hover:text-mentat-gold/80 font-medium"
                            >
                                {filteredExams.every(exam => exam.isSelected) ? 'Deselect All' : 'Select All'} (Filtered)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mentat-gold"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                <p className="text-red-400">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto p-6 pb-10">
                            {filteredExams.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-mentat-gold/60 mx-auto mb-4" />
                                    <p className="text-mentat-gold/80">No exams found matching your criteria</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredExams.map((exam) => (
                                        <motion.div
                                            key={exam.exam_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                exam.isSelected 
                                                    ? 'border-mentat-gold bg-mentat-gold/10' 
                                                    : 'border-mentat-gold/30 hover:border-mentat-gold/50 hover:bg-white/5'
                                            }`}
                                            onClick={() => handleExamToggle(exam.exam_id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                        exam.isSelected 
                                                            ? 'bg-mentat-gold border-mentat-gold' 
                                                            : 'border-mentat-gold/50'
                                                    }`}>
                                                        {exam.isSelected && <Check className="w-3 h-3 text-mentat-black" />}
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-mentat-gold">{exam.exam_name}</h3>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exam.exam_difficulty)}`}>
                                                                Difficulty {exam.exam_difficulty}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                exam.exam_required === 1 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {exam.exam_required === 1 ? 'Required' : 'Optional'}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {getStatusIcon(exam.status || 'inactive')}
                                                                <span className="text-xs text-mentat-gold/70 capitalize">
                                                                    {exam.status || 'inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right text-sm text-mentat-gold/80">
                                                    <div>Duration: {exam.exam_duration || 'Not specified'}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {exam.exam_online === 1 ? (
                                                            <span className="text-green-400">Online</span>
                                                        ) : (
                                                            <span className="text-mentat-gold/60">In-person</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-mentat-gold/20 bg-white/5">
                    <div className="text-sm text-mentat-gold/80">
                        {selectedExams.length > 0 && (
                            <span>
                                {selectedExams.length} exam{selectedExams.length !== 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-mentat-gold bg-mentat-black border border-mentat-gold/30 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-[#A30F32] text-white rounded-lg hover:bg-[#8e0d2b] transition-colors"
                        >
                            Save Selection
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExamSelectionModal;
