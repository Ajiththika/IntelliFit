import { useState } from 'react';
import { Upload, Loader2, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import API from '../../services/api';

const AvatarUploader = ({ onUploadComplete, currentAvatar }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await API.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadComplete(response.data.url);
        } catch (err) {
            console.error("Upload failed", err);
            setError('Failed to upload image.');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-secondary">
                    {currentAvatar ? (
                        <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Camera className="w-12 h-12 opacity-50" />
                        </div>
                    )}
                </div>

                {/* Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    <div className="relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-transparent"
                            disabled={uploading}
                        >
                            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default AvatarUploader;
