import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// The three crop types this model supports.
const SUPPORTED_CROPS = ['maize', 'potato', 'bean'];

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    is_plant_leaf: { type: "boolean", description: "Whether the image contains a plant leaf" },
    crop_type: { type: "string", enum: ["maize", "potato", "bean", "other"], description: "The crop species of the leaf" },
    is_supported_crop: { type: "boolean", description: "True only if crop_type is maize, potato, or bean" },
    disease_name: { type: "string", "description": "Name of the detected disease, or 'Healthy' if no disease" },
    confidence: { type: "number", description: "Confidence score between 0 and 1" },
    severity: { type: "string", enum: ["none", "low", "moderate", "high", "severe"], description: "Disease severity" },
    description: { type: "string", description: "Short description of the disease/condition" },
    symptoms: { type: "array", items: { type: "string" }, description: "Observable symptoms" },
    treatment: { type: "array", items: { type: "string" }, description: "Treatment recommendations" },
    prevention: { type: "array", items: { type: "string" }, description: "Prevention tips" }
  },
  required: ["is_plant_leaf", "crop_type", "is_supported_crop", "disease_name", "confidence", "severity", "description", "symptoms", "treatment", "prevention"]
};

const PROMPT = `You are a CNN-based plant leaf disease classification model specialized in THREE crops only: maize, potato, and bean.

Analyze the provided leaf image and:
1. Determine if the image actually contains a plant leaf (is_plant_leaf).
2. Identify the crop species and set crop_type to one of: "maize", "potato", "bean", or "other".
3. Set is_supported_crop = true ONLY when crop_type is maize, potato, or bean. For any other crop or non-leaf image, set is_supported_crop = false.
4. If is_supported_crop is true, classify the disease (e.g. "Maize Common Rust", "Potato Early Blight", "Bean Angular Leaf Spot") or "Healthy" if the leaf appears healthy.
5. Provide confidence (0-1), severity, description, symptoms, treatment, and prevention.

Common diseases:
- Maize: Common Rust, Northern Leaf Blight, Gray Leaf Spot, Maize Streak
- Potato: Early Blight, Late Blight, Leaf Roll (virus), Blackleg
- Bean: Angular Leaf Spot, Anthracnose, Bean Rust, Bacterial Wilt, Common Mosaic

If the image is not a plant leaf, set is_plant_leaf=false, crop_type="other", is_supported_crop=false, disease_name="Not a leaf", confidence=0, severity="none", and leave description empty with empty arrays.
If the leaf is a plant but not one of the three supported crops, set crop_type="other", is_supported_crop=false, disease_name="Unsupported crop", confidence=0, severity="none", description explaining only maize/potato/bean are supported, and empty arrays.

Be precise and practical. Recommendations should be understandable for smallholder farmers.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const fileUrl = body?.file_url;
    if (!fileUrl || typeof fileUrl !== 'string') {
      return Response.json({ error: 'A file_url is required.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: PROMPT,
      file_urls: [fileUrl],
      response_json_schema: RESPONSE_SCHEMA
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}