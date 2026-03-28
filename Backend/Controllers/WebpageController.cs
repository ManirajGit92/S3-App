using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebpageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WebpageController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/webpage/default
        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultWebpage()
        {
            var adminEmail = "admin@s3app.com";
            var correctHash = "gqefEbSstSpkLvfjOd/OSqkv9l7S56twLXmNvhDsoLg="; // "123admin" in Base64
            
            var webpage = await _context.Webpages.Include(w => w.User).FirstOrDefaultAsync();

            if (webpage == null)
            {
                // Auto-seed a default webpage with sample content
                var defaultUser = new User
                {
                    Username = "admin",
                    Email = adminEmail,
                    PasswordHash = correctHash,
                    PhoneNumber = "",
                    Address = ""
                };

                webpage = new Webpage
                {
                    User = defaultUser,
                    HeaderInfo = "S3 Digital Solutions",
                    MenuInfo = "[{\"label\":\"Home\",\"link\":\"#home\"},{\"label\":\"About\",\"link\":\"#about\"},{\"label\":\"Services\",\"link\":\"#services\"},{\"label\":\"Team\",\"link\":\"#teams\"},{\"label\":\"Contact\",\"link\":\"#contact\"}]",
                    HomeSection = "<h1>Welcome to S3 Digital Solutions</h1><p>We craft innovative digital experiences that transform businesses. Our cutting-edge solutions help you stay ahead in the digital landscape.</p>",
                    AboutUsSection = "<p>Founded with a passion for technology and innovation, S3 Digital Solutions has been delivering exceptional digital services for over a decade. Our team of experts combines creativity with technical excellence to deliver solutions that make a real difference.</p><p>We believe in building long-term partnerships with our clients, understanding their unique challenges, and delivering tailored solutions that exceed expectations.</p>",
                    ServicesProductsSection = "<p>From web development and mobile apps to cloud solutions and AI integration — we offer a comprehensive suite of digital services designed to accelerate your business growth.</p>",
                    TeamsSection = "<p>Our diverse team of designers, developers, and strategists work together to bring your vision to life. With expertise spanning across multiple domains, we ensure every project receives the attention it deserves.</p>",
                    ContactUsSection = "<p>📧 contact@s3digital.com</p><p>📞 +91 98765 43210</p><p>📍 Chennai, Tamil Nadu, India</p>",
                    FooterInfo = "© 2026 S3 Digital Solutions. All rights reserved. | Built with ❤️",
                    AdditionalSections = "[]"
                };

                _context.Users.Add(defaultUser);
                _context.Webpages.Add(webpage);
                await _context.SaveChangesAsync();
            }
            else if (webpage.User != null && webpage.User.Email == adminEmail && webpage.User.PasswordHash != correctHash)
            {
                // Update password if it's the admin user and the hash is different
                webpage.User.PasswordHash = correctHash;
                await _context.SaveChangesAsync();
            }
            else if (string.IsNullOrEmpty(webpage.MenuInfo) || webpage.MenuInfo == "[]" || webpage.MenuInfo.Contains("\"link\":\"home\""))
            {
                // Fix existing webpage menu if it's minimal or uses old links
                webpage.MenuInfo = "[{\"label\":\"Home\",\"link\":\"#home\"},{\"label\":\"About\",\"link\":\"#about\"},{\"label\":\"Services\",\"link\":\"#services\"},{\"label\":\"Team\",\"link\":\"#teams\"},{\"label\":\"Contact\",\"link\":\"#contact\"}]";
                webpage.HeaderInfo = string.IsNullOrEmpty(webpage.HeaderInfo) ? "S3 Digital Solutions" : webpage.HeaderInfo;
                await _context.SaveChangesAsync();
            }

            return Ok(webpage);
        }

        // GET api/webpage/public/{uniqueId}
        [HttpGet("public/{uniqueId}")]
        public async Task<IActionResult> GetPublicWebpage(Guid uniqueId)
        {
            var user = await _context.Users
                .Include(u => u.Webpage)
                .FirstOrDefaultAsync(u => u.WebpageUniqueId == uniqueId);

            if (user == null || user.Webpage == null)
                return NotFound();

            return Ok(user.Webpage);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyWebpage()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var webpage = await _context.Webpages.FirstOrDefaultAsync(w => w.UserId == userId);
            if (webpage == null) return NotFound();

            return Ok(webpage);
        }

        [Authorize]
        [HttpPut("my")]
        public async Task<IActionResult> UpdateMyWebpage([FromBody] Webpage updatedWebpage)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var webpage = await _context.Webpages.FirstOrDefaultAsync(w => w.UserId == userId);
            if (webpage == null) return NotFound();

            webpage.HeaderInfo = updatedWebpage.HeaderInfo ?? webpage.HeaderInfo;
            webpage.MenuInfo = updatedWebpage.MenuInfo ?? webpage.MenuInfo;
            webpage.HomeSection = updatedWebpage.HomeSection ?? webpage.HomeSection;
            webpage.AboutUsSection = updatedWebpage.AboutUsSection ?? webpage.AboutUsSection;
            webpage.ServicesProductsSection = updatedWebpage.ServicesProductsSection ?? webpage.ServicesProductsSection;
            webpage.TeamsSection = updatedWebpage.TeamsSection ?? webpage.TeamsSection;
            webpage.ContactUsSection = updatedWebpage.ContactUsSection ?? webpage.ContactUsSection;
            webpage.FooterInfo = updatedWebpage.FooterInfo ?? webpage.FooterInfo;
            webpage.AdditionalSections = updatedWebpage.AdditionalSections ?? webpage.AdditionalSections;

            await _context.SaveChangesAsync();
            return Ok(webpage);
        }
    }
}
