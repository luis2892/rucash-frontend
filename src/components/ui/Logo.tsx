interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  light?: boolean;
}

const sizes = {
  xs: { icon: 24, text: 'text-base' },
  sm: { icon: 32, text: 'text-lg' },
  md: { icon: 40, text: 'text-xl' },
  lg: { icon: 52, text: 'text-2xl' },
  xl: { icon: 72, text: 'text-3xl' },
};

// Isotipo "R" bicolor — fiel al logo adjunto
export const RucashIcon = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Fondo redondeado navy */}
    <rect width="100" height="100" rx="22" fill="#172B4D" />
    {/* Letra R — trazo izquierdo teal */}
    <path
      d="M25 20 L25 80"
      stroke="#00C9A7"
      strokeWidth="12"
      strokeLinecap="round"
    />
    {/* Arco superior del R — navy claro */}
    <path
      d="M25 20 L55 20 Q75 20 75 38 Q75 56 55 56 L25 56"
      stroke="white"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Pata diagonal del R */}
    <path
      d="M50 56 L75 80"
      stroke="white"
      strokeWidth="10"
      strokeLinecap="round"
    />
  </svg>
);

export const Logo = ({ size = 'md', variant = 'full', className = '', light = false }: LogoProps) => {
  const { icon, text } = sizes[size];

  if (variant === 'icon') {
    return <RucashIcon size={icon} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <RucashIcon size={icon} />
      <div className="flex flex-col leading-tight">
        <span className={`font-extrabold tracking-tight ${text} ${light ? 'text-white' : 'text-navy-700'}`}>
          RUCASH
        </span>
        {size !== 'xs' && (
          <span className={`text-xs font-medium ${light ? 'text-white/60' : 'text-slate-400'}`}>
            Tu RUC, Tu Negocio
          </span>
        )}
      </div>
    </div>
  );
};
