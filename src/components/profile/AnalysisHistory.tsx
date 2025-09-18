import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download, Eye, Satellite, Activity } from "lucide-react";

interface Analysis {
  id: string;
  title: string;
  type: 'crop-health' | 'yield-prediction' | 'soil-analysis' | 'weather-forecast' | 'pest-detection';
  status: 'completed' | 'processing' | 'failed';
  accuracy: number;
  date: string;
  location: string;
  cropType: string;
  insights: number;
}

const AnalysisHistory = () => {
  // Dummy data for analysis history
  const analysisHistory: Analysis[] = [
    {
      id: 'AH001',
      title: 'Crop Health Assessment - North Field',
      type: 'crop-health',
      status: 'completed',
      accuracy: 94.5,
      date: '2024-12-15',
      location: 'North Field, Farm Block A',
      cropType: 'Tomatoes',
      insights: 8
    },
    {
      id: 'AH002',
      title: 'Yield Prediction Analysis',
      type: 'yield-prediction',
      status: 'completed',
      accuracy: 89.2,
      date: '2024-12-12',
      location: 'South Field, Farm Block B',
      cropType: 'Wheat',
      insights: 12
    },
    {
      id: 'AH003',
      title: 'Soil Nutrient Analysis',
      type: 'soil-analysis',
      status: 'processing',
      accuracy: 0,
      date: '2024-12-18',
      location: 'East Field, Farm Block C',
      cropType: 'Corn',
      insights: 0
    },
    {
      id: 'AH004',
      title: 'Pest Detection Scan',
      type: 'pest-detection',
      status: 'completed',
      accuracy: 91.8,
      date: '2024-12-10',
      location: 'West Field, Farm Block D',
      cropType: 'Rice',
      insights: 6
    },
    {
      id: 'AH005',
      title: 'Weather Impact Forecast',
      type: 'weather-forecast',
      status: 'failed',
      accuracy: 0,
      date: '2024-12-08',
      location: 'Central Field, Farm Block E',
      cropType: 'Soybeans',
      insights: 0
    },
    {
      id: 'AH006',
      title: 'Multi-Crop Health Analysis',
      type: 'crop-health',
      status: 'completed',
      accuracy: 96.3,
      date: '2024-12-05',
      location: 'Multiple Fields',
      cropType: 'Mixed Vegetables',
      insights: 15
    }
  ];

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'crop-health':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'yield-prediction':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'soil-analysis':
        return <BarChart3 className="h-4 w-4 text-orange-500" />;
      case 'weather-forecast':
        return <Satellite className="h-4 w-4 text-purple-500" />;
      case 'pest-detection':
        return <Eye className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crop-health':
        return 'Crop Health';
      case 'yield-prediction':
        return 'Yield Prediction';
      case 'soil-analysis':
        return 'Soil Analysis';
      case 'weather-forecast':
        return 'Weather Forecast';
      case 'pest-detection':
        return 'Pest Detection';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analysis History ({analysisHistory.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysisHistory.map((analysis) => (
            <div key={analysis.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getAnalysisIcon(analysis.type)}
                    <h4 className="font-medium text-foreground">{analysis.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.location} • {analysis.cropType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(analysis.status)}>
                    {analysis.status}
                  </Badge>
                  {analysis.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{getTypeLabel(analysis.type)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{formatDate(analysis.date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>
                  <p className={`font-medium ${getAccuracyColor(analysis.accuracy)}`}>
                    {analysis.status === 'completed' ? `${analysis.accuracy}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Insights:</span>
                  <p className="font-medium">
                    {analysis.status === 'completed' ? analysis.insights : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Key Insights Preview (dummy data) */}
              {analysis.status === 'completed' && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">Key Insights:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.type === 'crop-health' && (
                      <>
                        <Badge variant="outline" className="text-xs">Overall Health: Good</Badge>
                        <Badge variant="outline" className="text-xs">Growth Rate: +12%</Badge>
                        <Badge variant="outline" className="text-xs">Disease Risk: Low</Badge>
                      </>
                    )}
                    {analysis.type === 'yield-prediction' && (
                      <>
                        <Badge variant="outline" className="text-xs">Expected Yield: 4.2 tons/ha</Badge>
                        <Badge variant="outline" className="text-xs">Quality Score: 8.5/10</Badge>
                        <Badge variant="outline" className="text-xs">Harvest Date: Est. Jan 15</Badge>
                      </>
                    )}
                    {analysis.type === 'soil-analysis' && (
                      <>
                        <Badge variant="outline" className="text-xs">pH Level: 6.8</Badge>
                        <Badge variant="outline" className="text-xs">Nitrogen: Adequate</Badge>
                        <Badge variant="outline" className="text-xs">Moisture: 45%</Badge>
                      </>
                    )}
                    {analysis.type === 'pest-detection' && (
                      <>
                        <Badge variant="outline" className="text-xs">Pests Detected: 2 types</Badge>
                        <Badge variant="outline" className="text-xs">Severity: Moderate</Badge>
                        <Badge variant="outline" className="text-xs">Treatment: Recommended</Badge>
                      </>
                    )}
                    {analysis.type === 'weather-forecast' && (
                      <>
                        <Badge variant="outline" className="text-xs">Risk Level: Medium</Badge>
                        <Badge variant="outline" className="text-xs">Rain Probability: 65%</Badge>
                        <Badge variant="outline" className="text-xs">Action Required: Yes</Badge>
                      </>
                    )}
                  </div>
                </div>
              )}

              {analysis.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Analysis in progress...</span>
                </div>
              )}

              {analysis.status === 'failed' && (
                <div className="text-sm text-destructive">
                  Analysis failed. Please try again or contact support.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t">
          <h5 className="font-medium text-foreground mb-3">Analysis Summary</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {analysisHistory.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {analysisHistory.filter(a => a.status === 'processing').length}
              </p>
              <p className="text-muted-foreground">Processing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {analysisHistory.filter(a => a.status === 'completed').reduce((acc, a) => acc + a.accuracy, 0) / analysisHistory.filter(a => a.status === 'completed').length || 0}%
              </p>
              <p className="text-muted-foreground">Avg Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {analysisHistory.filter(a => a.status === 'completed').reduce((acc, a) => acc + a.insights, 0)}
              </p>
              <p className="text-muted-foreground">Total Insights</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;