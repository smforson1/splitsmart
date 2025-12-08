const express = require('express');
const router = express.Router();
const multer = require('multer');
const OpenAI = require('openai');

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/expenses/scan - Scan receipt with AI
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image provided' });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in valid JSON format:
{
  "total_amount": <number>,
  "merchant_name": <string>,
  "date": <string in YYYY-MM-DD format>
}

If any information is not clearly visible, use null for that field. Return ONLY the JSON object, no additional text.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    // Parse response
    const content = response.choices[0].message.content;
    
    // Extract JSON from response (in case there's extra text)
    let extractedData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extractedData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({ 
        error: 'Failed to parse receipt data',
        raw_response: content 
      });
    }

    res.json({
      success: true,
      data: extractedData,
      receipt_url: imageUrl
    });
  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan receipt',
      message: error.message 
    });
  }
});

module.exports = router;
