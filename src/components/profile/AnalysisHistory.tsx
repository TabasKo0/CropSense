import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download, Eye, Satellite, Activity, Leaf, Bug, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LogEntry {
  id: string;
  type: string;
  log: string;
  uuid: string;
  created_at: string;
}

interface ParsedLog {
  id: string;
  type: 'crop-recommendation' | 'disease-detection' | 'yield-prediction';
  parameters: any;
  response: any;
  status: 'success' | 'error';
  timestamp: string;
  formattedLog: string;
}

const AnalysisHistory = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ParsedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Use direct API call for logs
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/logs/user/${user.id}`);
        const result = await response.json();
        
        if (result.success) {
          const parsedLogs = result.logs.map(parseLogEntry);
          setLogs(parsedLogs);
        } else {
          setError(result.error || 'Failed to load analysis history');
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const parseLogEntry = (logEntry: LogEntry): ParsedLog => {
    const isError = logEntry.log.includes('ERROR');
    let parameters = {};
    let response = {};
    
    try {
      // Extract parameters and response from formatted log
      const logText = logEntry.log;
      
      // Extract parameters
      const paramMatch = logText.match(/Parameters:\\n([\\s\\S]*?)\\n\\nResponse:|Parameters:\\n([\\s\\S]*?)\\n\\nError:/);
      if (paramMatch) {
        const paramText = paramMatch[1] || paramMatch[2];
        try {
          parameters = JSON.parse(paramText);
        } catch {
          parameters = { raw: paramText };
        }
      }
      
      // Extract response
      const responseMatch = logText.match(/Response:\\n([\\s\\S]*?)\\n\\nTimestamp:|Error:\\n([\\s\\S]*?)\\n\\nTimestamp:/);
      if (responseMatch) {
        const responseText = responseMatch[1] || responseMatch[2];
        try {
          response = JSON.parse(responseText);
        } catch {
          response = { raw: responseText };
        }
      }
    } catch (error) {
      console.error('Error parsing log entry:', error);
    }
    
    return {
      id: logEntry.id,
      type: logEntry.type as any,
      parameters,
      response,
      status: isError ? 'error' : 'success',
      timestamp: logEntry.created_at,
      formattedLog: logEntry.log
    };
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'crop-recommendation':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'yield-prediction':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'disease-detection':
        return <Bug className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crop-recommendation':
        return 'Crop Recommendation';
      case 'disease-detection':
        return 'Disease Detection';
      case 'yield-prediction':
        return 'Yield Prediction';
      default:
        return 'Analysis';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisTitle = (log: ParsedLog) => {
    switch (log.type) {
      case 'crop-recommendation':
        return 'Crop Recommendation Analysis';
      case 'disease-detection':
        return 'Disease Detection Analysis';
      case 'yield-prediction':
        return 'Yield Prediction Analysis';
      default:
        return 'Analysis';
    }
  };

  const formatParameters = (parameters: any, type: string) => {
    if (!parameters || typeof parameters !== 'object') return [];
    
    switch (type) {
      case 'crop-recommendation':
        return [
          `Nitrogen: ${parameters.nitrogen || 'N/A'}`,
          `Phosphorus: ${parameters.phosphorus || 'N/A'}`,
          `Potassium: ${parameters.potassium || 'N/A'}`,
          `Temperature: ${parameters.temperature || 'N/A'}°C`,
          `Humidity: ${parameters.humidity || 'N/A'}%`,
          `pH: ${parameters.ph || 'N/A'}`,
          `Rainfall: ${parameters.rainfall || 'N/A'}mm`
        ];
      case 'disease-detection':
        return [
          `Image: ${parameters.imageName || 'Unknown'}`,
          `Size: ${parameters.imageSize ? (parameters.imageSize / 1024).toFixed(2) + ' KB' : 'Unknown'}`,
          `Type: ${parameters.imageType || 'Unknown'}`
        ];
      case 'yield-prediction':
        return [
          `State: ${parameters.state || 'N/A'}`,
          `Crop: ${parameters.crop || 'N/A'}`,
          `Season: ${parameters.season || 'N/A'}`,
          `Area: ${parameters.area_acres || 'N/A'} acres`,
          `Production: ${parameters.production_bags || 'N/A'} bags`,
          `Rainfall: ${parameters.rainfall || 'N/A'}mm`
        ];
      default:
        return Object.entries(parameters).map(([key, value]) => `${key}: ${value}`);
    }
  };

  const formatResponse = (response: any, type: string) => {
    if (!response || typeof response !== 'object') return 'No response';
    
    switch (type) {
      case 'crop-recommendation':
        return response.output || 'No recommendation';
      case 'disease-detection':
        return response.output || 'No detection result';
      case 'yield-prediction':
        return response.prediction || 'No prediction';
      default:
        return JSON.stringify(response, null, 2);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analysis history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analysis History ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analysis history found</p>
            <p className="text-sm text-muted-foreground">Start using the crop analysis tools to see your history here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getAnalysisIcon(log.type)}
                      <h4 className="font-medium text-foreground">{getAnalysisTitle(log)}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{getTypeLabel(log.type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className={`font-medium ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.status === 'success' ? 'Completed' : 'Failed'}
                    </p>
                  </div>
                </div>

                {/* Parameters */}
                <div className="space-y-2 mb-4">
                  <h5 className="text-sm font-medium text-foreground">Parameters:</h5>
                  <div className="flex flex-wrap gap-2">
                    {formatParameters(log.parameters, log.type).map((param, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">
                    {log.status === 'success' ? 'Result:' : 'Error:'}
                  </h5>
                  <div className={`p-3 rounded-md text-sm ${log.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {formatResponse(log.response, log.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h5 className="font-medium text-foreground mb-3">Analysis Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(l => l.status === 'success').length}
                </p>
                <p className="text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.status === 'error').length}
                </p>
                <p className="text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {logs.length}
                </p>
                <p className="text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;