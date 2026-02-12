import type { SVGProps } from 'react';

// Icône de thyroïde
export function ThyroidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Forme de la thyroïde - papillon */}
      <path d="M12 4c-1.5 0-3 1-3.5 2.5C8 8 7 9 5 9c-1.5 0-2.5 1-2.5 2.5S3.5 14 5 14c2 0 3 1 3.5 2.5.5 1.5 2 2.5 3.5 2.5s3-1 3.5-2.5c.5-1.5 1.5-2.5 3.5-2.5 1.5 0 2.5-1 2.5-2.5S20.5 9 19 9c-2 0-3-1-3.5-2.5C15 5 13.5 4 12 4z" />
      <path d="M12 8v8" />
      <path d="M9 12h6" />
    </svg>
  );
}

// Icône d'utérus
export function UterusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Corps de l'utérus */}
      <path d="M12 3c-2.5 0-4.5 1.5-5 4-.3 1.5-.5 3-.5 4.5 0 3 1 6 2.5 8 .5.7 1.5 1.5 3 1.5s2.5-.8 3-1.5c1.5-2 2.5-5 2.5-8 0-1.5-.2-3-.5-4.5-.5-2.5-2.5-4-5-4z" />
      {/* Col de l'utérus */}
      <path d="M12 21v2" />
      {/* Trompes */}
      <path d="M7 11c-2 0-3.5 1.5-3.5 3.5S5 18 7 18" />
      <path d="M17 11c2 0 3.5 1.5 3.5 3.5S19 18 17 18" />
    </svg>
  );
}

// Icône de dent
export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z" />
    </svg>
  );
}

// Icône d'éprouvette (Hématologie)
export function TestTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Corps de l'éprouvette */}
      <path d="M8 3h8v2H8z" />
      <path d="M9 5v14c0 1.5 1.5 3 3 3s3-1.5 3-3V5" />
      {/* Bord supérieur */}
      <path d="M8 5h8" />
      {/* Liquide à l'intérieur */}
      <path d="M10 12h4" />
      <path d="M10 15h4" />
    </svg>
  );
}

// Icône de femme enceinte (Gynécologie)
export function PregnantWomanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Tête */}
      <circle cx="12" cy="4" r="2.5" />
      {/* Corps avec ventre arrondi */}
      <path d="M12 7c-2 0-3.5 1-4 2.5-.3.8-.5 1.5-.5 2 0 2 1 3.5 2.5 4.5.8.5 1.5 1 2 1.5" />
      <path d="M12 7c2 0 3.5 1 4 2.5.3.8.5 1.5.5 2 0 2-1 3.5-2.5 4.5-.8.5-1.5 1-2 1.5" />
      {/* Ventre */}
      <ellipse cx="12" cy="13" rx="3.5" ry="4" />
      {/* Jambes */}
      <path d="M10 17v4" />
      <path d="M14 17v4" />
      {/* Bras */}
      <path d="M8 10c-1 0-2 .5-2 1.5" />
      <path d="M16 10c1 0 2 .5 2 1.5" />
    </svg>
  );
}
