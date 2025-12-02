import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { StatusMessage } from '../hooks/useStatusMessages';

export function StatusDisplay({ messages }: { messages: StatusMessage[] }) {
  if (messages.length === 0) return null;

  const getIcon = (type: StatusMessage['type'], text: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        if (/^(Generating|Preparing|Waiting)/i.test(text)) {
          return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
        }
        if (/^(Transaction hash|Survey ID|Total Reward|Target Responses)/i.test(text)) {
          return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Transaction Status:</h3>
      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2">
            <div className="mt-0.5 flex-shrink-0">
              {getIcon(message.type, message.text)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 font-mono break-all">
                {message.text}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
