import type { FC } from "react";

export type StaticHeroImageProps = {
  imageUrl: string;
  className?: string;
  backgroundPosition?: string;
  title?: React.ReactNode;
  subtitles?: React.ReactNode[];
};

export const StaticHeroImage: FC<StaticHeroImageProps> = ({
  imageUrl,
  className = "",
  backgroundPosition = "center",
  title,
  subtitles = [],
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      // style={{ height: 500 }}
    >
      <div
        className="absolute inset-0 w-full h-full bg-cover"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition,
        }}
      />

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Title and subtitles */}
      {(title || subtitles.length > 0) && (
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none gap-3">
          {title && (
            <div
              className="pointer-events-auto px-6 py-2 font-bold text-white tracking-wide"
              style={{
                background: "linear-gradient(to bottom, #cc2020 0%, #8b0000 50%, #5c0000 100%)",
                border: "3px solid #1a1a1a",
                borderRadius: "4px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.6)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {title}
            </div>
          )}
          {subtitles.map((subtitle, index) => (
            <div
              key={index}
              className="pointer-events-auto backdrop-blur-sm bg-black/10 dark:bg-white/5 rounded-2xl px-6 py-4"
            >
              {subtitle}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaticHeroImage;
