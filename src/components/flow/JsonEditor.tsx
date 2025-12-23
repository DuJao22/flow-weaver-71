import { useState, useEffect, useCallback } from 'react';
import { Flow } from '@/types/flow';
import { AlertCircle, Check, Copy, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JsonEditorProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
}

export const JsonEditor = ({ flow, onFlowChange }: JsonEditorProps) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setJsonText(JSON.stringify(flow, null, 2));
    setError(null);
    setIsValid(true);
  }, [flow]);

  const validateAndUpdate = useCallback((text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (!parsed.nome || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid flow structure: must have "nome" and "steps" array');
      }
      setError(null);
      setIsValid(true);
      onFlowChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setIsValid(false);
    }
  }, [onFlowChange]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success('JSON copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.nome || 'flow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON downloaded');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      
      // Try to extract JSON from text (handles TXT files with JSON inside)
      let jsonContent = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      validateAndUpdate(jsonContent);
      toast.success('File imported');
    };
    input.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border glass">
        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="flex items-center gap-1.5 text-primary text-sm">
              <Check className="w-4 h-4" />
              Valid JSON
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              Invalid
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={jsonText}
          onChange={(e) => validateAndUpdate(e.target.value)}
          className="w-full h-full p-4 bg-transparent font-mono text-sm resize-none outline-none scrollbar-thin"
          spellCheck={false}
          placeholder="Enter JSON here..."
        />
        
        {/* Line numbers overlay effect */}
        <div className="absolute left-0 top-0 w-10 h-full bg-gradient-to-r from-secondary/20 to-transparent pointer-events-none" />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-destructive/10 border-t border-destructive/30 text-destructive text-sm">
          <p className="font-mono">{error}</p>
        </div>
      )}
    </div>
  );
};
