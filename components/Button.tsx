import { forwardRef } from 'react';
import s from './Button.module.css';

type Props = {
  href?: string;
  label: string;
  variant?: 'blur' | 'outline';
  className?: string;
  onClick?: () => void;
} & Record<`data-${string}`, string | undefined>;

export const Button = forwardRef<HTMLAnchorElement & HTMLButtonElement, Props>(function Button(
  { href, label, variant = 'outline', className = '', onClick, ...rest },
  ref,
) {
  const cls = `${s.cta} ${s[variant]} ${className}`;
  if (href)
    return (
      <a ref={ref} href={href} className={cls} {...rest}>
        {label}
      </a>
    );
  return (
    <button ref={ref} type="button" className={cls} onClick={onClick} {...rest}>
      {label}
    </button>
  );
});
