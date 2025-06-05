from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient, DESCENDING
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import load_model
from io import BytesIO
import requests
import os
import json
from dotenv import load_dotenv
import re
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart



load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")

mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["Detection_db"]
mongo_submissions = mongo_db["submissions"]
users_collection = mongo_db["users"]
doctors_collection = mongo_db["doctors"]

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
jwt = JWTManager(app)

model_path = 'resnet50_skin_cancer_finetuned.h5'
model = load_model(model_path)
img_size = (224, 224)
class_names = ['basal cell carcinoma', 'melanoma', 'normal skin', 'pigmented benign keratosis']
idx_to_class = {idx: name for idx, name in enumerate(class_names)}

# ----------- Utilities -----------

def load_and_prepare_image_from_file(file):
    img_bytes = file.read()
    img = image.load_img(BytesIO(img_bytes), target_size=img_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

def extract_json_from_text(text):
    """
    Extract JSON substring from text and parse it safely.
    """
    try:
        # Find first { and last } to extract JSON block
        json_str = re.search(r"\{.*\}", text, re.DOTALL)
        if json_str:
            return json.loads(json_str.group())
    except json.JSONDecodeError:
        pass
    return None

def generate_report_openrouter(pred_class, confidence):
    prompt = f"""
You are an expert medical assistant. Write a diagnostic report in JSON format using this structure:

- Condition: {pred_class}
- Model Confidence: {confidence:.2f}%

{{
  "overview": "<Brief explanation>",
  "importance_of_early_detection": "<Why it's important>",
  "recommendation": "<Next steps>",
  "confidence_explanation": "<Explain model confidence>"
}}
"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    if response.status_code == 200:
        reply = response.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        parsed_report = extract_json_from_text(reply)
        if parsed_report:
            return parsed_report
        else:
            return {
                "overview": "Error parsing structured report.",
                "importance_of_early_detection": "",
                "recommendation": "",
                "confidence_explanation": ""
            }
    else:
        return {
            "overview": f"Error {response.status_code}: {response.text}",
            "importance_of_early_detection": "",
            "recommendation": "",
            "confidence_explanation": ""
        }

# ----------- Auth APIs -----------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")  # Get the name from the request
    if not email or not password or not name:
        return jsonify({"error": "Name, email, and password required"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "email": email,
        "name": name,  # Store the name
        "password": hashed_password,
        "approved": False,
        "role": "user"
    })
    token = create_access_token(identity=email)
    return jsonify({"message": "User registered successfully", "access_token": token}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Check in users collection first
    user = users_collection.find_one({"email": email})
    collection_name = "users"


    # If not found, check doctors collection
    if not user:
        user = doctors_collection.find_one({"email": email})
        collection_name = "doctors"

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.get("approved", False):
        return jsonify({"error": "Account not approved by admin"}), 403

    token = create_access_token(identity=email)
    return jsonify({
        "access_token": token,
        "role": user.get("role", "user"),
        "collection": collection_name
    }), 200


# ----------- Admin APIs -----------

@app.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})
    if current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can view users"}), 403
    users = list(users_collection.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return jsonify(users)

@app.route("/users/<email>", methods=["DELETE"])
@jwt_required()
def delete_user(email):
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})
    if current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can delete users"}), 403
    if users_collection.delete_one({"email": email}).deleted_count == 0:
        return jsonify({"error": "User not found"}), 404
    mongo_submissions.delete_many({"user_email": email})  # Optional: delete submissions too
    return jsonify({"message": f"User {email} deleted"}), 200

@app.route("/users/<email>/approve", methods=["PATCH"])
@jwt_required()
def approve_user(email):
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})

    if not current_user or current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can approve users"}), 403

    data = request.get_json() or {}
    new_role = data.get("role")  # Optional: expected to be 'user' or 'doctor'

    # Find user in users collection first
    user_doc = users_collection.find_one({"email": email})

    if user_doc and new_role == "doctor":
        # Move from users to doctors
        # Remove from users
        users_collection.delete_one({"email": email})

        # Insert into doctors with role and approved
        user_doc["role"] = "doctor"
        user_doc["approved"] = True
        doctors_collection.insert_one(user_doc)

        return jsonify({"message": f"User {email} promoted to doctor and approved."}), 200

    elif user_doc and (not new_role or new_role == "user"):
        # Just approve in users collection
        users_collection.update_one({"email": email}, {"$set": {"approved": True, "role": "user"}})
        return jsonify({"message": f"User {email} approved as user."}), 200

    else:
        # Check if in doctors collection
        doctor_doc = doctors_collection.find_one({"email": email})
        if doctor_doc:
            doctors_collection.update_one({"email": email}, {"$set": {"approved": True}})
            return jsonify({"message": f"Doctor {email} approved."}), 200

    return jsonify({"error": "User/doctor not found"}), 404









# ----------- Doctor Management (Admin only) -----------

@app.route("/doctors", methods=["GET"])
@jwt_required()
def get_doctors():
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})
    if current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can view doctors"}), 403
    doctors = list(doctors_collection.find({}, {"password": 0}))
    for doc in doctors:
        doc["_id"] = str(doc["_id"])
    return jsonify(doctors), 200

@app.route("/doctors", methods=["POST"])
@jwt_required()
def add_doctor():
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})
    if current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can add doctors"}), 403
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password required"}), 400
    if doctors_collection.find_one({"email": email}):
        return jsonify({"error": "Doctor already exists"}), 409
    hashed_password = generate_password_hash(password)
    doctors_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })
    return jsonify({"message": "Doctor added successfully"}), 201

@app.route("/doctors/<email>", methods=["DELETE"])
@jwt_required()
def delete_doctor(email):
    current_user_email = get_jwt_identity()
    current_user = users_collection.find_one({"email": current_user_email})
    if current_user.get("role") != "admin":
        return jsonify({"error": "Only admin can delete doctors"}), 403
    result = doctors_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        return jsonify({"error": "Doctor not found"}), 404
    return jsonify({"message": f"Doctor {email} deleted"}), 200

# ----------- Prediction APIs -----------

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    current_user_email = get_jwt_identity()
    user = users_collection.find_one({"email": current_user_email})
    if not user or not user.get("approved"):
        return jsonify({"error": "Unauthorized"}), 403

    current_user_name = user.get("name", "Unknown")  # <-- Safely extract user's name

    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    img_batch = load_and_prepare_image_from_file(file)
    preds = model.predict(img_batch, verbose=0)
    pred_index = np.argmax(preds)
    pred_class = idx_to_class[pred_index]
    confidence = float(np.max(preds) * 100)

    if pred_class == "basal cell carcinoma":
        return jsonify({
            "message": "The image is unclear or prediction uncertain. Please enter a clearer image for better results."
        }), 200

    report = generate_report_openrouter(pred_class, confidence)

    last_submission = mongo_submissions.find_one(sort=[("id", DESCENDING)])
    submission_id = last_submission["id"] + 1 if last_submission else 1

    submission = {
        "id": submission_id,
        "user_name": current_user_name,
        "user_email": current_user_email,
        "class": pred_class,
        "confidence": round(confidence, 2),
        "report": report,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    inserted = mongo_submissions.insert_one(submission)
    submission["_id"] = str(inserted.inserted_id)

    return jsonify(submission)


@app.route("/submissions", methods=["GET"])
@jwt_required()
def get_submissions():
    current_user = get_jwt_identity()
    submissions = list(mongo_submissions.find({"user_email": current_user}, {"_id": 0}))
    return jsonify(submissions)

@app.route("/submissions/<int:submission_id>", methods=["DELETE"])
@jwt_required()
def delete_submission(submission_id):
    current_user = get_jwt_identity()
    result = mongo_submissions.delete_one({"id": submission_id, "user_email": current_user})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found or unauthorized"}), 404
    return jsonify({"message": f"Submission {submission_id} deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True)