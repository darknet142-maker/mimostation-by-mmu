import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F4FB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-900">Une erreur d'affichage est survenue</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              L'application a détecté une anomalie locale. Vous pouvez réinitialiser l'état local pour restaurer immédiatement l'interface.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-slate-50 rounded-xl text-[10px] text-left text-red-600 overflow-x-auto border border-slate-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-[#0B3A82] text-white font-bold text-sm hover:bg-[#1668E3] transition-colors shadow-md shadow-blue-900/20"
            >
              Réinitialiser & Réafficher l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
