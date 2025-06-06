# 🩺 Skin Cancer Detection Platform

This project is a full-stack web application that uses deep learning to detect skin cancer types from uploaded images. The system provides a medical-style report based on the image analysis.

- Frontend: Angular
- Backend: Flask (with a trained CNN model)
- Output: Predicted class, confidence, definition, and report

---
## 📊 Dataset Info

The model was trained using the [Skin Cancer 9 Classes ISIC Dataset](https://www.kaggle.com/datasets/nodoubttome/skin-cancer9-classesisic/data) from Kaggle.

This dataset contains **9 distinct skin cancer types**, with images labeled and organized for classification:

- **Actinic Keratoses (AKIEC)**
- **Basal Cell Carcinoma (BCC)**
- **Benign Keratosis-like Lesions (BKL)**
- **Dermatofibroma (DF)**
- **Melanocytic Nevi (NV)**
- **Vascular Lesions (VASC)**
- **Melanoma (MEL)**
- **Pigmented Benign Keratosis (PBK)**
- **Squamous Cell Carcinoma (SCC)**

> The dataset was cleaned, resized, normalized, and balanced before training the model.


## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+ and Angular CLI

---

## Run the Flask Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python run.py

The backend will be available at http://localhost:5000/.

---

🌐 Run the Angular Frontend
cd frontend
npm install
ng serve

The frontend will be available at http://localhost:4200/.
Make sure the backend is running before using the frontend.

---

📤 Features
Upload JPG image of a skin lesion
Predicts type: Melanoma, PBK, etc.

Shows:
Class name
Confidence (e.g., 87%)
Medical definition
PDF report generation 

---

🧠 Model Info
Architecture: ResNet50 
Framework: TensorFlow / Keras
Training set: Balanced skin cancer image dataset
Preprocessing: Resize, normalize, augment
Output: JSON prediction + optional PDF report


## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
