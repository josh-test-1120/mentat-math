// export const RingSpinner = () => (
//     <div className="flex justify-center items-center">
//         <div className="relative w-8 h-8">
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
//         </div>
//     </div>
// );

interface RingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
}

export const RingSpinner = ({ size = 'md', color = 'blue-500' }: RingSpinnerProps) => {
    const sizeClasses = {
        xs: 'w-4 h-4',
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
    };
    const borderClasses = {
        xs: 'border-2',
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-6',
        xl: 'border-8'
    }

    return (
        <div className="flex justify-center items-center relative">
            <div className={`rounded-full ${sizeClasses[size]} ${borderClasses[size]} border-l-mentat-gold
            border-r-mentat-gold/70 border-b-mentat-gold/80 border-t-transparent animate-spin`}></div>
            <div className={`absolute rounded-full ${sizeClasses[size]} border border-${color} opacity-10
            animate-ping`}></div>
        </div>
        // <div className="flex justify-center items-center">
        //     <div className={`rounded-full ${sizeClasses[size]} border-2 border-t-2 border-${color}
        //      border-t-transparent animate-spin`}></div>
        //     <div className={`absolute rounded-full ${sizeClasses[size]} border border-${color} opacity-15
        //      animate-ping`}></div>
        //     {/*<div className={`relative ${sizeClasses[size]}`}>*/}
        //     {/*    <div className={`absolute top-0 left-0 w-full h-full ${borderClasses[size]}*/}
        //     {/*     border-gray-200 rounded-full`}></div>*/}
        //     {/*    <div className={`absolute top-0 left-0 w-full h-full ${borderClasses[size]}*/}
        //     {/*     border-${color} rounded-full animate-spin border-t-transparent`}></div>*/}
        //     {/*</div>*/}
        // </div>
    );
};

export const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

export const PulseSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-pulse rounded-full h-8 w-8 bg-blue-500"></div>
    </div>
);

export const DotsSpinner = () => (
    <div className="flex justify-center items-center space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
);