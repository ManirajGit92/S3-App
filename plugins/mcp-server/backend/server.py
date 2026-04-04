import os
import json
import httpx
from typing import Optional, List
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import mimetypes

# Load environment variables from .env file if it exists
load_dotenv()

# Configuration
BACKEND_URL = os.getenv("S3APP_BACKEND_URL", "http://localhost:5073")
MCP_API_KEY = os.getenv("S3APP_MCP_API_KEY", "s3-app-mcp-secret-key-2026")

def get_headers():
    return {"X-MCP-API-KEY": MCP_API_KEY}

# Initialize FastMCP server
mcp = FastMCP("S3App Products")

@mcp.tool()
async def list_products(webpage_id: int, search: str = "", sort: str = "") -> str:
    """Lists products for a webpage. Can filter by search term and sort (price_asc, price_desc, name_asc)."""
    async with httpx.AsyncClient() as client:
        try:
            url = f"{BACKEND_URL}/api/product/webpage/{webpage_id}"
            params = {}
            if search: params["search"] = search
            if sort: params["sort"] = sort
            
            response = await client.get(url, params=params)
            if response.status_code == 200:
                products = response.json()
                if not products:
                    return f"No products found for Webpage ID: {webpage_id}."
                
                result = [f"Found {len(products)} products:"]
                for p in products:
                    status = "✅ In Stock" if p.get("availableQuantity", 0) > 0 else "❌ Sold Out"
                    result.append(f"- ID: {p.get('id')} | Name: '{p.get('productName')}' | Price: ${p.get('price')} | Qty: {p.get('availableQuantity')} | Status: {status}")
                return "\n".join(result)
            return f"❌ Failed to list products. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error connecting to backend: {str(e)}"

@mcp.tool()
async def get_product(product_id: int) -> str:
    """Gets complete details of a specific product by its ID."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/product/{product_id}")
            if response.status_code == 200:
                data = response.json()
                return json.dumps(data, indent=2)
            elif response.status_code == 404:
                return f"❌ Product ID {product_id} not found."
            return f"❌ Failed to get product. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def add_product(
    name: str,
    price: float,
    webpage_id: int,
    description: str = "",
    category: str = "General",
    subcategory: str = "",
    company: str = "",
    quantity: int = 10,
    is_hidden: bool = False,
    image_url: str = ""
) -> str:
    """Adds a completely new product to the S3App backend."""
    other_spec = {
        "subcategory": subcategory,
        "company": company,
        "isHidden": is_hidden,
        "imageUrl": image_url,
        "specs": []
    }
    
    payload = {
        "ProductName": name,
        "ProductCategory": category,
        "Price": price,
        "AvailableQuantity": quantity,
        "SoldQuantity": 0,
        "Description": description,
        "WebpageId": webpage_id,
        "Rating": 5.0,
        "OtherSpec": json.dumps(other_spec)
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BACKEND_URL}/api/product", json=payload, headers=get_headers())
            if response.status_code == 200:
                result = response.json()
                return f"✅ Product '{name}' added successfully! ID: {result.get('id')}"
            return f"❌ Failed to add product. Status: {response.status_code}, Error: {response.text}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def update_product(
    product_id: int,
    name: Optional[str] = None,
    price: Optional[float] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    quantity: Optional[int] = None,
    image_url: Optional[str] = None,
    is_hidden: Optional[bool] = None
) -> str:
    """Updates an existing product. Only provide the fields you want to change."""
    async with httpx.AsyncClient() as client:
        try:
            # First fetch the existing product to merge fields properly
            get_resp = await client.get(f"{BACKEND_URL}/api/product/{product_id}")
            if get_resp.status_code != 200:
                return f"❌ Cannot update. Product ID {product_id} not found."
            
            p = get_resp.json()
            
            # Extract existing specs safely
            try:
                spec = json.loads(p.get("otherSpec", "{}"))
            except:
                spec = {}

            # Update mapping
            if name is not None: p["productName"] = name
            if price is not None: p["price"] = price
            if description is not None: p["description"] = description
            if category is not None: p["productCategory"] = category
            if quantity is not None: p["availableQuantity"] = quantity
            
            if image_url is not None: spec["imageUrl"] = image_url
            if is_hidden is not None: spec["isHidden"] = is_hidden
            
            p["otherSpec"] = json.dumps(spec)

            response = await client.put(f"{BACKEND_URL}/api/product/{product_id}", json=p, headers=get_headers())
            if response.status_code == 200:
                return f"✅ Product ID {product_id} updated successfully."
            return f"❌ Failed to update product. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def update_stock(product_id: int, quantity: int) -> str:
    """Quickly sets the available stock quantity for a product."""
    return await update_product(product_id=product_id, quantity=quantity)

@mcp.tool()
async def update_price(product_id: int, price: float) -> str:
    """Quickly sets the price for a product."""
    return await update_product(product_id=product_id, price=price)

@mcp.tool()
async def delete_product(product_id: int) -> str:
    """Permanently deletes a product by ID."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{BACKEND_URL}/api/product/{product_id}", headers=get_headers())
            if response.status_code == 200:
                return f"✅ Product ID {product_id} deleted."
            return f"❌ Failed to delete product. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def delete_all_products(webpage_id: int) -> str:
    """DANGER: Permanently deletes ALL products for a specified webpage_id."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{BACKEND_URL}/api/product/all/{webpage_id}", headers=get_headers())
            if response.status_code == 200:
                data = response.json()
                return f"✅ Success: {data.get('message', 'All products deleted.')}"
            return f"❌ Failed to delete all products. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def buy_product(product_ids: List[int], customer_name: str = "MCP Customer", customer_phone: str = "555-0000") -> str:
    """Simulates a checkout/cart purchase logic for a list of product IDs."""
    payload = {
        "ProductIds": product_ids,
        "CustomerName": customer_name,
        "CustomerPhone": customer_phone,
        "PaymentMethod": "MCP_Integration"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BACKEND_URL}/api/product/buy", json=payload, headers=get_headers())
            if response.status_code == 200:
                return f"✅ Purchase completed successfully for {len(product_ids)} items."
            return f"❌ Purchase failed. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

@mcp.tool()
async def upload_product_image(file_path: str) -> str:
    """
    Uploads a local image file to the backend server and returns the public URL.
    Provide the absolute file_path to the image on your system.
    """
    if not os.path.exists(file_path):
        return f"❌ File not found at {file_path}"
        
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    filename = os.path.basename(file_path)
    
    async with httpx.AsyncClient() as client:
        try:
            with open(file_path, "rb") as f:
                files = {"file": (filename, f, mime_type)}
                response = await client.post(
                    f"{BACKEND_URL}/api/upload/image",
                    files=files,
                    headers=get_headers()
                )
                if response.status_code == 200:
                    data = response.json()
                    return f"✅ Image uploaded successfully. URL: {data.get('url')}"
                return f"❌ Image upload failed. Status: {response.status_code}, Error: {response.text}"
        except Exception as e:
            return f"❌ Error uploading image: {str(e)}"

@mcp.tool()
async def list_webpages() -> str:
    """Lists available webpages to find the correct webpage_id for adding products."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/webpage/default")
            if response.status_code == 200:
                data = response.json()
                return f"Available Webpage:\n- ID: {data.get('id')}\n- Name: {data.get('headerInfo')}\n- Owner: {data.get('user', {}).get('username')}"
            return f"⚠️ Could not list webpages. Status: {response.status_code}"
        except Exception as e:
            return f"❌ Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()
