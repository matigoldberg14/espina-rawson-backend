import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from './ui/label';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  disabled = false,
  error,
  description,
}) => {
  // Configuración de la barra de herramientas
  const modules = useMemo(() => ({
    toolbar: [
      // Formato de texto
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      
      // Colores
      [{ 'color': [] }, { 'background': [] }],
      
      // Listas y alineación
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      
      // Enlaces e imágenes
      ['link'],
      
      // Limpiar formato
      ['clean']
    ],
  }), []);

  // Formatos permitidos
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link'
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={`editor-${label}`}>{label}</Label>
      
      <div className="border rounded-md overflow-hidden">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          readOnly={disabled}
          style={{
            backgroundColor: disabled ? '#f8f9fa' : 'white',
          }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
      
      <style jsx global>{`
        .ql-editor {
          min-height: 120px;
          font-family: inherit;
        }
        
        .ql-toolbar {
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        
        .ql-container {
          border-top: none;
        }
        
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        /* Estilos para modo disabled */
        .ql-toolbar.ql-disabled {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
