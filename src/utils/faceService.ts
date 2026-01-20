import * as faceapi from 'face-api.js';

// Base URL handling for GitHub Pages
const MODEL_URL = import.meta.env.BASE_URL + 'models';

export const loadModels = async () => {
    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded successfully from", MODEL_URL);
        return true;
    } catch (e) {
        console.error("Error loading models:", e);
        return false;
    }
};

export const getFaceDescriptor = async (imageInput: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> => {
    const detection = await faceapi.detectSingleFace(imageInput)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return null;
    return detection.descriptor;
};

export const createFaceMatcher = async (labeledDescriptors: faceapi.LabeledFaceDescriptors[]) => {
    return new faceapi.FaceMatcher(labeledDescriptors, 0.6);
};
