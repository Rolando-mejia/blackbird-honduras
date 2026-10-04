type BlackbirdMarkProps = {
  className?: string;
  title?: string;
};

export function BlackbirdMark({
  className = "h-9 w-12",
  title = "Blackbird",
}: BlackbirdMarkProps) {
  return (
    <svg viewBox="0 0 504 356" role="img" aria-label={title} className={className} fill="currentColor">
      <path d="M 189 98 L 181 117 L 181 134 L 187 152 L 197 169 L 210 182 L 234 197 L 254 204 L 281 209 L 391 211 L 388 206 L 244 77 L 224 76 L 201 85 Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 4 40 L 46 62 L 65 84 L 73 106 L 79 164 L 89 198 L 110 233 L 129 253 L 146 266 L 168 277 L 197 286 L 241 288 L 259 285 L 283 277 L 315 260 L 317 256 L 411 341 L 434 351 L 456 351 L 451 339 L 440 326 L 413 302 L 386 283 L 381 277 L 382 275 L 425 305 L 452 319 L 479 325 L 499 322 L 489 308 L 469 290 L 392 249 L 386 241 L 386 231 L 266 226 L 231 216 L 211 206 L 190 190 L 172 167 L 164 147 L 160 128 L 162 105 L 172 85 L 187 70 L 201 61 L 215 57 L 225 57 L 192 27 L 175 16 L 152 6 L 117 4 L 96 9 L 77 18 L 56 35 L 30 35 Z
           M 119 32 L 124 33 L 130 39 L 131 47 L 126 54 L 116 57 L 107 51 L 106 41 L 111 35 Z"
      />
    </svg>
  );
}

export function BlackbirdBrand({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <BlackbirdMark className={compact ? "h-7 w-10" : "h-9 w-12"} />
      <div className={`font-black tracking-[-0.045em] ${compact ? "text-lg" : "text-2xl"}`}>
        Blackbird<span className="ml-1 inline-block h-2 w-2 rounded-full bg-[var(--bb-accent)] align-top" />
      </div>
    </div>
  );
}
