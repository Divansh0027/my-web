/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */



interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <img 
      src="/logo.svg" 
      alt="Shiv Saya" 
      width={size} 
      height={size} 
      className={className} 
    loading="lazy" />
  );
}
