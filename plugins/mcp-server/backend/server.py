import os
import json
import httpx
import boto3
from typing import Optional, List
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Configuration
BACKEND_URL = os.getenv("S3APP_BACKEND_URL", "http://localhost:5073")
MCP_API_KEY = os.getenv("S3APP_MCP_API_KEY", "s3-app-mcp-secret-key-2026")

# Initialize FastMCP server
mcp = FastMCP("S3App")

@mcp.tool()
async def add_product(
    name: str,
    price: float,
    description: str,
    webpage_id: int,
    category: str = "General",
    quantity: int = 10,
    image_url: Optional[str] = None
) -> str:
    """
    Adds a new product to the S3App backend.
    
    Args:
        name: The name of the product.
        price: The price of the product.
        description: A short description of the product.
        webpage_id: The ID of the webpage this product belongs to.
        category: The category of the product (default: General).
        quantity: Initial available quantity (default: 10).
        image_url: Optional URL for a product image.
    """
    
    # Mock S3 Upload logic if image_url is provided
    if image_url:
        # In a real scenario, we would download the image and upload it to S3
        # For now, we just log it as a mock action
        print(f"[MOCK S3] Uploading image from {image_url} to S3...")
        # product_image_s3_url = f"https://my-mock-bucket.s3.amazonaws.com/products/{name.lower().replace(' ', '_')}.jpg"
    
    payload = {
        "ProductName": name,
        "ProductCategory": category,
        "Price": price,
        "AvailableQuantity": quantity,
        "SoldQuantity": 0,
        "Description": description,
        "WebpageId": webpage_id,
        "Rating": 5.0,
        "OtherSpec": json.dumps({"image_url": image_url}) if image_url else "{}"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/product",
                json=payload,
                headers={"X-MCP-API-KEY": MCP_API_KEY},
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return f"✅ Product '{name}' added successfully! ID: {result.get('id')}"
            else:
                return f"❌ Failed to add product. Status: {response.status_code}, Error: {response.text}"
        except Exception as e:
            return f"❌ Error connecting to backend: {str(e)}"

@mcp.tool()
async def list_webpages() -> str:
    """
    Lists available webpages to find the correct webpage_id for adding products.
    """
    async with httpx.AsyncClient() as client:
        try:
            # We use the public/default endpoint or a custom one if available
            # For now, let's try to get the default webpage to see if it works
            response = await client.get(f"{BACKEND_URL}/api/webpage/default")
            if response.status_code == 200:
                data = response.json()
                return f"Available Webpage:\n- ID: {data.get('id')}\n- Name: {data.get('headerInfo')}\n- Owner: {data.get('user', {}).get('username')}"
            else:
                return f"⚠️ Could not list webpages. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()
