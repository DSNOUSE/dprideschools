import * as React from 'react';

type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

type SocialMediaIconsProps = {
  platforms?: SocialPlatform[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

const socialLinks: Record<SocialPlatform, string> = {
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',
};

export default function SocialMediaIcons({ 
  platforms = ['facebook', 'twitter', 'instagram'], 
  size = 'md',
  className = '' 
}: SocialMediaIconsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {platforms.map((platform) => (
        <a
          key={platform}
          href={socialLinks[platform]}
          target="_blank"
          rel="noopener noreferrer"
          className={`${sizeClasses[size]} bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110`}
          aria-label={`Visit our ${platform} page`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
          </svg>
        </a>
      ))}
    </div>
  );
}
