## 1. Overview

A Flask-based backend API for skin cancer detection, featuring:
- JWT-based user authentication
- Admin dashboard for managing users and doctors
- Image classification using a ResNet50 CNN model
- Medical report generation via OpenRouter (GPT)
- MongoDB database integration

---

## 2. System Architecture

### 🔧 Backend (Flask)
- `app.py`: Main application entry point
- `auth.py`: Handles registration and login with JWT tokens
- `admin.py`: Admin routes for user/doctor management
- `model.py`: Loads the CNN model and processes predictions
- `report_generator.py`: Generates diagnosis reports using OpenRouter
- `.env`: Stores API keys and database credentials
- `requirements.txt`: Python dependencies

### 🌐 Frontend (Angular)
- Users upload skin images via the UI
- Results and diagnostic reports are displayed interactively

---

## 3. Prediction Flow

1. User uploads an image through the UI
2. Angular sends a POST request to `/predict`
3. Flask backend:
   - Loads and preprocesses image
   - Feeds it to the ResNet50 model
   - Retrieves the predicted class and confidence
   - Optionally calls GPT to generate a diagnostic report
4. Response returned to the frontend for display

---

## 4. Model Details

- **Architecture**: ResNet50
- **Framework**: TensorFlow / Keras
- **Input size**: 224x224 RGB
- **Classes**:
  - Melanoma
  - Basal Cell Carcinoma
  - Pigmented Benign Keratosis
  - Normal Skin
- **Training Strategy**:
  - Phase 1: Base model frozen
  - Phase 2: Fine-tuned upper layers
- **Saved As**: `model_resnet50.h5`

---

## 5. API Endpoints

| Method | Endpoint                        | Description                            |
|--------|----------------------------------|----------------------------------------|
| POST   | `/register`                     | Register a new user                    |
| POST   | `/login`                        | User/doctor login                      |
| GET    | `/users`                        | List all users (Admin only)           |
| DELETE | `/users/<email>`               | Delete user (Admin only)              |
| PATCH  | `/users/<email>/approve`       | Approve & optionally promote user     |
| GET    | `/doctors`                      | List all doctors (Admin only)         |
| POST   | `/doctors`                      | Add a new doctor (Admin only)         |
| DELETE | `/doctors/<email>`            | Delete doctor (Admin only)            |
| POST   | `/predict`                      | Upload an image and get a prediction  |
| POST   | `/generate_report`             | Generate medical report using GPT     |

> All protected routes require an `Authorization: Bearer <JWT>` header

---

## 6. Report Generation

- Powered by **OpenRouter GPT** (GPT-4 or Claude)
- API key stored in `.env` file
- Input: Predicted class + confidence
- Output: Medical-style explanation + recommendation
- Can be converted to PDF (optional)

---

## 7. Technologies Used

- **Backend**: Python, Flask
- **Model**: Keras (ResNet50)
- **Database**: MongoDB 
- **Auth**: JWT (PyJWT)
- **Report Generation**: OpenRouter (LLM)
- **Frontend**: Angular 

---

## 8. Installation & Deployment

### 🔧 Local Development

```bash
git clone https://github.com/yourrepo/skin-cancer-api.git
cd backend
pip install -r requirements.txt

---
Create a .env file:

OPENROUTER_API_KEY=your_key
MONGO_URI=mongodb+srv://...
JWT_SECRET_KEY=supersecret

run the server: 
python app.py

---

☁️ Deployment Options
Backend: Render, Railway, or Replit
Frontend: Netlify or Vercel

---

## 9. Known Issues

- Low-Quality Images: Images with poor lighting or noise may lead to inaccurate predictions.
- LLM Variability: Generated reports can vary due to the randomness of the language model output.
- No Image History: Uploaded images and prediction history are not stored in the database yet.
- Basal Cell Carcinoma Issue: Although *Basal Cell Carcinoma* was included in training, the current model cannot reliably detect it during prediction. If such an image is uploaded, the system may return an error or invalid prediction result.



---
## 10. Future Improvements
Store patient upload history per user
Add patient-doctor chat interface
Add support for DICOM format
Add more skin cancer conditions

---

11. Author
👩 Jemaa Nadine
Software Engineering & Information Systems
3rd Year – Final Project (2025)
