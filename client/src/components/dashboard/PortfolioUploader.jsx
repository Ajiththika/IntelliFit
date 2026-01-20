import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import API from '../../services/api';

const PortfolioUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError('');
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await API.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                uploadedUrls.push(response.data.url);
            }
            onUploadComplete(uploadedUrls);
        } catch (err) {
            console.error("Upload failed", err);
            setError('Failed to upload one or more images. Please try again.');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="relative cursor-pointer"
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Images
                        </>
                    )}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG. Max size: 5MB.
            </p>
        </div>
    );
};

export default PortfolioUploader;
