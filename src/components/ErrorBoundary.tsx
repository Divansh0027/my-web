import React, { ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, Mail, Phone, HelpCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React exception within Shiv Saya Portal:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    this.setState({ hasError: false, error: null });
    window.location.hash = "";
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans flex items-center justify-center p-6 selection:bg-[#D4AF37]/30">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-[#D4AF37] to-amber-500"></div>
          
          <div className="max-w-xl w-full bg-slate-900 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-red-500/5 blur-3xl"></div>

            {/* Warning Icon Badge */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[#D4AF37] font-semibold text-[10px] tracking-widest uppercase flex items-center gap-1 justify-center">
                  <span>SYSTEM OVERWATCH PROTOCOL</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Portal Render Interruption</h1>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  The client environment encountered an unexpected runtime exception. Our system integrity remains fully secure.
                </p>
              </div>
            </div>

            {/* Error Stack Information */}
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                Technical Reference Logs
              </div>
              <pre className="font-mono text-[10px] text-red-400/90 whitespace-pre-wrap select-text leading-relaxed overflow-x-auto max-h-32 bg-slate-950 p-2 rounded border border-white/5">
                {this.state.error?.name || "ErrorException"}: {this.state.error?.message || "Render pipeline failure"}
                {"\n"}{this.state.error?.stack || ""}
              </pre>
            </div>

            {/* Assistance Contact Card */}
            <div className="p-4 bg-slate-950 border border-[#D4AF37]/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-0.5">
                <h3 className="text-xs font-bold text-white">Direct Advisory Desk</h3>
                <p className="text-[10px] text-slate-450 font-semibold">Immediate manual callback via desk officers</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="tel:+919811451522" 
                  className="p-2 bg-slate-900 border border-white/5 rounded-xl text-[#D4AF37] hover:bg-slate-850 hover:text-white transition-all cursor-pointer"
                  title="Call Hotline"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a 
                  href="mailto:shivsayaproperties@gmail.com" 
                  className="p-2 bg-slate-900 border border-white/5 rounded-xl text-[#D4AF37] hover:bg-slate-850 hover:text-white transition-all cursor-pointer"
                  title="Shoot Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Immediate Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-[#D4AF37] hover:brightness-110 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-md"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <ShieldAlert className="h-4 w-4" />
                Reset Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
