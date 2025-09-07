from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, timezone
import hashlib
import jwt
from passlib.context import CryptContext
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: str
    category: str
    specifications: Dict[str, Any] = {}
    stock_quantity: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    specifications: Dict[str, Any] = {}
    stock_quantity: int = 0
    featured: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[Dict[str, Any]]
    total_amount: float
    payment_method: str
    status: str = "pending"
    shipping_address: Dict[str, str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    payment_method: str
    shipping_address: Dict[str, str]

# Auth utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

# Initialize sample data
async def init_sample_data():
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "RoboVac Pro X1",
                "description": "Advanced home cleaning robot with AI navigation and smart mapping technology",
                "price": 599.99,
                "image_url": "https://images.unsplash.com/photo-1625314887424-9f190599bd56",
                "category": "home_automation",
                "specifications": {
                    "battery_life": "120 minutes",
                    "suction_power": "2000Pa",
                    "connectivity": "WiFi, Bluetooth",
                    "dimensions": "35 x 35 x 9.2 cm"
                },
                "stock_quantity": 50,
                "featured": True,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "AI Companion Bot",
                "description": "Intelligent companion robot with voice interaction and emotion recognition",
                "price": 1299.99,
                "image_url": "https://images.unsplash.com/photo-1625314876522-a908c4c01167",
                "category": "ai_companion",
                "specifications": {
                    "height": "45 cm",
                    "weight": "3.2 kg",
                    "voice_languages": "12 languages",
                    "battery_life": "8 hours"
                },
                "stock_quantity": 25,
                "featured": True,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "EduBot Learning Kit",
                "description": "Complete robotics learning kit for students and hobbyists",
                "price": 199.99,
                "image_url": "https://images.unsplash.com/photo-1581916459131-90da1f9c7162",
                "category": "educational",
                "specifications": {
                    "programming_languages": "Python, Scratch",
                    "sensors": "Ultrasonic, Camera, Gyroscope",
                    "age_range": "12+ years",
                    "components": "250+ pieces"
                },
                "stock_quantity": 100,
                "featured": False,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Smart Home Hub Robot",
                "description": "Central control robot for all your smart home devices",
                "price": 899.99,
                "image_url": "https://images.unsplash.com/photo-1530546171585-cc042ea5d7ab",
                "category": "home_automation",
                "specifications": {
                    "compatible_devices": "500+ smart devices",
                    "voice_control": "Alexa, Google, Siri",
                    "display": "7-inch touch screen",
                    "connectivity": "WiFi 6, Zigbee, Z-Wave"
                },
                "stock_quantity": 30,
                "featured": True,
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.products.insert_many(sample_products)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Robotics E-commerce API"}

# Auth routes
@api_router.post("/auth/register")
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": User(**user_data)}

@api_router.post("/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": User(**db_user)}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Product routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, search: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if featured is not None:
        query["featured"] = featured
    
    products = await db.products.find(query).to_list(100)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.get("/categories")
async def get_categories():
    return [
        {"id": "home_automation", "name": "Home Automation", "description": "Smart robots for your home"},
        {"id": "educational", "name": "Educational", "description": "Learning and hobby robotics"},
        {"id": "ai_companion", "name": "AI Companions", "description": "Intelligent companion robots"}
    ]

# Cart routes
@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        # Create empty cart
        cart_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "items": [],
            "updated_at": datetime.now(timezone.utc)
        }
        await db.carts.insert_one(cart_data)
        return Cart(**cart_data)
    return Cart(**cart)

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, current_user: User = Depends(get_current_user)):
    # Verify product exists
    product = await db.products.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "items": [],
            "updated_at": datetime.now(timezone.utc)
        }
    
    # Update or add item
    existing_item = None
    for i, cart_item in enumerate(cart["items"]):
        if cart_item["product_id"] == item.product_id:
            existing_item = i
            break
    
    if existing_item is not None:
        cart["items"][existing_item]["quantity"] += item.quantity
    else:
        cart["items"].append({"product_id": item.product_id, "quantity": item.quantity})
    
    cart["updated_at"] = datetime.now(timezone.utc)
    
    await db.carts.replace_one({"user_id": current_user.id}, cart, upsert=True)
    return {"message": "Item added to cart"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    cart["updated_at"] = datetime.now(timezone.utc)
    
    await db.carts.replace_one({"user_id": current_user.id}, cart)
    return {"message": "Item removed from cart"}

# Order routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        item_total = product["price"] * item.quantity
        total_amount += item_total
        
        order_items.append({
            "product_id": item.product_id,
            "product_name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "total": item_total
        })
    
    # Create order
    order = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "items": order_items,
        "total_amount": total_amount,
        "payment_method": order_data.payment_method,
        "status": "pending",
        "shipping_address": order_data.shipping_address,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.orders.insert_one(order)
    
    # Clear cart
    await db.carts.delete_one({"user_id": current_user.id})
    
    return Order(**order)

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}).sort("created_at", -1).to_list(50)
    return [Order(**order) for order in orders]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()