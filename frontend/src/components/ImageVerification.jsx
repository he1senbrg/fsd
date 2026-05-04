'use client';

import { loadModel, verifyImage } from '@/utils/imageClassifier';
import { useEffect, useRef, useState } from 'react';


// img verification card component
// Displays verification status, confidence, and suggested tags
export function ImageVerificationCard({
  imageFile,
  imagePreview,
  onVerify,
  onRemove,
  verificationMode = 'marketplace',
}) {
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!imageFile) return;
      setVerifying(true);
      try {
        const result = await verifyImage(imageFile, { verificationMode });
        if (cancelled) return;
        setVerification(result);
        if (onVerifyRef.current) {
          onVerifyRef.current(result);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Verification error:', error);
        setVerification({
          valid: null,
          reason: 'Could not verify image',
          fileName: imageFile.name,
        });
      }
      if (!cancelled) setVerifying(false);
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [imageFile, verificationMode]);

  if (!verification) {
    return (
      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-2xl text-stone-400 animate-spin">
            hourglass_top
          </span>
          <span className="text-xs text-stone-400">Verifying...</span>
        </div>
      </div>
    );
  }

  const statusColor = verification.valid === true ? 'green' : verification.valid === false ? 'red' : 'yellow';
  const statusIcon = verification.valid === true ? 'check' : verification.valid === false ? '!' : 'help';

  return (
    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200">
      {/* img preview */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />

      {/* status badge */}
      <div
        className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-md ${
          statusColor === 'green'
            ? 'bg-green-500'
            : statusColor === 'red'
              ? 'bg-red-500'
              : 'bg-amber-500'
        }`}
      >
        <span className={`text-[12px] ${verification.valid === false ? 'font-bold leading-none' : 'material-symbols-outlined'}`}>
          {statusIcon}
        </span>
      </div>

      {/* rm btn */}
      <button
        type="button"
        onClick={() => onRemove && onRemove()}
        className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
      >
        <span className="material-symbols-outlined text-[10px]">close</span>
      </button>
    </div>
  );
}

// img verification summary component
// shows overall verification status and statistics
export function ImageVerificationSummary({ verifications }) {
  if (!verifications || verifications.length === 0) return null;

  const failed = verifications.filter((v) => v.valid === false).length;
  const total = verifications.length;

  if (failed === 0) return null;
  else return (
    <div className="rounded-lg border-dashed border-1 border-red-600 p-3 mb-4">
      <div className="flex items-center justify-between">
        {
          total === 1 ? (
            <div className="text-xs text-red-700">Image might include sensitive content.</div>
          ) : (
            <div className="text-xs text-red-700">{failed} of {total} images might include sensitive content.</div>
          )
        }
      </div>
    </div>
  );
}

// img upload with verification hook
// handles img selection and verification
export function useImageVerification() {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [modelLoaded, setModelLoaded] = useState(false);

  // pre-load model on mount
  useEffect(() => {
    const preload = async () => {
      try {
        await loadModel();
        setModelLoaded(true);
      } catch (error) {
        console.warn('Could not pre-load model:', error);
      }
    };
    preload();
  }, []);

  const handleImageChange = (files, maxImages = 5) => {
    const newFiles = Array.from(files || []);
    setImageFiles((prevFiles) => {
      const combined = [...prevFiles, ...newFiles].slice(0, maxImages);
      setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setVerifications((prev) => prev.filter((_, i) => i !== index));
  };

  const recordVerification = (index, verification) => {
    setVerifications((prev) => {
      const updated = [...prev];
      updated[index] = verification;
      return updated;
    });
  };

  const getValidImages = () => {
    return imageFiles.filter((_, i) => verifications[i]?.valid === true);
  };

  return {
    imageFiles,
    imagePreviews,
    verifications,
    modelLoaded,
    handleImageChange,
    removeImage,
    recordVerification,
    getValidImages,
  };
}
