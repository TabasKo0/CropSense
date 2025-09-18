from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import pickle
from sklearn.ensemble import RandomForestClassifier
from torchvision.models import resnet
from torchvision import transforms
from PIL import Image
import numpy as np
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
import torch
from PIL import Image
import torchvision.transforms as transforms
import os
import pickle
import torch.nn as nn
import torch.nn.functional as F
import joblib
import pandas as pd
def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))



def load_model1():
    try:
        return joblib.load("Agriculture_Yield_Prediction_model_v1_0.joblib")
    except AttributeError as e:
        print(f"Model loading failed due to sklearn version mismatch: {e}")
        print("Please retrain the model with the current sklearn version or downgrade to sklearn 1.6.1")
        return None

model3 = load_model1()

# Function to make prediction
def predict_yield(state, crop, season, crop_year, area_acres, production_bags, bag_weight, rainfall, fertilizer, pesticide):
    area_ha = area_acres / 2.47   # convert acres → hectares
    production_tonnes = (production_bags * bag_weight) / 1000  # convert bags → tonnes

    input_data = pd.DataFrame({
        "Crop": [crop],
        "Crop_Year": [crop_year],
        "Season": [season],
        "State": [state],
        "Area": [area_ha],
        "Production": [production_tonnes],
        "Annual_Rainfall": [rainfall],
        "Fertilizer": [fertilizer],
        "Pesticide": [pesticide],
    })

    prediction = model3.predict(input_data)[0]   # model outputs yield in t/ha
    prediction_bags_per_acre = (prediction * 2.47 * 1000) / bag_weight
    return f"🌾 Estimated Yield: {prediction:.2f} t/ha\nEquivalent: {prediction_bags_per_acre:.2f} bags per acre"


# base class for the model
class ImageClassificationBase(nn.Module):
    
    def training_step(self, batch):
        images, labels = batch
        out = self(images)                  # Generate predictions
        loss = F.cross_entropy(out, labels) # Calculate loss
        return loss
    
    def validation_step(self, batch):
        images, labels = batch
        out = self(images)                   # Generate prediction
        loss = F.cross_entropy(out, labels)  # Calculate loss
        acc = accuracy(out, labels)          # Calculate accuracy
        return {"val_loss": loss.detach(), "val_accuracy": acc}
    
    def validation_epoch_end(self, outputs):
        batch_losses = [x["val_loss"] for x in outputs]
        batch_accuracy = [x["val_accuracy"] for x in outputs]
        epoch_loss = torch.stack(batch_losses).mean()       # Combine loss  
        epoch_accuracy = torch.stack(batch_accuracy).mean()
        return {"val_loss": epoch_loss, "val_accuracy": epoch_accuracy} # Combine accuracies
    
    def epoch_end(self, epoch, result):
        print("Epoch [{}], last_lr: {:.5f}, train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
            epoch, result['lrs'][-1], result['train_loss'], result['val_loss'], result['val_accuracy']))
        

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
             nn.BatchNorm2d(out_channels),
             nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)



class ResNet9(ImageClassificationBase):

    def __init__(self, in_channels, num_diseases):
        super().__init__()
        
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True) # out_dim : 128 x 64 x 64 
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        
        self.conv3 = ConvBlock(128, 256, pool=True) # out_dim : 256 x 16 x 16
        self.conv4 = ConvBlock(256, 512, pool=True) # out_dim : 512 x 4 x 44
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                       nn.Flatten(),
                                       nn.Linear(512, num_diseases))
        
    def forward(self, xb): # xb is the loaded batch
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out        
    





# Load the entire model from file (to CPU since map_location is set to CPU)
model2 = torch.load(open('disease.pth', 'rb'), map_location=torch.device('cpu'), pickle_module=pickle)
model2.eval()

# Load and preprocess test.jpg

# Predict (no need for .cpu() on model2 as it's already on CPU)

with open('crop.pkl', 'rb') as f:
    model1 = pickle.load(f)

@app.route("/run_model2", methods=["POST"])
def run_model2():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files['image']
    image = Image.open(file.stream).convert('RGB')
    transform = transforms.ToTensor()
    img_tensor = transform(image)
    
    output = model2(img_tensor.unsqueeze(0))
    classes=['Tomato___Late_blight', 'Tomato___healthy', 'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Potato___healthy', 'Corn_(maize)___Northern_Leaf_Blight', 'Tomato___Early_blight', 'Tomato___Septoria_leaf_spot', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Strawberry___Leaf_scorch', 'Peach___healthy', 'Apple___Apple_scab', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Bacterial_spot', 'Apple___Black_rot', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Peach___Bacterial_spot', 'Apple___Cedar_apple_rust', 'Tomato___Target_Spot', 'Pepper,_bell___healthy', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Potato___Late_blight', 'Tomato___Tomato_mosaic_virus', 'Strawberry___healthy', 'Apple___healthy', 'Grape___Black_rot', 'Potato___Early_blight', 'Cherry_(including_sour)___healthy', 'Corn_(maize)___Common_rust_', 'Grape___Esca_(Black_Measles)', 'Raspberry___healthy', 'Tomato___Leaf_Mold', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Pepper,_bell___Bacterial_spot', 'Corn_(maize)___healthy']
    _, preds = torch.max(output, dim=1)
    return jsonify({"output": classes[preds[0].item()]})

# Define image preprocessing
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route("/run_model1", methods=["POST"])
def run_model1():
    data = request.get_json()
    input_data = data.values()
    print(input_data)
    prediction = model1.predict([np.array(  list(input_data))])
                                     
    return jsonify({"output": prediction.tolist()})


def load_model1():
    try:
        return joblib.load("Agriculture_Yield_Prediction_model_v1_0.joblib")
    except AttributeError as e:
        print(f"Model loading failed due to sklearn version mismatch: {e}")
        print("Please retrain the model with the current sklearn version or downgrade to sklearn 1.6.1")
        return None

model3 = load_model1()

# Function to make prediction
def predict_yield(state, crop, season, crop_year, area_acres, production_bags, bag_weight, rainfall, fertilizer, pesticide):
    area_ha = area_acres / 2.47   # convert acres → hectares
    production_tonnes = (production_bags * bag_weight) / 1000  # convert bags → tonnes

    input_data = pd.DataFrame({
        "Crop": [crop],
        "Crop_Year": [crop_year],
        "Season": [season],
        "State": [state],
        "Area": [area_ha],
        "Production": [production_tonnes],
        "Annual_Rainfall": [rainfall],
        "Fertilizer": [fertilizer],
        "Pesticide": [pesticide],
    })

    prediction = model3.predict(input_data)[0]   # model outputs yield in t/ha
    prediction_bags_per_acre = (prediction * 2.47 * 1000) / bag_weight
    return f"🌾 Estimated Yield: {prediction:.2f} t/ha\nEquivalent: {prediction_bags_per_acre:.2f} bags per acre"

@app.route('/model3', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        result = predict_yield(
            data['state'],
            data['crop'],
            data['season'],
            data['crop_year'],
            data['area_acres'],
            data['production_bags'],
            data['bag_weight'],
            data['rainfall'],
            data['fertilizer'],
            data['pesticide']
        )
        return jsonify({'prediction': result})
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run()
