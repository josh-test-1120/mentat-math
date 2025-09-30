interface TypewriterTextProps {
    text: string;
    delay?: number;
}

interface FadeUpTextProps {
    text: string;
    delay?: number;
}

interface ArtisticTextProps {
    text: string;
    delay?: number;
}

export const TypewriterText = ({ text, delay = 0.1 }: TypewriterTextProps) => {
    return (
        <div className="flex flex-wrap">
            {text.split('').map((letter: string, index: number) => (
                <span
                    key={index}
                    className={`
                        animate-typewriter opacity-0
                        ${letter === ' ' ? 'min-w-[0.25em]' : ''}
                    `}
                    style={{ animationDelay: `${index * delay}s` }}
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

export const FadeUpText = ({ text, delay = 0.05 }: FadeUpTextProps) => {
    return (
        <div className="flex flex-wrap">
            {text.split('').map((letter, index) => (
                <span
                    key={index}
                    className="inline-block animate-fade-up opacity-0 whitespace-pre"
                    style={{ animationDelay: `${index * delay}s` }}
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

export const ArtisticText = ({ text, delay = 0.07 }: ArtisticTextProps) => {
    return (
        <div className="flex justify-center">
            {text.split('').map((letter: string, index: number) => (
                <span
                    key={index}
                    className="inline-block opacity-0 animate-artistic-reveal"
                    style={{
                        animationDelay: `${index * delay}s`,
                    }}
                >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
            ))}
        </div>
    );
};