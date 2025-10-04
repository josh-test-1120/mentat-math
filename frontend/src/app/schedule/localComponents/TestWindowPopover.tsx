import React from 'react';
import { toast } from 'react-toastify';
import Popover from '@/components/UI/calendar/Popover';
import { ActiveTestWindow } from '../hooks/useDeleteActions';

interface TestWindowPopoverProps {
    isOpen: boolean;
    anchor: { x: number; y: number } | null;
    onClose: () => void;
    activeTestWindow: ActiveTestWindow | null;
    onModifySettings: () => void;
    onControlAllowedTests: () => void;
    onDeleteTestWindow: () => void;
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
    onDeleteTestWindow
}) => {
    const handleModifySettings = () => {
        if (!activeTestWindow) return;
        toast.info(`Modify settings for "${activeTestWindow.title}" (id: ${activeTestWindow.id})`);
        onModifySettings();
    };

    const handleControlAllowedTests = () => {
        if (!activeTestWindow) return;
        toast.info(`Control allowed tests for "${activeTestWindow.title}" (id: ${activeTestWindow.id})`);
        onControlAllowedTests();
    };

    return (
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
                    Modify settings
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
    );
};
