import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base text-primary font-sans flex items-center justify-center p-6">
          <div className="bg-white/5 border border-love/30 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-love/10 blur-[64px] rounded-full -z-10 pointer-events-none" />
            
            <div className="w-16 h-16 bg-love/10 text-love rounded-2xl flex items-center justify-center mb-6 border border-love/20">
              <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Ops! Algo deu errado</h1>
            
            <p className="text-subtle text-sm mb-6 max-w-[280px]">
              Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
            </p>

            {this.state.error && (
              <div className="w-full bg-black/40 rounded-xl p-4 mb-8 overflow-auto text-left border border-overlay/50">
                <code className="text-xs text-rose text-opacity-80 font-mono whitespace-pre-wrap">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full h-12"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} className="mr-2" />
              Recarregar Aplicação
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
