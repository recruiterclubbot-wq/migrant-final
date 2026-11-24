import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Произошла непредвиденная ошибка интерфейса.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="migrant-card max-w-lg w-full rounded-3xl p-8 text-center">
            <h1 className="text-2xl font-bold text-[#0B224C] mb-3">
              Ошибка загрузки раздела
            </h1>
            <p className="text-sm text-[#3B527A] mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="migrant-btn-primary text-white font-semibold px-6 py-3 rounded-full cursor-pointer"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
