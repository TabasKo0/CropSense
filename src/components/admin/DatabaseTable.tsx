import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Save, X, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseTableProps {
  tableName: string;
}

interface TableData {
  [key: string]: any;
}

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
      
      // Fetch data from Supabase
      const { data: tableData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to 100 records for performance
      
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        setError(`Failed to load table: ${fetchError.message}`);
        return;
      }
      
      if (tableData && tableData.length > 0) {
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
    // Don't allow editing of id, created_at, updated_at columns
    if (column === 'id' || column === 'created_at' || column === 'updated_at') {
      return;
    }
    setEditingCell({ row: rowIndex, column });
    setEditValue(currentValue?.toString() || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { row, column } = editingCell;
    const record = data[row];

    if (!record.id) {
      toast.error("Cannot update record without ID");
      return;
    }

    setSaving(true);

    try {
      // Process the value based on type
      let processedValue = editValue;
      
      if (editValue === "" || editValue === "null") {
        processedValue = null;
      } else if (editValue === "true" || editValue === "false") {
        processedValue = editValue === "true";
      } else if (!isNaN(Number(editValue)) && editValue !== "") {
        processedValue = Number(editValue);
      }

      // Update record in Supabase
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          [column]: processedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        toast.error(`Failed to update record: ${updateError.message}`);
        return;
      }

      // Update local state
      const newData = [...data];
      newData[row] = { 
        ...newData[row], 
        [column]: processedValue,
        updated_at: new Date().toISOString()
      };
      setData(newData);
      
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
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', recordId);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        toast.error(`Failed to delete record: ${deleteError.message}`);
        return;
      }

      // Remove from local state
      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
      
      toast.success("Record deleted successfully");
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error("Failed to delete record");
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value.toString();
  };

  const getCellColor = (column: string, value: any) => {
    if (column === 'id' || column === 'created_at' || column === 'updated_at') {
      return 'text-gray-500';
    }
    if (typeof value === 'boolean') {
      return value ? 'text-green-600' : 'text-red-600';
    }
    return '';
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
        <p>No data found in {tableName} table</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadTableData}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{data.length} records</Badge>
          <Button size="sm" variant="outline" onClick={loadTableData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Badge variant="secondary">Database Connected</Badge>
      </div>

      <div className="border rounded-lg overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="min-w-32">
                  {column}
                </TableHead>
              ))}
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex}>
                {columns.map((column) => (
                  <TableCell 
                    key={`${rowIndex}-${column}`}
                    className={`relative group ${getCellColor(column, row[column])}`}
                  >
                    {editingCell?.row === rowIndex && editingCell?.column === column ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="h-8 w-8 p-0"
                        >
                          {saving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`cursor-pointer hover:bg-gray-50 p-1 rounded ${
                          column === 'id' || column === 'created_at' || column === 'updated_at' 
                            ? 'cursor-not-allowed' 
                            : 'group-hover:bg-gray-50'
                        }`}
                        onClick={() => handleCellClick(rowIndex, column, row[column])}
                      >
                        <span className="text-xs">{formatCellValue(row[column])}</span>
                        {column !== 'id' && column !== 'created_at' && column !== 'updated_at' && (
                          <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 inline ml-1" />
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRecord(rowIndex)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Click on any cell (except ID, created_at, updated_at) to edit its value.</p>
        <p>Press Enter to save or Escape to cancel. Use null for NULL values.</p>
      </div>
    </div>
  );
};

export default DatabaseTable;