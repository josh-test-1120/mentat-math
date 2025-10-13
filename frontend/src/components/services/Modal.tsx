'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isFullScreen?: boolean;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, isFullScreen = false, children }: ModalProps) {
    // Close modal on Escape key
    useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    }, [isOpen, onClose]);

    /**
     * This will return a generic layout for windowed screen
     * modal presentation
     * @constructor
     */
    const WindowScreenModal = () => {
      return (
          <div className="relative bg-mentat-black text-mentat-gold border border-mentat-gold/20
            rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b
                border-mentat-gold/20">
                  <h2 className="text-2xl font-semibold">{title}</h2>
                  <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                      aria-label="Close modal"
                  >
                      <svg
                          className="w-6 h-6 text-mentat-gold"
                          fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
              </div>

              {/* Content */}
              <div className="p-6">
                  {children}
              </div>
          </div>
      )
    }

    /**
     * This will return a generic layout for full screen
     * modal presentation
     * @constructor
     */
    const FullScreenModal = () => {
        return (
            <div className="relative bg-mentat-black text-mentat-gold border border-mentat-gold/20
            rounded-xl shadow-2xl w-11/12 h-5/6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b
                border-mentat-gold/20 mx-4 flex-shrink-0">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <svg
                            className="w-6 h-6 text-mentat-gold"
                            fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        )
    }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop with blur and opacity */}
        <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm
                transition-all duration-300"
            onClick={onClose}
        />
      
        {/* Modal */}
        { isFullScreen ? FullScreenModal() : WindowScreenModal() }
    </div>
  );
}