import { ExternalLink } from 'lucide-react';
import h2hLogo from '../../assets/h2h-logo-light.png';

export const H2HFooter = () => {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <img src={h2hLogo} alt="The H2H Experiment" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">The H2H Experiment</span>
              <span className="text-xs text-muted-foreground">Human to Human Leadership</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://theh2hexperiment.com/about-us" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              About Us
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://theh2hexperiment.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>© {new Date().getFullYear()} The H2H Experiment</p>
            <p className="mt-1">FlowOS is part of the H2H Inner Lab</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
