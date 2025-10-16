import React from "react";
import TestWindow from "@/components/types/test_window";

interface TestWindowCardProps {
    testWindow: TestWindow;
    createAction: (arg0: TestWindow) => void;
    updateAction: (arg0: TestWindow) => void;
    cancelAction: () => void;
    onClickAction: () => void;
    activeOverlay: number | null;
    newScheduled: boolean;
}

export default function TestWindowCard(
    {testWindow, createAction, updateAction, cancelAction, onClickAction,
        activeOverlay, newScheduled}: TestWindowCardProps ) {

    return (
        <div className="relative" key={testWindow.testWindowId}>
            {/* Test Window card */}
            <div
                className="border border-mentat-gold/20 mb-2
                                rounded-xl bg-card-color p-2 hover:bg-card-color/10"
                onClick={onClickAction}
            >
                <div>
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Description:
                        </span>
                    </div>
                    <div className="rounded-lg text-sm">
                        <span className="text-mentat-gold-700">
                            {testWindow.description}
                        </span>
                    </div>
                </div>
                <div className="my-1">
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Start Date/Time:
                        </span>
                    </div>
                    <div className="rounded-lg text-sm">
                        <span className="text-mentat-gold-700">
                            {testWindow?.testWindowStartDate?.toLocaleString('en-US',
                                { timeZone: 'America/Los_Angeles' })}: {testWindow?.testStartTime}
                        </span>
                    </div>
                </div>
                <div className="my-1 overflow-y-auto">
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            End Date/Time:
                        </span>
                    </div>
                    <div className="rounded-lg text-sm">
                        <span className="text-mentat-gold-700">
                            {testWindow?.testWindowEndDate?.toLocaleString('en-US',
                                { timeZone: 'America/Los_Angeles' })}: {testWindow?.testEndTime}
                        </span>
                    </div>
                </div>
                <div className="my-1">
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Active:
                        </span>
                        <span className={`${ testWindow.isActive ?
                            'text-green-700' : 'text-red-700'
                        }`}>
                            <span className="not-italic">
                                {testWindow.isActive.toString()}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            {/* Overlay that appears when active */}
            {activeOverlay === testWindow.testWindowId && (
                <div className="absolute inset-0 bg-mentat-black/10 backdrop-blur-sm rounded-xl
                    flex items-center justify-center z-20"
                >
                    <div className="flex flex-col gap-3 items-center">
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium
                                transition-colors shadow-sm shadow-mentat-gold-700
                                bg-crimson text-mentat-gold hover:bg-crimson-700"
                            onClick={() => {
                                if (!newScheduled)
                                    updateAction(testWindow);
                                else
                                    createAction(testWindow);
                            }}
                        >
                            {newScheduled ? 'Schedule' : 'Reschedule'}
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg text-sm bg-mentat-gold
                                                    transform-colors hover:bg-mentat-gold-700
                                                    text-crimson font-bold shadow-sm shadow-crimson-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                cancelAction();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}