import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface DocumentUploaderProps {
  caseId?: string;
  category?: string;
  onUploadComplete?: (document: any) => void;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  caseId,
  category = 'evidence',
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setFiles([...files, ...newFiles]);
    setError('');

    // Auto-upload
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    const token = localStorage.getItem('token');

    for (let i = 0; i < filesToUpload.length; i++) {
      const uploadFile = filesToUpload[i];
      const index = files.length + i;

      try {
        // Update status to uploading
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'uploading' };
          return updated;
        });

        // Prepare form data
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        if (caseId) formData.append('caseId', caseId);
        formData.append('category', category);

        // Upload with progress tracking
        const response = await axios.post(`${API_URL}/documents`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;

            setFiles((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], progress };
              return updated;
            });
          },
        });

        // Update status to success
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'success',
            progress: 100,
            result: response.data.data.document,
          };
          return updated;
        });

        if (onUploadComplete) {
          onUploadComplete(response.data.data.document);
        }
      } catch (err: any) {
        // Update status to error
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: err.response?.data?.message || 'Upload failed',
          };
          return updated;
        });

        setError(`Failed to upload ${uploadFile.file.name}`);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Documents
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max 50MB)
      </Typography>

      <Box sx={{ mt: 2, mb: 3 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
        >
          Select Files
          <input
            type="file"
            hidden
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            onChange={handleFileSelect}
          />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <List>
          {files.map((uploadFile, index) => (
            <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
              <ListItemIcon>
                {uploadFile.status === 'success' ? (
                  <CheckCircleIcon color="success" />
                ) : uploadFile.status === 'error' ? (
                  <ErrorIcon color="error" />
                ) : (
                  <InsertDriveFileIcon />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={uploadFile.file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {formatFileSize(uploadFile.file.size)}
                    </Typography>
                    
                    {uploadFile.status === 'uploading' && (
                      <LinearProgress variant="determinate" value={uploadFile.progress} sx={{ mt: 1 }} />
                    )}
                    
                    {uploadFile.status === 'error' && (
                      <Typography variant="caption" color="error">
                        {uploadFile.error}
                      </Typography>
                    )}
                    
                    {uploadFile.status === 'success' && (
                      <Typography variant="caption" color="success.main">
                        Uploaded successfully
                      </Typography>
                    )}
                  </Box>
                }
              />

              {uploadFile.status === 'pending' || uploadFile.status === 'error' ? (
                <Button size="small" onClick={() => removeFile(index)}>
                  Remove
                </Button>
              ) : null}
            </ListItem>
          ))}
        </List>
      )}

      {files.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <CloudUploadIcon sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="body2">
            No files selected. Click "Select Files" to upload documents.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DocumentUploader;
