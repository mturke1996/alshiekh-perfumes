import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // يمكنك هنا إرسال الخطأ إلى خدمة تتبع الأخطاء مثل Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // يمكن تخصيص واجهة الخطأ
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="text-red-600" size={48} />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              عذراً، حدث خطأ ما!
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-8">
              نعتذر عن هذا الإزعاج. حدث خطأ غير متوقع أثناء تحميل الصفحة.
            </p>

            {/* Error Details (في وضع التطوير فقط) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-right mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                <summary className="cursor-pointer font-bold text-red-900 mb-4">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-semibold text-red-800 mb-2">رسالة الخطأ:</p>
                    <code className="block bg-white p-4 rounded-lg text-sm text-red-900 overflow-auto">
                      {this.state.error.toString()}
                    </code>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="font-semibold text-red-800 mb-2">تتبع المكونات:</p>
                      <code className="block bg-white p-4 rounded-lg text-sm text-red-900 overflow-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </code>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCcw size={24} />
                <span>إعادة المحاولة</span>
              </button>

              <Link
                to="/"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-900 rounded-full font-bold text-lg hover:bg-gray-200 transition-all"
              >
                <Home size={24} />
                <span>العودة للرئيسية</span>
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-gray-500 text-sm mt-8">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

