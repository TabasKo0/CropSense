/**
 * Logging Service for Model API Calls
 *
 * EDITABLE LOG TYPES - Change these constants as needed:
 */
export const LOG_TYPES = {
  CROP_RECOMMENDATION: 'crop_recommendation',
  DISEASE_DETECTION: 'disease_detection',
  YIELD_PREDICTION: 'yield_prediction',
  WEATHER_API: 'weather_api',
  GENERAL_ERROR: 'general_error'
} as const;

export type LogType = typeof LOG_TYPES[keyof typeof LOG_TYPES];

export interface ModelLog {
  id?: string;
  type: LogType;
  timestamp: string;
  parameters: Record<string, any>;
  response: Record<string, any> | string;
  status: 'success' | 'error';
  duration?: number; // in milliseconds
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

/**
 * Logging Service Class
 */
class LoggingService {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = 'http://127.0.0.1:5000'; // Backend URL
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format log data for clean display
   */
  private formatLogData(log: ModelLog): ModelLog {
    return {
      ...log,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      // Format parameters for better readability
      parameters: this.formatParameters(log.parameters),
      // Format response for better readability
      response: this.formatResponse(log.response)
    };
  }

  /**
   * Format parameters object for display
   */
  private formatParameters(params: Record<string, any>): Record<string, any> {
    const formatted = { ...params };

    // Format file objects specially
    Object.keys(formatted).forEach(key => {
      if (formatted[key] instanceof File) {
        formatted[key] = {
          name: formatted[key].name,
          size: formatted[key].size,
          type: formatted[key].type,
          lastModified: new Date(formatted[key].lastModified).toISOString()
        };
      }
    });

    return formatted;
  }

  /**
   * Format response for display
   */
  private formatResponse(response: Record<string, any> | string): Record<string, any> | string {
    if (typeof response === 'string') {
      return response;
    }

    // If response is an object, format it nicely
    if (typeof response === 'object' && response !== null) {
      return {
        ...response,
        // Add any special formatting here
        _formatted: true
      };
    }

    return response;
  }

  /**
   * Send log to backend API
   */
  async logModelCall(logData: Omit<ModelLog, 'id' | 'timestamp' | 'userAgent' | 'sessionId'>): Promise<void> {
    const startTime = Date.now();

    try {
      const completeLog: ModelLog = {
        ...logData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        duration: Date.now() - startTime
      };

      const formattedLog = this.formatLogData(completeLog);

      const response = await fetch(`${this.baseUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedLog)
      });

      if (!response.ok) {
        console.warn('Failed to send log to backend:', response.status);
      } else {
        console.log(`📝 Log sent successfully: ${logData.type}`);
      }
    } catch (error) {
      console.warn('Logging service error:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  /**
   * Log a successful model call
   */
  async logSuccess(
    type: LogType,
    parameters: Record<string, any>,
    response: Record<string, any> | string,
    duration?: number
  ): Promise<void> {
    await this.logModelCall({
      type,
      parameters,
      response,
      status: 'success',
      duration
    });
  }

  /**
   * Log a failed model call
   */
  async logError(
    type: LogType,
    parameters: Record<string, any>,
    error: string | Error,
    duration?: number
  ): Promise<void> {
    await this.logModelCall({
      type,
      parameters,
      response: typeof error === 'string' ? error : error.message,
      status: 'error',
      duration
    });
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Export utility functions for easy logging
export const logModelSuccess = (
  type: LogType,
  parameters: Record<string, any>,
  response: Record<string, any> | string,
  duration?: number
) => loggingService.logSuccess(type, parameters, response, duration);

export const logModelError = (
  type: LogType,
  parameters: Record<string, any>,
  error: string | Error,
  duration?: number
) => loggingService.logError(type, parameters, error, duration);