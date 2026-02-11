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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Couronne de la dent - forme plus moderne et arrondie */}
      <path d="M12 3c-1.5 0-2.8.6-3.5 1.5-.4.5-.7 1.1-.8 1.7-.1.6-.1 1.2 0 1.8.2 1.2.6 2.2 1.2 3 .3.4.7.8 1.1 1.1.2.2.5.4.8.5.3.1.6.2 1 .2h1.2c.4 0 .7-.1 1-.2.3-.1.6-.3.8-.5.4-.3.8-.7 1.1-1.1.6-.8 1-1.8 1.2-3 .1-.6.1-1.2 0-1.8-.1-.6-.4-1.2-.8-1.7C14.8 3.6 13.5 3 12 3z" />
      {/* Surface de mastication avec détails */}
      <path d="M9 8c0 .5.2 1 .5 1.3.3.3.7.5 1.2.5h2.6c.5 0 .9-.2 1.2-.5.3-.3.5-.8.5-1.3" />
      {/* Racines - deux racines principales */}
      <path d="M10 18c0 1.5.5 2.5 1.5 2.5s1.5-1 1.5-2.5" />
      <path d="M13 18c0 1.5.5 2.5 1.5 2.5s1.5-1 1.5-2.5" />
      {/* Ligne de séparation entre couronne et racines */}
      <path d="M9 17h6" />
      {/* Détails sur la couronne */}
      <path d="M10.5 11h3" />
      <path d="M11 13h2" />
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
