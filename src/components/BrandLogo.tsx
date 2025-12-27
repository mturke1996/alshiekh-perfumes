import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'icon' | 'full' | 'text' | 'light';
  className?: string;
}

export default function BrandLogo({ 
  size = 'md', 
  showText = false,
  variant = 'icon',
  className = ''
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const iconSize = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const LogoIcon = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg relative overflow-hidden ${className}`}
    >
      <img 
        src="/assets/pp.png" 
        alt="ALSHIEKH PARFUMES Logo"
        className="w-full h-full object-contain rounded-full"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}
        onError={(e) => {
          // Fallback if image doesn't load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <span style="font-family: 'Playfair Display', serif; font-weight: bold; color: #D4AF37; letter-spacing: -0.1em;">
                SH
              </span>
            `;
          }
        }}
      />
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
    </motion.div>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <LogoIcon />
        {showText && (
          <div className="text-center">
            <h1 className="text-sm font-bold bg-gradient-to-r from-brand-maroon-600 to-brand-gold-600 bg-clip-text text-transparent">
              ALSHIEKH PARFUMES
            </h1>
            <p className="text-xs text-gray-500">الشيخ للعطور</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoIcon />
        {showText && (
          <div>
            <h1 className={`font-bold bg-gradient-to-r from-brand-maroon-600 to-brand-gold-600 bg-clip-text text-transparent ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 
              size === 'lg' ? 'text-base' : 'text-lg'
            }`}>
              ALSHIEKH PARFUMES
            </h1>
            <p className={`text-gray-500 ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-xs' : 
              size === 'lg' ? 'text-sm' : 'text-base'
            }`}>
              الشيخ للعطور
            </p>
          </div>
        )}
      </div>
    );
  }

  // Light variant (for dark backgrounds)
  if (variant === 'light') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoIcon />
        {showText && (
          <div>
            <h1 className={`font-bold text-white ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 
              size === 'lg' ? 'text-base' : 'text-lg'
            }`}>
              ALSHIEKH PARFUMES
            </h1>
            <p className={`text-gray-400 ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-xs' : 
              size === 'lg' ? 'text-sm' : 'text-base'
            }`}>
              الشيخ للعطور
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

