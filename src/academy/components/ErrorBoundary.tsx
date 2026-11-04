import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; message?: string; }

/** Evita que um erro de render derrube a aplicação inteira (react-expert: error boundaries). */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(err: unknown) {
    // Em produção, enviaria para um coletor de erros (Sentry etc.).
    console.error('[CyberShield] erro de render:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="m-6 rounded-md border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-200">
          <AlertTriangle className="mx-auto mb-2" aria-hidden="true" />
          <p className="font-semibold">Algo quebrou ao renderizar esta tela.</p>
          {this.state.message && <p className="mt-1 font-mono text-xs text-rose-300/80">{this.state.message}</p>}
          <button onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-500/20 transition-colors">
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
