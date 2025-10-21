import React from 'react';
import Modal from '@/components/services/Modal';
import { DeleteScope } from '../hooks/useDeleteActions';

/**
 * Props for the Delete Exam Modal
 */
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    deleteScope: DeleteScope;
    onDeleteScopeChange: (scope: DeleteScope) => void;
    onConfirmDelete: () => void;
}

/**
 * This will delete an exam result from the table
 * @param isOpen
 * @param onClose
 * @param deleteScope
 * @param onDeleteScopeChange
 * @param onConfirmDelete
 * @constructor
 * @author Telmen Enkhtuvshin
 */
export const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    deleteScope,
    onDeleteScopeChange,
    onConfirmDelete
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete test window"
        >
            <div className="space-y-4">
                <p className="text-sm text-mentat-gold/80">
                    Choose what to delete. This action cannot be undone.
                </p>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                        <input
                            type="radio"
                            name="delete-scope"
                            value="single"
                            checked={deleteScope === 'single'}
                            onChange={() => onDeleteScopeChange('single')}
                            className="accent-red-500"
                        />
                        <span>This event</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                        <input
                            type="radio"
                            name="delete-scope"
                            value="following"
                            checked={deleteScope === 'following'}
                            onChange={() => onDeleteScopeChange('following')}
                            className="accent-red-500"
                        />
                        <span>This and following events</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                        <input
                            type="radio"
                            name="delete-scope"
                            value="all"
                            checked={deleteScope === 'all'}
                            onChange={() => onDeleteScopeChange('all')}
                            className="accent-red-500"
                        />
                        <span>All events</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-mentat-gold/10">
                    <button
                        className="px-4 py-2 rounded-md text-sm hover:bg-white/5"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-md text-sm bg-red-600 hover:bg-red-500 text-white"
                        onClick={onConfirmDelete}
                    >
                        OK
                    </button>
                </div>
            </div>
        </Modal>
    );
};
