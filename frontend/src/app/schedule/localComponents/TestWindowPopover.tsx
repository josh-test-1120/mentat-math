import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Popover from '@/components/UI/calendar/Popover';
import { ActiveTestWindow } from '../hooks/useDeleteActions';
import ExamSelectionModal from './ExamSelectionModal';
import ModifyPatternModal from './ModifyPatternModal';

interface TestWindowPopoverProps {
    isOpen: boolean;
    anchor: { x: number; y: number } | null;
    onClose: () => void;
    activeTestWindow: ActiveTestWindow | null;
    onModifySettings: () => void;
    onControlAllowedTests: () => void;
    onDeleteTestWindow: () => void;
    courseId?: number;
    courses?: any[];
    onTestWindowUpdated?: () => void;
}

/**
 * Test window context popover component
 */
export const TestWindowPopover: React.FC<TestWindowPopoverProps> = ({
    isOpen,
    anchor,
    onClose,
    activeTestWindow,
    onModifySettings,
    onControlAllowedTests,
    onDeleteTestWindow,
    courseId,
    courses = [],
    onTestWindowUpdated
}) => {
    const [isExamSelectionOpen, setIsExamSelectionOpen] = useState(false);
    const [isModifyPatternOpen, setIsModifyPatternOpen] = useState(false);
    const handleModifySettings = () => {
        if (!activeTestWindow) return;
        setIsModifyPatternOpen(true);
        onClose(); // Close the popover when opening the modal
    };

    const handleControlAllowedTests = () => {
        if (!activeTestWindow) return;
        setIsExamSelectionOpen(true);
        onClose(); // Close the popover when opening the modal
    };

    const handleExamsSelected = (selectedExamIds: number[]) => {
        toast.success(`Selected ${selectedExamIds.length} exams for "${activeTestWindow?.title}"`);
        // Here you would typically save the selection to the backend
        console.log('Selected exam IDs:', selectedExamIds);
    };

    return (
        <>
            <Popover
                isOpen={isOpen}
                anchor={anchor}
                onClose={onClose}
            >
                <div className="min-w-[220px] p-1">
                    <div className="px-3 py-2 text-sm font-semibold text-mentat-gold/80 border-b border-mentat-gold/10">
                        {activeTestWindow?.title || 'Test Window'}
                    </div>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                        onClick={handleModifySettings}
                    >
                        Modify Pattern
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                        onClick={handleControlAllowedTests}
                    >
                        Control allowed tests
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        onClick={onDeleteTestWindow}
                    >
                        Delete test window
                    </button>
                </div>
            </Popover>

            {/* Exam Selection Modal */}
            {activeTestWindow && courseId && (
                <ExamSelectionModal
                    isOpen={isExamSelectionOpen}
                    onClose={() => setIsExamSelectionOpen(false)}
                    testWindowId={activeTestWindow.id}
                    testWindowTitle={activeTestWindow.title}
                    courseId={courseId}
                    onExamsSelected={handleExamsSelected}
                />
            )}

            {/* Modify Pattern Modal */}
            {activeTestWindow && (
                <ModifyPatternModal
                    isOpen={isModifyPatternOpen}
                    onClose={() => setIsModifyPatternOpen(false)}
                    testWindowId={activeTestWindow.id}
                    testWindowTitle={activeTestWindow.title}
                    courses={courses}
                    onTestWindowUpdated={onTestWindowUpdated}
                />
            )}
        </>
    );
};
