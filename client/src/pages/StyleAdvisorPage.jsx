import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Upload, Camera, Loader2, Sparkles, Save, Share2 } from 'lucide-react';

const StyleAdvisorPage = () => {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null); // { skinTone, undertone, hex }
    const [recommendations, setRecommendations] = useState([]);

    const imgRef = useRef();
    const canvasRef = useRef();

    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                console.log("Models Loaded");
            } catch (err) {
                console.error("Failed to load models", err);
                setError("Failed to load AI models. Please refresh.");
            }
        };
        loadModels();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setResults(null);
                setRecommendations([]);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeSkinTone = async () => {
        if (!image || !modelsLoaded) return;
        setAnalyzing(true);
        setError(null);

        try {
            // 1. Detect Face
            // Using TinyFaceDetector for speed/browser compat
            const detection = await faceapi.detectSingleFace(
                imgRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks();

            if (!detection) {
                throw new Error("No face detected. Please try a clearer photo.");
            }

            // 2. Get Cheek Region
            // Landmarks: 68 points.
            // Left cheek: 2, 3, 4 area? Or just use a relative box from the jawline.
            // Let's use a safe centralized point on the cheek.
            // Left cheek center is roughly between nose (30) and left jaw (3).
            // Let's grab a small patch (10x10) from the center of the face (nose bridge?) -> No, forehead or cheek is better for skin tone.
            // Let's take a patch from the cheek.
            const landmarks = detection.landmarks;
            const nose = landmarks.getNose()[0]; // Top of nose
            const leftCheek = landmarks.getJawOutline()[3]; // Lower left jaw

            // Calculate a midpoint for sampling
            const sampleX = (nose.x + leftCheek.x) / 2;
            const sampleY = (nose.y + leftCheek.y) / 2;

            // 3. Extract Color
            const canvas = document.createElement('canvas');
            canvas.width = imgRef.current.naturalWidth;
            canvas.height = imgRef.current.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgRef.current, 0, 0);

            const sampleSize = 20; // 20x20 px
            const pixelData = ctx.getImageData(sampleX - sampleSize / 2, sampleY - sampleSize / 2, sampleSize, sampleSize).data;

            // Avg RGB
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < pixelData.length; i += 4) {
                r += pixelData[i];
                g += pixelData[i + 1];
                b += pixelData[i + 2];
            }
            const pixelCount = pixelData.length / 4;
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);

            // 4. Analysis Logic
            // Undertone: Cool vs Warm.
            // Simple heuristic: 
            // Cool: Higher Blue component relative to Green/Red balance?
            // Warm: Higher Red/Green.
            // Let's use a standard conversion or heuristic.
            // Option: CCT (Correlated Color Temperature) approximation.
            // Or simply:
            // If R > G > B -> Warm/Neutral.
            // If B is relatively high -> Cool.
            // Let's use a simplified logical map.
            // Usually Skin: R is always dominant.
            // We look at the 'b' channel in Lab color space ideally.
            // Approximation:
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            let toneCategory = 'Medium';
            if (brightness > 200) toneCategory = 'Light';
            else if (brightness < 100) toneCategory = 'Dark';

            // Undertone Logic (Very basic approximation)
            // Reference: https://stackoverflow.com/questions/10673722/face-detection-skin-color-detection
            // Warm if R > G > B (Standard skin), but if B is "closer" to G, it's cooler.
            // Actually, let's just use (R-G) vs (R-B).
            // Cool undertones are "pinkish" (High R, High B).
            // Warm undertones are "yellowish" (High R, High G).
            // So if G > B significantly -> Warm.
            // If G approx B -> Cool/Neutral (Pink).

            let undertoneCategory = 'Neutral';
            if (g > b * 1.2) {
                undertoneCategory = 'Warm';
            } else {
                undertoneCategory = 'Cool';
            }

            setResults({
                skinTone: toneCategory,
                undertone: undertoneCategory,
                hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
            });

            // 5. Fetch Recommendations
            const res = await axios.post('http://localhost:5000/api/style-advisor/recommendations', {
                skinTone: toneCategory,
                undertone: undertoneCategory
            });

            setRecommendations(res.data.data);

        } catch (err) {
            console.error(err);
            setError(err.message || "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 py-12 px-6 text-center shadow-lg">
                <h1 className="text-4xl font-bold mb-4 font-serif">AI Style Advisor</h1>
                <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                    Uppload a photo to discover your perfect color palette and get personalized outfit recommendations instantly.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Upload & Preview */}
                <div className="bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Camera className="w-6 h-6 text-purple-400" />
                        Your Photo
                    </h2>

                    <div className="relative w-full aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden border-2 border-dashed border-neutral-600 flex flex-col items-center justify-center group hover:border-purple-500 transition-colors">

                        {image ? (
                            <>
                                <img
                                    ref={imgRef}
                                    src={image}
                                    alt="Upload"
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />

                                {/* Analyze Overlay */}
                                {!results && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={analyzeSkinTone}
                                            disabled={analyzing || !modelsLoaded}
                                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-purple-50 hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                            {analyzing ? 'Analyzing...' : 'Analyze Style'}
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-red-500/80 transition-colors"
                                >
                                    X
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                <Upload className="w-16 h-16 text-neutral-500 mb-4" />
                                <span className="text-neutral-400 text-lg">Click to Upload Photo</span>
                                <span className="text-neutral-600 text-sm mt-2">Format: JPG, PNG</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}

                        {!modelsLoaded && !image && (
                            <div className="absolute bottom-4 text-xs text-yellow-500 flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Loading AI Models...
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="space-y-8">

                    {results ? (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Analysis Card */}
                            <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-purple-300">Analysis Results</h3>
                                    <div className="flex gap-2">
                                        {/* Action Buttons */}
                                        <button className="p-2 hover:bg-neutral-700 rounded-full text-neutral-400"><Save className="w-5 h-5" /></button>
                                        <button className="p-2 hover:bg-neutral-700 rounded-full text-neutral-400"><Share2 className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-neutral-900 p-4 rounded-xl flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full shadow-inner border border-white/10"
                                            style={{ backgroundColor: results.hex }}
                                        ></div>
                                        <div>
                                            <div className="text-xs text-neutral-500 uppercase tracking-wider">Detected Skin Tone</div>
                                            <div className="font-bold text-lg">{results.skinTone}</div>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-900 p-4 rounded-xl">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Undertone</div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {results.undertone === 'Warm' ? '☀️' : results.undertone === 'Cool' ? '❄️' : '⚖️'}
                                            {results.undertone}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold mb-6">Recommended For You</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {recommendations.map((item) => (
                                        <div key={item._id} className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg group hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
                                            <div className="h-48 overflow-hidden relative">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">
                                                    {item.category}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-lg truncate">{item.name}</h4>
                                                <p className="text-sm text-neutral-400 mt-2 line-clamp-2">{item.description}</p>

                                                <div className="mt-4 flex gap-2">
                                                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: item.primaryColor }} title="Primary"></div>
                                                    {item.complementaryColors.map((col, idx) => (
                                                        <div key={idx} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: col }} title="Complementary"></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ) : (
                        /* Empty State / Prompt */
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 text-neutral-500">
                            <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10 text-neutral-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-300">Ready to Analyze</h3>
                            <p className="max-w-xs mt-2">Upload your photo and let our AI determine your unique style profile.</p>

                            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm opacity-50">
                                <div className="h-24 bg-neutral-800 rounded-lg"></div>
                                <div className="h-24 bg-neutral-800 rounded-lg"></div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StyleAdvisorPage;
