let model = null;
let modelLoading = false;

const loadModules = async () => {
  if (typeof window === 'undefined') return null;
  try {
    await import('@tensorflow/tfjs');
    const nsfwjs = await import('nsfwjs');
    return nsfwjs;
  } catch (error) {
    console.error('Error loading TensorFlow/NSFWJS modules:', error);
    throw error;
  }
};

// detection thresholds
const NSFW_THRESHOLD = 0.5;
const NSFW_CATEGORIES = ['Porn', 'Hentai', 'Sexy'];

// load model
export const loadModel = async () => {
  if (model) return model;
  if (modelLoading) {
    while (modelLoading) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return model;
  }

  modelLoading = true;
  try {
    const nsfwjs = await loadModules();
    model = await nsfwjs.load();
    modelLoading = false;
    return model;
  } catch (error) {
    modelLoading = false;
    console.error('Error loading NSFW model:', error);
    throw error;
  }
};

// classifies a single image
export const classifyImage = async (imageFile) => {
  try {
    const modelInstance = await loadModel();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target.result;

          img.onload = async () => {
            try {
              const predictions = await modelInstance.classify(img);
              console.log('NSFW detection predictions:', predictions);

              // nsfw score
              const nsfwPredictions = predictions.filter((p) =>
                NSFW_CATEGORIES.includes(p.className),
              );
              const nsfwScore = nsfwPredictions.reduce((sum, p) => sum + p.probability, 0);
              const isNSFW = nsfwScore > NSFW_THRESHOLD;

              // neutral score
              const neutralPrediction = predictions.find((p) => p.className === 'Neutral');
              const neutralScore = neutralPrediction?.probability || 0;

              resolve({
                isNSFW,
                nsfwScore: Math.round(nsfwScore * 100),
                neutralScore: Math.round(neutralScore * 100),
                predictions: predictions,
                fileName: imageFile.name,
              });
            } catch (error) {
              reject(new Error(`Classification failed: ${error.message}`));
            }
          };

          img.onerror = () => {
            reject(new Error('Failed to load image for classification'));
          };
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    throw error;
  }
};

// classifies multiple images
export const classifyMultipleImages = async (imageFiles, onProgress = null) => {
  const results = [];

  for (let i = 0; i < imageFiles.length; i++) {
    try {
      const result = await classifyImage(imageFiles[i]);
      results.push(result);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: imageFiles.length,
          result,
        });
      }
    } catch (error) {
      results.push({
        fileName: imageFiles[i].name,
        error: error.message,
        isNSFW: null,
      });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: imageFiles.length,
          error: error.message,
        });
      }
    }
  }

  return results;
};

// verify and validate an image
export const verifyImage = async (imageFile, options = {}) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (imageFile.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      reason: 'File size exceeds 5MB limit',
      fileName: imageFile.name,
    };
  }

  if (!imageFile.type.startsWith('image/')) {
    return {
      valid: false,
      reason: 'File must be an image',
      fileName: imageFile.name,
    };
  }

  try {
    const result = await classifyImage(imageFile);

    if (result.isNSFW) {
      return {
        valid: false,
        reason: `Image contains inappropriate content (${result.nsfwScore}% NSFW score)`,
        ...result,
      };
    }

    return {
      valid: true,
      reason: 'Image passed NSFW check',
      ...result,
    };
  } catch (error) {
    return {
      valid: null,
      reason: `Verification error: ${error.message}`,
      fileName: imageFile.name,
      error: error.message,
    };
  }
};

export const unloadModel = () => {
  if (model) {
    model.dispose();
    model = null;
  }
};
