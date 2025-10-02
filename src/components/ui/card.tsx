// import * as React from 'react';

// import { cn } from '@/lib/utils';

// const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn('rounded-2xl border-0 bg-white/90 backdrop-blur-lg text-card-foreground shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]', className)} {...props} />
// ));
// Card.displayName = 'Card';

// const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn('flex flex-col space-y-2 p-6 pb-4', className)} {...props} />
// ));
// CardHeader.displayName = 'CardHeader';

// const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
//   <h3 ref={ref} className={cn('text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent', className)} {...props} />
// ));
// CardTitle.displayName = 'CardTitle';

// const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
//   ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-slate-600 dark:text-slate-400', className)} {...props} />
// );
// CardDescription.displayName = 'CardDescription';

// const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn('p-6 pt-2', className)} {...props} />
// ));
// CardContent.displayName = 'CardContent';

// const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
// ));
// CardFooter.displayName = 'CardFooter';

// export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      'rounded-xl bg-white/95 backdrop-blur-sm text-card-foreground',
      'transition-all duration-200 hover:bg-white/100',
      className
    )} 
    {...props} 
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-2 p-6 pb-3', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 
    ref={ref} 
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight text-gray-900',
      'dark:text-white',
      className
    )} 
    {...props} 
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        'text-sm text-gray-600 leading-relaxed',
        'dark:text-gray-300',
        className
      )} 
      {...props} 
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-2', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-3', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };