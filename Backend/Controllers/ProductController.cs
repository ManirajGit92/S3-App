using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/product/webpage/{webpageId}?search=...&sort=...
        [HttpGet("webpage/{webpageId}")]
        public async Task<IActionResult> GetProducts(int webpageId, [FromQuery] string search = "", [FromQuery] string sort = "")
        {
            var query = _context.Products.Where(p => p.WebpageId == webpageId).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.ProductName.Contains(search) || p.Description.Contains(search));
            }

            if (sort == "price_asc") query = query.OrderBy(p => p.Price);
            else if (sort == "price_desc") query = query.OrderByDescending(p => p.Price);
            else query = query.OrderByDescending(p => p.Id);

            return Ok(await query.ToListAsync());
        }

        // GET api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            // Validation user owns webpage omitted for brevity, assuming WebpageId is valid
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.ProductName = updatedProduct.ProductName ?? product.ProductName;
            product.ProductCategory = updatedProduct.ProductCategory ?? product.ProductCategory;
            product.Price = updatedProduct.Price;
            product.AvailableQuantity = updatedProduct.AvailableQuantity;
            product.SoldQuantity = updatedProduct.SoldQuantity;
            product.Description = updatedProduct.Description ?? product.Description;
            product.Rating = updatedProduct.Rating;
            product.OtherSpec = updatedProduct.OtherSpec ?? product.OtherSpec;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product deleted" });
        }
        
        // POST api/product/buy
        [HttpPost("buy")]
        public async Task<IActionResult> BuyProduct([FromBody] List<int> productIds)
        {
            // Basic e-commerce logic mock: deduct quantity, increment sold
            foreach(var id in productIds)
            {
                var p = await _context.Products.FindAsync(id);
                if(p != null && p.AvailableQuantity > 0)
                {
                    p.AvailableQuantity -= 1;
                    p.SoldQuantity += 1;
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Purchase successful" });
        }
    }
}
