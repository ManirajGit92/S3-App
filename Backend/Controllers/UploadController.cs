using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public UploadController(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        private bool IsMcpOrUserAuthorized()
        {
            var apiKey = Request.Headers["X-MCP-API-KEY"].ToString();
            var configApiKey = _config["McpApiKey"];
            if (!string.IsNullOrEmpty(apiKey) && apiKey == configApiKey)
            {
                return true;
            }
            return User.Identity?.IsAuthenticated ?? false;
        }

        /// <summary>
        /// POST api/upload/image
        /// Accepts a multipart/form-data file upload, stores it under wwwroot/uploads/,
        /// and returns the publicly accessible URL.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (!IsMcpOrUserAuthorized()) return Unauthorized("Invalid API Key or Not Authenticated");

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided." });

            // Validate file type (images only)
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest(new { error = "Unsupported file type. Allowed: jpg, jpeg, png, webp, gif, svg." });

            // Max 5 MB
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "File too large. Maximum size is 5 MB." });

            // Ensure upload directory exists
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename to prevent collisions
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Build the public URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var url = $"{baseUrl}/uploads/{uniqueName}";

            return Ok(new { url });
        }
    }
}
