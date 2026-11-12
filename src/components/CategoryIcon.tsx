import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Home,
  ShoppingCart,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CATEGORIES_META } from '../data/mockData';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
  withBackground?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 18,
  className = '',
  withBackground = false,
}) => {
  const meta = CATEGORIES_META[category] || {
    icon: 'Tag',
    color: '#64748b',
    type: 'expense',
  };

  const getIcon = () => {
    switch (meta.icon) {
      case 'Utensils':
        return <Utensils size={size} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} />;
      case 'Car':
        return <Car size={size} />;
      case 'Zap':
        return <Zap size={size} />;
      case 'Home':
        return <Home size={size} />;
      case 'ShoppingCart':
        return <ShoppingCart size={size} />;
      case 'Film':
        return <Film size={size} />;
      case 'HeartPulse':
        return <HeartPulse size={size} />;
      case 'GraduationCap':
        return <GraduationCap size={size} />;
      case 'Briefcase':
        return <Briefcase size={size} />;
      case 'Laptop':
        return <Laptop size={size} />;
      case 'TrendingUp':
        return <TrendingUp size={size} />;
      default:
        return <Tag size={size} />;
    }
  };

  if (withBackground) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl p-2.5 transition-transform hover:scale-105 ${className}`}
        style={{
          backgroundColor: `${meta.color}15`,
          color: meta.color,
        }}
      >
        {getIcon()}
      </div>
    );
  }

  return (
    <span style={{ color: meta.color }} className={`inline-flex items-center justify-center ${className}`}>
      {getIcon()}
    </span>
  );
};

export const PaymentMethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const getBadgeStyle = () => {
    switch (method) {
      case 'UPI':
        return {
          icon: <Smartphone size={12} className="mr-1 text-emerald-600 dark:text-emerald-400" />,
          label: 'UPI',
          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'Card':
        return {
          icon: <CreditCard size={12} className="mr-1 text-purple-600 dark:text-purple-400" />,
          label: 'Card',
          classes: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'Bank':
        return {
          icon: <Building2 size={12} className="mr-1 text-blue-600 dark:text-blue-400" />,
          label: 'Netbanking',
          classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'Cash':
        return {
          icon: <Banknote size={12} className="mr-1 text-amber-600 dark:text-amber-400" />,
          label: 'Cash',
          classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          icon: <Tag size={12} className="mr-1 text-slate-500" />,
          label: method,
          classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getBadgeStyle();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.classes}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
