interface UdyogLogoProps {
  size?: number;
  decorative?: boolean;
}

export function UdyogLogo({ size = 48, decorative = false }: UdyogLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {!decorative && <title>উদ্যোগ (UDYOG) লোগো</title>}
      {/* Left green U-curve & leaf */}
      <path
        d="M11 16C11 16 18 19 20 27V39C20 44.5 24 48 29 48C32 48 34.5 46.8 36 45L41 51C37.5 54.5 33 56 28 56C17.5 56 10 48.5 10 38V18C10 16.9 10.4 16 11 16Z"
        fill="#0B5D2A"
      />
      {/* Light green inner accent leaf */}
      <path
        d="M23 21C27 23 30 28 30 34V42C26.5 42 23 39 23 35V21Z"
        fill="#4CAF50"
      />
      {/* Orange/Gold rising growth arrow forming right side of U */}
      <path
        d="M44 8L57 22H48V38C48 48 41 55 31 56C37 52 40 46 40 38V22H31L44 8Z"
        fill="#E58E26"
      />
    </svg>
  );
}
