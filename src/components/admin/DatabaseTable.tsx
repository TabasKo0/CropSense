import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DatabaseTableProps {
  tableName: string;
}

interface TableData {
  [key: string]: any;
}

// Mock data for demonstration
const mockData: { [key: string]: TableData[] } = {
  users: [
    {
      id: "1",
      username: "john_doe",
      email: "john@example.com",
      password_hash: "hashed_password_123",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      last_login: "2024-01-20T14:22:00Z",
      is_active: true,
      email_verified: true
    },
    {
      id: "2",
      username: "jane_smith",
      email: "jane@example.com",
      password_hash: "hashed_password_456",
      created_at: "2024-01-16T11:15:00Z",
      updated_at: "2024-01-16T11:15:00Z",
      last_login: "2024-01-21T09:45:00Z",
      is_active: true,
      email_verified: false
    }
  ],
  profiles: [
    {
      id: "1",
      user_id: "1",
      full_name: "John Doe",
      phone: "+1234567890",
      role: "farmer",
      theme_preference: "light",
      preferred_language: "en",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      user_id: "2",
      full_name: "Jane Smith",
      phone: "+1987654321",
      role: "agronomist",
      theme_preference: "dark",
      preferred_language: "en",
      created_at: "2024-01-16T11:15:00Z",
      updated_at: "2024-01-16T11:15:00Z"
    }
  ],
  reports: [
    {
      id: "1",
      user_id: "1",
      title: "Pest infestation in corn field",
      description: "Observed significant pest damage in the north section of the corn field.",
      severity: "high",
      status: "open",
      location: "Field A, Section North",
      incident_date: "2024-01-20T00:00:00Z",
      created_at: "2024-01-20T08:30:00Z",
      updated_at: "2024-01-20T08:30:00Z",
      is_anonymous: false
    }
  ],
  proctors: [
    {
      id: "1",
      user_id: "2",
      profile_id: "2",
      name: "Jane Smith",
      specializations: ["crop_diseases", "soil_analysis"],
      status: "active",
      rating: 4.8,
      total_cases: 15,
      background_check_completed: true,
      training_completed: true,
      created_at: "2024-01-16T11:15:00Z",
      updated_at: "2024-01-16T11:15:00Z"
    }
  ],
  chat_messages: [
    {
      id: "1",
      chat_room_id: "room_1",
      sender_id: "1",
      sender_type: "user",
      content: "Hello, I need help with my crop analysis",
      message_type: "text",
      created_at: "2024-01-20T10:30:00Z",
      updated_at: "2024-01-20T10:30:00Z",
      read_at: null
    }
  ],
  audit_logs: [
    {
      id: "1",
      user_id: "1",
      action: "login",
      target_type: "user",
      target_id: "1",
      details: { ip: "192.168.1.1", user_agent: "Mozilla/5.0..." },
      created_at: "2024-01-20T14:22:00Z"
    }
  ],
  match_logs: [
    {
      id: "1",
      report_id: "1",
      proctor_id: "1",
      confidence_score: 0.95,
      reason: "High expertise match in crop diseases",
      created_at: "2024-01-20T09:00:00Z"
    }
  ]
};

const DatabaseTable = ({ tableName }: DatabaseTableProps) => {
  const [data, setData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTableData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tableData = mockData[tableName] || [];
      
      if (tableData.length > 0) {
        setData(tableData);
        setColumns(Object.keys(tableData[0]));
      } else {
        setData([]);
        setColumns([]);
      }
    } catch (err) {
      console.error('Error loading table data:', err);
      setError(`Failed to load table: ${tableName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [tableName]);

  const handleCellClick = (rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(currentValue?.toString() || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { row, column } = editingCell;

    setSaving(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Process the value based on type
      let processedValue = editValue;
      
      if (editValue === "" || editValue === "null") {
        processedValue = null;
      } else if (editValue === "true" || editValue === "false") {
        processedValue = editValue === "true";
      } else if (!isNaN(Number(editValue)) && editValue !== "") {
        processedValue = Number(editValue);
      }

      // Update local state (simulating database update)
      const newData = [...data];
      newData[row] = { ...newData[row], [column]: processedValue };
      setData(newData);
      
      // Update mock data
      if (mockData[tableName]) {
        mockData[tableName] = newData;
      }
      
      toast.success("Record updated successfully");
      setEditingCell(null);
    } catch (err) {
      console.error('Error updating record:', err);
      toast.error("Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleDeleteRecord = async (rowIndex: number) => {
    const record = data[rowIndex];
    const recordId = record.id;

    if (!recordId) {
      toast.error("Cannot delete record without ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove from local state
      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
      
      // Update mock data
      if (mockData[tableName]) {
        mockData[tableName] = newData;
      }
      
      toast.success("Record deleted successfully");
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error("Failed to delete record");
    }
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return <Badge variant="outline">null</Badge>;
    if (typeof value === 'boolean') return <Badge variant={value ? "default" : "secondary"}>{value.toString()}</Badge>;
    if (typeof value === 'object') return <Badge variant="outline">object</Badge>;
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
    return value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading {tableName} data...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No data found in {tableName} table
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{data.length} records</Badge>
          <Button size="sm" variant="outline" onClick={loadTableData}>
            Refresh
          </Button>
        </div>
        <Badge variant="secondary">Demo Mode - Mock Data</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="min-w-32 font-medium">
                    {column}
                  </TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={row.id || rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column} className="p-2">
                      {editingCell?.row === rowIndex && editingCell?.column === column ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit} 
                            disabled={saving}
                            className="h-8 w-8 p-0"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded text-xs min-h-6 flex items-center"
                          onClick={() => handleCellClick(rowIndex, column, row[column])}
                          title="Click to edit"
                        >
                          {formatCellValue(row[column])}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRecord(rowIndex)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTable;